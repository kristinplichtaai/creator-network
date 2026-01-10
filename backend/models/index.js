// models/index.js - Initialize All Models
const { sequelize } = require('../database');

// Import model definitions
const UserModel = require('./User');
const SocialAccountModel = require('./SocialAccount');

// Initialize models
const User = UserModel(sequelize);
const SocialAccount = SocialAccountModel(sequelize);

// Define relationships
User.hasMany(SocialAccount, {
  foreignKey: 'userId',
  as: 'socialAccounts'
});

SocialAccount.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  User,
  SocialAccount,
  sequelize
};