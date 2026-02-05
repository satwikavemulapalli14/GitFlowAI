const githubService = require('../services/githubService');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const repositoriesController = {
  list: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.access_token) {
      return res.status(401).json({
        success: false,
        message: 'GitHub token not found. Please re-authenticate.',
      });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.per_page, 10) || 10, 1), 100);
    const search = (req.query.search || '').trim();

    const result = await githubService.getRepositories(user.access_token, {
      page,
      perPage,
      search,
    });

    const totalPages = Math.ceil(result.totalCount / perPage);

    res.json({
      success: true,
      data: result.repos,
      pagination: {
        page,
        perPage,
        total: result.totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  }),
};

module.exports = repositoriesController;
