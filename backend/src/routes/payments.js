const express = require('express');
const router = express.Router();
const { processPayment, getPaymentByBooking } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { createPaymentValidator } = require('../middleware/validators');

// All payment routes require authentication
router.use(authenticate);

router.post('/process', createPaymentValidator, processPayment);
router.get('/booking/:bookingId', getPaymentByBooking);

module.exports = router;
