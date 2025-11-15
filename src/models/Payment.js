const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('online', 'at_shop'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'payments',
  indexes: [
    { fields: ['bookingId'] },
    { fields: ['transactionId'] },
    { fields: ['status'] }
  ]
});

module.exports = Payment;
