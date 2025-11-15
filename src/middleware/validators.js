const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validators
const sendOtpValidator = [
  body('phoneNumber')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{8,}$/)
    .withMessage('Invalid phone number format'),
  validate
];

const verifyOtpValidator = [
  body('phoneNumber')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{8,}$/)
    .withMessage('Invalid phone number format'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  validate
];

// Salon validators
const getSalonsValidator = [
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Radius must be between 1 and 100 km'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
];

const getSalonByIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid salon ID'),
  validate
];

// Booking validators
const createBookingValidator = [
  body('salonId')
    .isUUID()
    .withMessage('Invalid salon ID'),
  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service is required'),
  body('services.*.serviceId')
    .isUUID()
    .withMessage('Invalid service ID'),
  body('services.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('bookingDate')
    .isDate()
    .withMessage('Invalid booking date'),
  body('bookingTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('paymentMethod')
    .isIn(['online', 'at_shop'])
    .withMessage('Payment method must be either "online" or "at_shop"'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  validate
];

const getBookingByIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid booking ID'),
  validate
];

// Payment validators
const createPaymentValidator = [
  body('bookingId')
    .isUUID()
    .withMessage('Invalid booking ID'),
  body('paymentMethod')
    .isIn(['online', 'at_shop'])
    .withMessage('Payment method must be either "online" or "at_shop"'),
  validate
];

module.exports = {
  sendOtpValidator,
  verifyOtpValidator,
  getSalonsValidator,
  getSalonByIdValidator,
  createBookingValidator,
  getBookingByIdValidator,
  createPaymentValidator
};
