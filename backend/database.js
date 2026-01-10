// database.js - PostgreSQL Database Connection Setup
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance with connection string from .env
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Supabase
    }
  },
  logging: false, // Set to console.log to see SQL queries (useful for debugging)
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to database:', error.message);
    return false;
  }
}

// Initialize database (create tables if they don't exist)
async function initializeDatabase() {
  try {
    // Sync all models with database
    // { alter: true } updates existing tables to match models
    await sequelize.sync({ alter: true });
    console.log('✓ Database tables synchronized');
    return true;
  } catch (error) {
    console.error('✗ Failed to sync database:', error.message);
    return false;
  }
}

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
};