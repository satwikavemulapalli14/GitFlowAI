const githubService = require('../services/githubService');
const { User, Repository } = require('../models');
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
    const perPage = Math.min(Math.max(parseInt(req.query.per_page, 10) || 12, 1), 100);
    const search = (req.query.search || '').trim();
    const language = (req.query.language || '').trim();
    const shouldSync = req.query.sync === 'true';

    // Sync from GitHub when requested
    if (shouldSync) {
      await githubService.syncUserRepos(user.access_token, user.id);
    }

    // Fetch from database with filters
    const result = await Repository.findByOwner(user.id, {
      page,
      perPage,
      search,
      language,
    });

    const languages = await Repository.findDistinctLanguages(user.id);

    const totalPages = Math.ceil(result.total / perPage);

    res.json({
      success: true,
      data: result.rows,
      languages,
      pagination: {
        page,
        perPage,
        total: result.total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const repo = await Repository.findById(req.params.id);
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    // Ensure the repo belongs to this user
    if (repo.owner_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      data: repo,
    });
  }),
};

module.exports = repositoriesController;
