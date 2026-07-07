const { Repository } = require('../models');

const GITHUB_API_BASE = 'https://api.github.com';

async function fetchFromGitHub(endpoint, accessToken, params = {}) {
  const url = new URL(`${GITHUB_API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitFlowAI',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`GitHub API error ${response.status}: ${error.message}`);
  }

  const linkHeader = response.headers.get('Link');
  const lastPage = parseLastPage(linkHeader);

  const data = await response.json();
  return { data, lastPage, headers: response.headers };
}

function parseLastPage(linkHeader) {
  if (!linkHeader) return null;
  const match = linkHeader.match(/page=(\d+)>; rel="last"/);
  return match ? parseInt(match[1], 10) : null;
}

function mapRepoData(repo, ownerId) {
  return {
    github_id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    default_branch: repo.default_branch,
    owner_id: ownerId,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    open_issues: repo.open_issues_count,
    visibility: repo.visibility || (repo.private ? 'private' : 'public'),
    owner_name: repo.owner?.login,
    owner_avatar_url: repo.owner?.avatar_url,
    is_active: true,
  };
}

class GitHubService {
  async syncUserRepos(accessToken, userId) {
    let page = 1;
    let synced = 0;

    while (true) {
      const result = await fetchFromGitHub('/user/repos', accessToken, {
        page,
        per_page: 100,
        sort: 'updated',
        direction: 'desc',
        type: 'all',
      });

      const repos = result.data;
      if (repos.length === 0) break;

      for (const repo of repos) {
        await Repository.upsert(repo.id, mapRepoData(repo, userId));
        synced++;
      }

      if (!result.lastPage || page >= result.lastPage) break;
      page++;
    }

    return synced;
  }

  async getRepositories(accessToken, { page = 1, perPage = 10, search = '' } = {}) {
    let repos, totalCount;

    if (search) {
      const q = `${search} in:name fork:true`;
      const result = await fetchFromGitHub('/search/repositories', accessToken, {
        q,
        page,
        per_page: perPage,
        sort: 'updated',
      });
      repos = result.data.items;
      totalCount = result.data.total_count;
    } else {
      const result = await fetchFromGitHub('/user/repos', accessToken, {
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc',
        type: 'all',
      });
      repos = result.data;
      totalCount = result.lastPage ? result.lastPage * perPage : repos.length;
    }

    const enriched = await Promise.all(
      repos.map(async (repo) => {
        let openPrCount = 0;
        try {
          const prResult = await fetchFromGitHub(
            `/repos/${repo.full_name}/pulls`,
            accessToken,
            { state: 'open', per_page: 1 }
          );
          openPrCount = prResult.lastPage || prResult.data.length;
        } catch {
          // Some repos may not have PR access
        }

        return {
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count,
          openPrCount,
          defaultBranch: repo.default_branch,
          url: repo.html_url,
          visibility: repo.visibility || (repo.private ? 'private' : 'public'),
          ownerName: repo.owner?.login,
          ownerAvatarUrl: repo.owner?.avatar_url,
          updatedAt: repo.updated_at,
          createdAt: repo.created_at,
        };
      })
    );

    return { repos: enriched, totalCount };
  }

  async getPullRequests(accessToken, owner, repo, { state = 'all', page = 1, perPage = 10, sort = 'updated', direction = 'desc' } = {}) {
    const result = await fetchFromGitHub(`/repos/${owner}/${repo}/pulls`, accessToken, {
      state,
      page,
      per_page: perPage,
      sort,
      direction,
    });

    const pulls = result.data;

    // Fetch detailed stats (additions, deletions, changed_files) for each PR
    const detailed = await Promise.all(
      pulls.map(async (pr) => {
        let detail = {};
        try {
          detail = await fetchFromGitHub(`/repos/${owner}/${repo}/pulls/${pr.number}`, accessToken);
        } catch {
          // Stats may not be available for some PRs
        }

        return {
          id: pr.id,
          number: pr.number,
          title: pr.title,
          description: pr.body,
          state: pr.state,
          author: pr.user?.login,
          authorAvatar: pr.user?.avatar_url,
          headBranch: pr.head?.ref,
          baseBranch: pr.base?.ref,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          closedAt: pr.closed_at,
          mergedAt: pr.merged_at,
          isMerged: !!pr.merged_at,
          labels: pr.labels?.map((l) => ({ name: l.name, color: l.color })),
          changedFiles: detail.data?.changed_files || 0,
          additions: detail.data?.additions || 0,
          deletions: detail.data?.deletions || 0,
          comments: pr.comments,
          reviewComments: pr.review_comments,
          url: pr.html_url,
        };
      })
    );

    const totalCount = result.lastPage ? result.lastPage * perPage : pulls.length;

    return { pulls: detailed, totalCount };
  }

  async getPullRequestDetail(accessToken, owner, repo, prNumber) {
    const result = await fetchFromGitHub(`/repos/${owner}/${repo}/pulls/${prNumber}`, accessToken);
    const pr = result.data;

    let commits = [];
    try {
      const commitResult = await fetchFromGitHub(`/repos/${owner}/${repo}/pulls/${prNumber}/commits`, accessToken);
      commits = commitResult.data.map((c) => ({
        sha: c.sha,
        message: c.commit.message,
        authorName: c.commit.author?.name,
        authorUsername: c.author?.login,
        authorAvatar: c.author?.avatar_url,
        date: c.commit.author?.date,
        url: c.html_url,
      }));
    } catch {
      // commits may not be available
    }

    let files = [];
    try {
      const filesResult = await fetchFromGitHub(`/repos/${owner}/${repo}/pulls/${prNumber}/files`, accessToken);
      files = filesResult.data.map((f) => ({
        filename: f.filename,
        previousFilename: f.previous_filename || null,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes,
        patch: f.patch || null,
        blobUrl: f.blob_url,
        rawUrl: f.raw_url,
        contentsUrl: f.contents_url,
      }));
    } catch {
      // files may not be available
    }

    let reviews = [];
    try {
      const reviewsResult = await fetchFromGitHub(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, accessToken);
      reviews = reviewsResult.data.map((r) => ({
        id: r.id,
        author: r.user?.login,
        authorAvatar: r.user?.avatar_url,
        state: r.state,
        body: r.body,
        submittedAt: r.submitted_at,
        commitId: r.commit_id,
      }));
    } catch {
      // reviews may not be available
    }

    const reviewStates = reviews.map((r) => r.state);
    let reviewStatus = 'pending';
    if (reviewStates.includes('approved')) reviewStatus = 'approved';
    else if (reviewStates.includes('changes_requested')) reviewStatus = 'changes_requested';
    else if (reviewStates.some((s) => ['approved', 'changes_requested', 'commented'].includes(s))) reviewStatus = 'reviewed';

    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      description: pr.body,
      state: pr.state,
      author: pr.user?.login,
      authorAvatar: pr.user?.avatar_url,
      authorUrl: pr.user?.html_url,
      headBranch: pr.head?.ref,
      headSha: pr.head?.sha,
      baseBranch: pr.base?.ref,
      baseSha: pr.base?.sha,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      closedAt: pr.closed_at,
      mergedAt: pr.merged_at,
      isMerged: !!pr.merged_at,
      labels: pr.labels?.map((l) => ({ name: l.name, color: l.color })),
      milestone: pr.milestone ? { title: pr.milestone.title, number: pr.milestone.number } : null,
      changedFiles: pr.changed_files,
      additions: pr.additions,
      deletions: pr.deletions,
      comments: pr.comments,
      reviewComments: pr.review_comments,
      url: pr.html_url,
      commitCount: commits.length,
      commits,
      files,
      reviews,
      reviewStatus,
    };
  }

  async getRepoFromGitHub(accessToken, fullName) {
    const result = await fetchFromGitHub(`/repos/${fullName}`, accessToken);

    const repo = result.data;
    let openPrCount = 0;
    try {
      const prResult = await fetchFromGitHub(
        `/repos/${repo.full_name}/pulls`,
        accessToken,
        { state: 'open', per_page: 1 }
      );
      openPrCount = prResult.lastPage || prResult.data.length;
    } catch {
      // Some repos may not have PR access
    }

    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      openPrCount,
      defaultBranch: repo.default_branch,
      url: repo.html_url,
      visibility: repo.visibility || (repo.private ? 'private' : 'public'),
      ownerName: repo.owner?.login,
      ownerAvatarUrl: repo.owner?.avatar_url,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
    };
  }
}

module.exports = new GitHubService();
