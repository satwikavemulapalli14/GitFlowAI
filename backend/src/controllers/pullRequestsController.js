const githubService = require('../services/githubService');

exports.list = async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'all', page = 1, perPage = 10, sort = 'updated', direction = 'desc' } = req.query;

    const result = await githubService.getPullRequests(req.user.accessToken, owner, repo, {
      state,
      page: parseInt(page, 10),
      perPage: parseInt(perPage, 10),
      sort,
      direction,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getByNumber = async (req, res, next) => {
  try {
    const { owner, repo, prNumber } = req.params;

    const pr = await githubService.getPullRequestDetail(req.user.accessToken, owner, repo, prNumber);

    if (!pr) {
      return res.status(404).json({ error: 'Pull request not found' });
    }

    res.json(pr);
  } catch (error) {
    next(error);
  }
};
