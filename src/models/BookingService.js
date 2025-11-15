const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookingService = sequelize.define('BookingService', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bookingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price at the time of booking'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'price * quantity'
  }
}, {
  timestamps: true,
  tableName: 'booking_services',
  indexes: [
    { fields: ['bookingId'] },
    { fields: ['serviceId'] }
  ]
});

module.exports = BookingService;
