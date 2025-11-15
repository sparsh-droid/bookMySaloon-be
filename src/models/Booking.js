const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  salonId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'salons',
      key: 'id'
    }
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  bookingTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('online', 'at_shop'),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  confirmationCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    unique: true
  }
}, {
  timestamps: true,
  tableName: 'bookings',
  indexes: [
    { fields: ['userId'] },
    { fields: ['salonId'] },
    { fields: ['bookingDate', 'bookingTime'] },
    { fields: ['status'] },
    { fields: ['confirmationCode'] }
  ]
});

module.exports = Booking;
