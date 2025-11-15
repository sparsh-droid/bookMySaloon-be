const { Salon, Service } = require('../models');
const { calculateDistance } = require('../utils/distance');
const { Op } = require('sequelize');

/**
 * Get all salons with optional location-based filtering
 */
const getSalons = async (req, res, next) => {
  try {
    const {
      latitude,
      longitude,
      radius = 10, // Default 10km
      page = 1,
      limit = 50, // Default 50 salons per page
      search
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = { isActive: true };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Fetch salons
    const salons = await Salon.findAll({
      where: whereClause,
      include: [{
        model: Service,
        as: 'services',
        where: { isActive: true },
        required: false,
        attributes: ['id', 'name', 'price', 'duration', 'category', 'gender']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC']]
    });

    let results = salons.map(salon => {
      const salonData = salon.toJSON();
      // Calculate starting price from services
      if (salonData.services && salonData.services.length > 0) {
        const prices = salonData.services.map(s => parseFloat(s.price));
        salonData.startingPrice = Math.min(...prices).toFixed(2);
      } else {
        salonData.startingPrice = null;
      }
      return salonData;
    });

    // Calculate distances if location provided
    // COMMENTED OUT: Location-based filtering disabled
    // if (latitude && longitude) {
    //   const userLat = parseFloat(latitude);
    //   const userLon = parseFloat(longitude);

    //   results = results.map(salon => ({
    //     ...salon,
    //     distance: calculateDistance(
    //       userLat,
    //       userLon,
    //       parseFloat(salon.latitude),
    //       parseFloat(salon.longitude)
    //     ).toFixed(2)
    //   }));

    //   // Filter by radius
    //   results = results.filter(salon => parseFloat(salon.distance) <= parseFloat(radius));

    //   // Sort by distance
    //   results.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    // }

    res.status(200).json({
      success: true,
      data: {
        salons: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: results.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get salon by ID
 */
const getSalonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const salon = await Salon.findByPk(id, {
      include: [{
        model: Service,
        as: 'services',
        where: { isActive: true },
        required: false,
        attributes: ['id', 'name', 'description', 'price', 'duration', 'category', 'gender']
      }]
    });

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    const salonData = salon.toJSON();

    // Calculate starting price
    if (salonData.services && salonData.services.length > 0) {
      const prices = salonData.services.map(s => parseFloat(s.price));
      salonData.startingPrice = Math.min(...prices).toFixed(2);

      // Group services by gender
      salonData.servicesByGender = {
        male: salonData.services.filter(s => s.gender === 'male'),
        female: salonData.services.filter(s => s.gender === 'female'),
        unisex: salonData.services.filter(s => s.gender === 'unisex')
      };
    }

    res.status(200).json({
      success: true,
      data: { salon: salonData }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get services by salon ID
 */
const getServicesBySalon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const salon = await Salon.findByPk(id);

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    const services = await Service.findAll({
      where: {
        salonId: id,
        isActive: true
      },
      order: [['category', 'ASC'], ['price', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: { services }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available time slots for a salon on a specific date
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const salon = await Salon.findByPk(id);

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: 'Salon not found'
      });
    }

    // Generate time slots (simplified version)
    const slots = [];
    const openingHour = parseInt(salon.openingTime.split(':')[0]);
    const closingHour = parseInt(salon.closingTime.split(':')[0]);

    for (let hour = openingHour; hour < closingHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    res.status(200).json({
      success: true,
      data: {
        date,
        slots,
        salonHours: {
          opening: salon.openingTime,
          closing: salon.closingTime
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalons,
  getSalonById,
  getServicesBySalon,
  getAvailableSlots
};
