require('dotenv').config();
const { sequelize } = require('../config/database');
const logger = require('../config/logger');
const models = require('../models');

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');

    // Sync all models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });

    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
