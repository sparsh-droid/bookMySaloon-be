const express = require('express');
const router = express.Router();
const {
  getSalons,
  getSalonById,
  getServicesBySalon,
  getAvailableSlots
} = require('../controllers/salonController');
const { getSalonsValidator, getSalonByIdValidator } = require('../middleware/validators');

// Public routes (no authentication required for browsing)
router.get('/', getSalonsValidator, getSalons);
router.get('/:id', getSalonByIdValidator, getSalonById);
router.get('/:id/services', getSalonByIdValidator, getServicesBySalon);
router.get('/:id/slots', getSalonByIdValidator, getAvailableSlots);

module.exports = router;
