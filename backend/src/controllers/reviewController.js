const githubService = require('../services/githubService');
const openaiService = require('../services/openaiService');
const Review = require('../models/Review');
const Comment = require('../models/Comment');
const Repository = require('../models/Repository');
const PullRequest = require('../models/PullRequest');

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

    const userId = req.user.sub;

    // Find the repository record
    const repository = await Repository.findByFullName(`${owner}/${repo}`);
    if (!repository) {
      return res.status(404).json({ success: false, message: 'Repository not found in database' });
    }

    // Find or create the pull_request record
    let prRecord = await PullRequest.findByRepoAndNumber(repository.id, prNumber);
    if (!prRecord) {
      prRecord = await PullRequest.create({
        repository_id: repository.id,
        pr_number: prNumber,
        title: `#${prNumber}`,
        author_id: userId,
        state: 'open',
      });
    }

    // Check for existing review for this specific PR
    const existingReviews = await Review.findByPullRequest(prRecord.id);
    const existing = existingReviews.find((r) => r.status === 'completed');

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
      pull_request_id: prRecord.id,
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
    const result = await Review.dashboard(req.user.sub);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
