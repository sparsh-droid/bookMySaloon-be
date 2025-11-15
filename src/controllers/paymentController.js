const { Payment, Booking } = require('../models');
const logger = require('../config/logger');

/**
 * Mock payment gateway simulation
 */
const mockPaymentGateway = async (amount, bookingId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 90% success rate
      const success = Math.random() > 0.1;

      if (success) {
        resolve({
          success: true,
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: 'success',
          amount,
          timestamp: new Date().toISOString(),
          gatewayResponse: {
            code: '200',
            message: 'Payment processed successfully'
          }
        });
      } else {
        resolve({
          success: false,
          status: 'failed',
          amount,
          timestamp: new Date().toISOString(),
          gatewayResponse: {
            code: '400',
            message: 'Payment declined by bank'
          }
        });
      }
    }, 1500); // Simulate network delay
  });
};

/**
 * Process payment for booking
 */
const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    const userId = req.user.userId;

    // Verify booking exists and belongs to user
    const booking = await Booking.findOne({
      where: { id: bookingId, userId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking already paid'
      });
    }

    // Handle "pay at shop" method
    if (paymentMethod === 'at_shop') {
      await booking.update({
        paymentMethod: 'at_shop',
        paymentStatus: 'pending',
        status: 'confirmed'
      });

      const payment = await Payment.create({
        bookingId,
        amount: booking.totalAmount,
        paymentMethod: 'at_shop',
        status: 'pending'
      });

      logger.info(`Pay at shop selected for booking: ${bookingId}`);

      return res.status(200).json({
        success: true,
        message: 'Booking confirmed. Pay at shop.',
        data: {
          payment,
          booking: {
            id: booking.id,
            confirmationCode: booking.confirmationCode,
            status: booking.status,
            paymentMethod: booking.paymentMethod
          }
        }
      });
    }

    // Process online payment (mock)
    if (paymentMethod === 'online') {
      logger.info(`Processing online payment for booking: ${bookingId}`);

      const paymentResult = await mockPaymentGateway(booking.totalAmount, bookingId);

      if (paymentResult.success) {
        // Create payment record
        const payment = await Payment.create({
          bookingId,
          amount: booking.totalAmount,
          paymentMethod: 'online',
          status: 'success',
          transactionId: paymentResult.transactionId,
          gatewayResponse: paymentResult.gatewayResponse,
          paidAt: new Date()
        });

        // Update booking
        await booking.update({
          paymentMethod: 'online',
          paymentStatus: 'paid',
          status: 'confirmed'
        });

        logger.info(`Payment successful for booking: ${bookingId}, Transaction: ${paymentResult.transactionId}`);

        return res.status(200).json({
          success: true,
          message: 'Payment processed successfully',
          data: {
            payment,
            booking: {
              id: booking.id,
              confirmationCode: booking.confirmationCode,
              status: booking.status,
              paymentStatus: booking.paymentStatus
            }
          }
        });
      } else {
        // Payment failed
        const payment = await Payment.create({
          bookingId,
          amount: booking.totalAmount,
          paymentMethod: 'online',
          status: 'failed',
          gatewayResponse: paymentResult.gatewayResponse
        });

        await booking.update({
          paymentStatus: 'failed'
        });

        logger.warn(`Payment failed for booking: ${bookingId}`);

        return res.status(400).json({
          success: false,
          message: 'Payment failed',
          data: {
            payment,
            reason: paymentResult.gatewayResponse.message
          }
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid payment method'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment details
 */
const getPaymentByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    // Verify booking belongs to user
    const booking = await Booking.findOne({
      where: { id: bookingId, userId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const payment = await Payment.findOne({
      where: { bookingId }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentByBooking
};
