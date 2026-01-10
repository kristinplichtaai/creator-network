// models/SocialAccount.js - Social Media Account Model
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SocialAccount = sequelize.define('SocialAccount', {
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
      },
      onDelete: 'CASCADE'
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['instagram', 'tiktok', 'youtube']]
      }
    },
    platformUserId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profileData: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    followers: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    following: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    postCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    engagementRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0
    },
    profileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastSyncedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'social_accounts',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['platform', 'platformUserId']
      },
      {
        fields: ['userId']
      }
    ]
  });

  return SocialAccount;
};