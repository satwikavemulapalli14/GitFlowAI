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
