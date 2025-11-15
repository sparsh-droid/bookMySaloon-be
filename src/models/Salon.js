const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Salon = sequelize.define('Salon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  zipCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  openingTime: {
    type: DataTypes.TIME,
    defaultValue: '09:00:00'
  },
  closingTime: {
    type: DataTypes.TIME,
    defaultValue: '21:00:00'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'salons',
  indexes: [
    { fields: ['latitude', 'longitude'] },
    { fields: ['city'] },
    { fields: ['isActive'] }
  ]
});

module.exports = Salon;
