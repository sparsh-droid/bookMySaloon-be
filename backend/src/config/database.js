const { Sequelize } = require('sequelize');
const logger = require('./logger');

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./database.sqlite';

const sequelize = new Sequelize(databaseUrl, {
  logging: (msg) => logger.debug(msg),
  dialectOptions: {
    // For PostgreSQL SSL in production
    ...(process.env.NODE_ENV === 'production' && databaseUrl.includes('postgres') && {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    })
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    return sequelize;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = { sequelize, connectDatabase };
