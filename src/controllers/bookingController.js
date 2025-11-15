const { Booking, BookingService, Salon, Service, User, Payment } = require('../models');
const { generateConfirmationCode } = require('../utils/helpers');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');

/**
 * Create a new booking with cart (multiple services)
 */
const createBooking = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { salonId, services, bookingDate, bookingTime, paymentMethod, notes } = req.body;
    const userId = req.user.userId;

    // Validation: services array must not be empty
    if (!services || !Array.isArray(services) || services.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'At least one service must be selected'
      });
    }

    // Validate date and time - must be in future
    const now = new Date();
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);

    if (bookingDateTime <= now) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments in the past. Please select a future date and time.'
      });
    }

    // Validate booking date is not too far in future (max 90 days)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);

    if (bookingDateTime > maxDate) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments more than 90 days in advance'
      });
    }

    // Verify salon exists
    const salon = await Salon.findByPk(salonId);
    if (!salon || !salon.isActive) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Salon not found or inactive'
      });
    }

    // Verify all services exist and belong to salon
    const serviceIds = services.map(s => s.serviceId);
    const dbServices = await Service.findAll({
      where: {
        id: serviceIds,
        salonId,
        isActive: true
      }
    });

    if (dbServices.length !== serviceIds.length) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'One or more services not found or inactive'
      });
    }

    // Create a map for quick lookup
    const serviceMap = {};
    dbServices.forEach(svc => {
      serviceMap[svc.id] = svc;
    });

    // Calculate total amount
    let totalAmount = 0;
    const bookingServiceData = [];

    for (const item of services) {
      const service = serviceMap[item.serviceId];
      if (!service) continue;

      const quantity = parseInt(item.quantity) || 1;
      const price = parseFloat(service.price);
      const subtotal = price * quantity;

      totalAmount += subtotal;

      bookingServiceData.push({
        serviceId: service.id,
        quantity,
        price,
        subtotal
      });
    }

    // Check if slot is already booked
    const existingBooking = await Booking.findOne({
      where: {
        salonId,
        bookingDate,
        bookingTime,
        status: { [require('sequelize').Op.in]: ['pending', 'confirmed'] }
      }
    });

    if (existingBooking) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: 'Time slot already booked'
      });
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // Determine initial status based on payment method
    const initialStatus = paymentMethod === 'at_shop' ? 'confirmed' : 'pending';
    const initialPaymentStatus = paymentMethod === 'at_shop' ? 'pending' : 'pending';

    // Create booking
    const booking = await Booking.create({
      userId,
      salonId,
      bookingDate,
      bookingTime,
      totalAmount: totalAmount.toFixed(2),
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      status: initialStatus,
      notes,
      confirmationCode
    }, { transaction: t });

    // Create booking services
    for (const item of bookingServiceData) {
      await BookingService.create({
        bookingId: booking.id,
        ...item
      }, { transaction: t });
    }

    await t.commit();

    // Fetch the created booking with services
    const createdBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Salon,
          as: 'salon',
          attributes: ['id', 'name', 'address', 'city', 'phoneNumber']
        },
        {
          model: Service,
          as: 'services',
          through: {
            attributes: ['quantity', 'price', 'subtotal']
          }
        }
      ]
    });

    logger.info(`Booking created: ${booking.id} for user ${userId} with ${services.length} services`);

    res.status(201).json({
      success: true,
      message: paymentMethod === 'at_shop'
        ? 'Booking confirmed! Pay at the salon.'
        : 'Booking created successfully',
      data: { booking: createdBooking }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * Get all bookings for current user
 */
const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 20 } = req.query;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const offset = (page - 1) * limit;

    const bookings = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Salon,
          as: 'salon',
          attributes: ['id', 'name', 'address', 'city', 'phoneNumber', 'imageUrl']
        },
        {
          model: Service,
          as: 'services',
          through: {
            attributes: ['quantity', 'price', 'subtotal']
          },
          attributes: ['id', 'name', 'duration', 'category', 'gender']
        },
        {
          model: Payment,
          as: 'payment',
          required: false
        }
      ],
      order: [['bookingDate', 'DESC'], ['bookingTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      data: {
        bookings: bookings.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: bookings.count
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findOne({
      where: { id, userId },
      include: [
        {
          model: Salon,
          as: 'salon'
        },
        {
          model: Service,
          as: 'services',
          through: {
            attributes: ['quantity', 'price', 'subtotal']
          }
        },
        {
          model: Payment,
          as: 'payment',
          required: false
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findOne({
      where: { id, userId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    await booking.update({ status: 'cancelled' });

    // If payment was made, mark for refund
    if (booking.paymentStatus === 'paid') {
      await booking.update({ paymentStatus: 'refunded' });
    }

    logger.info(`Booking cancelled: ${booking.id}`);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
};
