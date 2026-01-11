// models/index.js - Initialize All Models
const { sequelize } = require('../database');

// Import model definitions
const UserModel = require('./User');
const SocialAccountModel = require('./SocialAccount');
const CollaboratorMatchModel = require('./CollaboratorMatch');

// Initialize models
const User = UserModel(sequelize);
const SocialAccount = SocialAccountModel(sequelize);
const CollaboratorMatch = CollaboratorMatchModel(sequelize);

// Define relationships
User.hasMany(SocialAccount, {
  foreignKey: 'userId',
  as: 'socialAccounts'
});

SocialAccount.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User can have many matches (as the one receiving matches)
User.hasMany(CollaboratorMatch, {
  foreignKey: 'userId',
  as: 'receivedMatches'
});

// User can be matched by many users
User.hasMany(CollaboratorMatch, {
  foreignKey: 'matchedUserId',
  as: 'givenMatches'
});

CollaboratorMatch.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

CollaboratorMatch.belongsTo(User, {
  foreignKey: 'matchedUserId',
  as: 'matchedUser'
});

module.exports = {
  User,
  SocialAccount,
  CollaboratorMatch,
  sequelize
};