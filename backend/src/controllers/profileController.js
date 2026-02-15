const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const Review = require('../models/Review');

exports.index = async (req, res, next) => {
  try {
    const userId = req.user.sub;

    const [user, reviewCount, avgScoreResult] = await Promise.all([
      User.findById(userId),
      Review.countByReviewer(userId),
      Review.averageScoreByReviewer(userId),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { access_token, ...safeUser } = user;

    res.json({
      success: true,
      data: {
        user: safeUser,
        stats: {
          reviewsGiven: reviewCount,
          averageScore: avgScoreResult,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await UserSettings.findByUserId(req.user.sub);
    if (!settings) {
      settings = await UserSettings.upsert(req.user.sub, {});
    }
    const { openai_api_key, ...safe } = settings;
    res.json({
      success: true,
      data: {
        ...safe,
        openai_api_key: openai_api_key ? '••••••••' + openai_api_key.slice(-4) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const allowed = ['dark_mode', 'email_notifications', 'slack_integration', 'review_reminders', 'openai_api_key'];
    const updateData = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const settings = await UserSettings.upsert(req.user.sub, updateData);
    const { openai_api_key, ...safe } = settings;
    res.json({
      success: true,
      data: {
        ...safe,
        openai_api_key: openai_api_key ? '••••••••' + openai_api_key.slice(-4) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};
