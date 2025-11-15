const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
} = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { createBookingValidator, getBookingByIdValidator } = require('../middleware/validators');

// All booking routes require authentication
router.use(authenticate);

router.post('/', createBookingValidator, createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBookingByIdValidator, getBookingById);
router.patch('/:id/cancel', getBookingByIdValidator, cancelBooking);

module.exports = router;
