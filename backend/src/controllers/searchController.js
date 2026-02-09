const Search = require('../models/Search');

exports.global = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const query = (req.query.q || '').trim();
    const type = req.query.type || 'all';
    const repositoryId = req.query.repository_id || '';
    const dateFrom = req.query.dateFrom || '';
    const dateTo = req.query.dateTo || '';
    const scoreMin = req.query.scoreMin || '';
    const scoreMax = req.query.scoreMax || '';
    const status = req.query.status || '';
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.perPage, 10) || 20, 1), 100);

    const result = await Search.global(userId, {
      query, type, repositoryId, dateFrom, dateTo, scoreMin, scoreMax, status, page, perPage,
    });

    const totalPages = Math.ceil(result.total / perPage);

    res.json({
      success: true,
      data: {
        results: result.rows,
        summary: result.summary,
      },
      pagination: {
        page,
        perPage,
        total: result.total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.repositories = async (req, res, next) => {
  try {
    const repos = await Search.repositories(req.user.sub);
    res.json({ success: true, data: repos });
  } catch (error) {
    next(error);
  }
};
