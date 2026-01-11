// models/CollaboratorMatch.js - Collaborator Match Model
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CollaboratorMatch = sequelize.define('CollaboratorMatch', {
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
      onDelete: 'CASCADE',
      comment: 'User who received the match'
    },
    matchedUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'User who was matched'
    },
    matchScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Overall match score (0-100)'
    },
    distanceMiles: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Distance between users in miles'
    },
    matchReasons: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Detailed reasons for the match (geo, audience, engagement, etc.)'
    },
    collaborationFormats: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'AI-suggested collaboration formats'
    },
    audienceInsights: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Audience overlap and complementarity insights'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'contacted', 'accepted', 'rejected', 'archived']]
      }
    },
    outreachSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    outreachSentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'collaborator_matches',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['matchedUserId']
      },
      {
        fields: ['matchScore']
      },
      {
        fields: ['status']
      },
      {
        unique: true,
        fields: ['userId', 'matchedUserId']
      }
    ]
  });

  return CollaboratorMatch;
};
