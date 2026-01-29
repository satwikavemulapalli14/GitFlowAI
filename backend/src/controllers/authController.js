const authService = require('../services/authService');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const authController = {
  githubRedirect: asyncHandler(async (req, res) => {
    // Passport handles the redirect via the GitHub strategy
    // This endpoint is a placeholder; Passport's authenticate middleware
    // is applied directly in the route definition
  }),

  githubCallback: asyncHandler(async (req, res) => {
    const token = authService.generateToken(req.user);

    // Redirect to frontend with token in URL fragment
    res.redirect(`${req.frontendUrl || 'http://localhost:5173'}/login?token=${token}`);
  }),

  me: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.sub);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  }),

  logout: asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),
};

module.exports = authController;
