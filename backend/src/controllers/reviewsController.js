const Review = require('../models/Review');

exports.list = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(req.query.perPage, 10) || 20, 1), 100);
    const search = (req.query.search || '').trim();
    const sort = req.query.sort || 'completed_at';
    const order = req.query.order || 'desc';

    const result = await Review.findAllForUser(userId, { page, perPage, search, sort, order });

    const totalPages = Math.ceil(result.total / perPage);

    res.json({
      success: true,
      data: result.rows,
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

exports.getById = async (req, res, next) => {
  try {
    const review = await Review.findByIdWithDetails(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    let categories = { bugs: [], security: [], performance: [], readability: [], maintainability: [], codeSmells: [] };
    try {
      if (review.raw_output) {
        const parsed = typeof review.raw_output === 'string' ? JSON.parse(review.raw_output) : review.raw_output;
        categories = {
          bugs: parsed.bugs || [],
          security: parsed.security || [],
          performance: parsed.performance || [],
          readability: parsed.readability || [],
          maintainability: parsed.maintainability || [],
          codeSmells: parsed.codeSmells || [],
        };
      }
    } catch {
      // raw_output may be malformed
    }

    res.json({
      success: true,
      data: {
        id: review.id,
        score: review.score,
        summary: review.summary,
        totalIssues: review.total_issues,
        completedAt: review.completed_at,
        createdAt: review.created_at,
        repoFullName: review.repo_full_name,
        repoName: review.repo_name,
        repoOwner: review.repo_owner,
        repoUrl: review.repo_url,
        prNumber: review.pr_number,
        prTitle: review.pr_title,
        prState: review.pr_state,
        headBranch: review.head_branch,
        baseBranch: review.base_branch,
        categories,
        categoryCounts: {
          bugs: categories.bugs.length,
          security: categories.security.length,
          performance: categories.performance.length,
          readability: categories.readability.length,
          maintainability: categories.maintainability.length,
          codeSmells: categories.codeSmells.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.reviewer_id !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Review.delete(req.params.id);

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
