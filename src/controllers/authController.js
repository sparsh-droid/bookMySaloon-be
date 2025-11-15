const { User, OTP } = require('../models');
const { generateToken } = require('../utils/jwt');
const { generateOTP, addMinutes } = require('../utils/helpers');
const logger = require('../config/logger');

/**
 * Send OTP to phone number
 */
const sendOTP = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = addMinutes(new Date(), 10); // 10 minutes expiry

    // Invalidate previous OTPs for this phone number
    await OTP.update(
      { isUsed: true },
      { where: { phoneNumber, isUsed: false } }
    );

    // Create new OTP
    await OTP.create({
      phoneNumber,
      otp,
      expiresAt,
      isUsed: false,
      attempts: 0
    });

    logger.info(`OTP sent to ${phoneNumber}: ${otp}`);

    // In production, send OTP via SMS service
    // For development, return OTP in response
    const response = {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: '10 minutes'
    };

    if (process.env.NODE_ENV === 'development') {
      response.otp = otp; // Only for development
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and login
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Find OTP
    const otpRecord = await OTP.findOne({
      where: {
        phoneNumber,
        otp,
        isUsed: false
      },
      order: [['createdAt', 'DESC']]
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts'
      });
    }

    // Mark OTP as used
    await otpRecord.update({ isUsed: true });

    // Find or create user
    let user = await User.findOne({ where: { phoneNumber } });

    if (!user) {
      user = await User.create({
        phoneNumber,
        isVerified: true,
        lastLoginAt: new Date()
      });
    } else {
      await user.update({
        isVerified: true,
        lastLoginAt: new Date()
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phoneNumber: user.phoneNumber
    });

    logger.info(`User logged in: ${phoneNumber}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'phoneNumber', 'name', 'email', 'isVerified', 'lastLoginAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({
      ...(name && { name }),
      ...(email && { email })
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  getProfile,
  updateProfile
};
