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
  return { data, lastPage };
}

function parseLastPage(linkHeader) {
  if (!linkHeader) return null;
  const match = linkHeader.match(/page=(\d+)>; rel="last"/);
  return match ? parseInt(match[1], 10) : null;
}

class GitHubService {
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
          private: repo.private,
          updatedAt: repo.updated_at,
          createdAt: repo.created_at,
        };
      })
    );

    return { repos: enriched, totalCount };
  }

  async getOpenPrCount(accessToken, fullName) {
    try {
      const result = await fetchFromGitHub(
        `/repos/${fullName}/pulls`,
        accessToken,
        { state: 'open', per_page: 1 }
      );
      return result.lastPage || result.data.length;
    } catch {
      return 0;
    }
  }
}

module.exports = new GitHubService();
