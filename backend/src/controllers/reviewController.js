const githubService = require('../services/githubService');
const openaiService = require('../services/openaiService');
const Review = require('../models/Review');
const Comment = require('../models/Comment');

exports.create = async (req, res, next) => {
  try {
    const { owner, repo, prNumber } = req.body;

    if (!owner || !repo || !prNumber) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          !owner ? "Body field 'owner' is required" : null,
          !repo ? "Body field 'repo' is required" : null,
          !prNumber ? "Body field 'prNumber' is required" : null,
        ].filter(Boolean),
      });
    }

    // Try to find an existing review for this PR by this user
    const userId = req.user.id;
    const existingReviews = await Review.findByReviewer(userId);
    const existing = existingReviews.find(
      (r) => r.pull_request_id && r.status === 'completed'
    );

    // Fetch PR details and changed files from GitHub
    const prDetail = await githubService.getPullRequestDetail(
      req.user.accessToken,
      owner,
      repo,
      prNumber
    );

    if (!prDetail) {
      return res.status(404).json({ success: false, message: 'Pull request not found' });
    }

    const repoInfo = { fullName: `${owner}/${repo}` };
    const changedFiles = prDetail.files || [];

    // Call AI
    const aiResult = await openaiService.generateReview(repoInfo, prDetail, changedFiles);

    // Create the review record in the database
    const review = await Review.create({
      pull_request_id: null, // Not storing in DB, just returning
      reviewer_id: userId,
      status: 'completed',
      score: aiResult.overallScore,
      summary: aiResult.summary,
      total_issues:
        aiResult.bugs.length +
        aiResult.security.length +
        aiResult.performance.length +
        aiResult.readability.length +
        aiResult.maintainability.length +
        aiResult.codeSmells.length,
      raw_output: JSON.stringify(aiResult),
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        review: {
          id: review.id,
          score: aiResult.overallScore,
          summary: aiResult.summary,
          totalIssues: review.total_issues,
          completedAt: review.completed_at,
        },
        categories: {
          bugs: aiResult.bugs,
          security: aiResult.security,
          performance: aiResult.performance,
          readability: aiResult.readability,
          maintainability: aiResult.maintainability,
          codeSmells: aiResult.codeSmells,
        },
      },
    });
  } catch (error) {
    if (error.message?.includes('JSON') || error.message?.includes('Invalid')) {
      return res.status(502).json({
        success: false,
        message: 'AI returned an unexpected response',
      });
    }
    next(error);
  }
};

exports.getByPullRequest = async (req, res, next) => {
  try {
    const { pullRequestId } = req.params;
    const reviews = await Review.findByPullRequest(pullRequestId);
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

exports.dashboard = async (req, res, next) => {
  try {
    const result = await Review.dashboard(req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
