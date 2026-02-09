const Review = require('../models/Review');

exports.stats = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const data = await Review.analytics(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
