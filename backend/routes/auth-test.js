const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Public endpoint - no auth required
router.get('/public', (req, res) => {
  res.json({
    success: true,
    message: 'This is a public endpoint',
    user: null
  });
});

// Protected endpoint - requires valid token
router.get('/protected', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected endpoint',
    user: req.user
  });
});

// Admin endpoint - requires admin role
router.get('/admin', requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'This is an admin-only endpoint',
    user: req.user
  });
});

// Optional auth endpoint - works with or without token
router.get('/optional', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'This endpoint works with or without authentication',
    authenticated: !!req.user,
    user: req.user || null
  });
});

// Test endpoint to verify token
router.post('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user,
    tokenInfo: {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;