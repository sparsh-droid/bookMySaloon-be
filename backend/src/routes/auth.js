const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, getProfile, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { sendOtpValidator, verifyOtpValidator } = require('../middleware/validators');
const { otpLimiter, authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/send-otp', otpLimiter, sendOtpValidator, sendOTP);
router.post('/verify-otp', authLimiter, verifyOtpValidator, verifyOTP);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
