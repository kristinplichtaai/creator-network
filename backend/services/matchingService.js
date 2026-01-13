// services/matchingService.js - Collaborator Matching Service
const { User, SocialAccount, CollaboratorMatch } = require('../models');
const { Op } = require('sequelize');
const aiService = require('./aiService');

class MatchingService {
  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in miles
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find potential collaborators for a user
   */
  async findMatches(userId, options = {}) {
    const {
      maxDistance = null, // If null, use user's searchRadius
      minFollowers = 0,
      maxFollowers = null,
      platforms = null, // Array of platforms to filter by
      minEngagement = 0,
      limit = 20
    } = options;

    console.log('🔍 Finding matches for user:', userId);
    console.log('   Search options:', { maxDistance, minFollowers, maxFollowers, platforms, minEngagement, limit });

    // Get current user with their location and social accounts
    const currentUser = await User.findByPk(userId, {
      include: [
        {
          model: SocialAccount,
          as: 'socialAccounts'
        }
      ]
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    console.log('   Current user:', currentUser.name || currentUser.email);
    console.log('   Location:', currentUser.city, currentUser.state);
    console.log('   Coordinates:', currentUser.latitude, currentUser.longitude);
    console.log('   Social accounts:', currentUser.socialAccounts?.length || 0);

    if (!currentUser.latitude || !currentUser.longitude) {
      throw new Error('User location not set. Please update your profile with your location in the Location Setup tab.');
    }

    if (!currentUser.socialAccounts || currentUser.socialAccounts.length === 0) {
      throw new Error('No social accounts connected. Please connect at least one social media account in the Connected Platforms tab.');
    }

    const searchRadius = maxDistance || currentUser.searchRadius || 50;
    console.log('   Search radius:', searchRadius, 'miles');

    // Convert latitude/longitude to numbers (Sequelize DECIMAL returns strings)
    const userLat = parseFloat(currentUser.latitude);
    const userLon = parseFloat(currentUser.longitude);

    // Calculate bounding box for initial filtering (approximation for performance)
    // 1 degree latitude ≈ 69 miles
    const latRange = searchRadius / 69;
    const lonRange = searchRadius / (69 * Math.cos(this.toRadians(userLat)));

    // Find potential users within approximate range
    const whereClause = {
      id: { [Op.ne]: userId }, // Exclude current user
      latitude: {
        [Op.between]: [userLat - latRange, userLat + latRange]
      },
      longitude: {
        [Op.between]: [userLon - lonRange, userLon + lonRange]
      }
    };

    console.log('   Searching bounding box:', {
      latRange: `${(userLat - latRange).toFixed(4)} to ${(userLat + latRange).toFixed(4)}`,
      lonRange: `${(userLon - lonRange).toFixed(4)} to ${(userLon + lonRange).toFixed(4)}`
    });

    const potentialMatches = await User.findAll({
      where: whereClause,
      include: [
        {
          model: SocialAccount,
          as: 'socialAccounts',
          where: {
            ...(minFollowers > 0 && { followers: { [Op.gte]: minFollowers } }),
            ...(maxFollowers && { followers: { [Op.lte]: maxFollowers } }),
            ...(platforms && { platform: { [Op.in]: platforms } }),
            ...(minEngagement > 0 && { engagementRate: { [Op.gte]: minEngagement } })
          },
          required: true
        }
      ],
      limit: limit * 2 // Get more than needed since we'll filter by exact distance
    });

    console.log('   Found', potentialMatches.length, 'potential matches in database');

    // Calculate exact distances and filter
    const matchesWithDistance = potentialMatches
      .map(match => {
        const distance = this.calculateDistance(
          userLat,
          userLon,
          parseFloat(match.latitude),
          parseFloat(match.longitude)
        );

        return {
          user: match,
          distance,
          socialAccounts: match.socialAccounts
        };
      })
      .filter(m => m.distance <= searchRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    console.log('   After distance filtering:', matchesWithDistance.length, 'matches within', searchRadius, 'miles');

    if (matchesWithDistance.length > 0) {
      console.log('   Matches:');
      matchesWithDistance.forEach((m, idx) => {
        console.log(`     ${idx + 1}. ${m.user.name || m.user.email} - ${m.distance.toFixed(1)} miles (${m.user.city}, ${m.user.state})`);
      });
    } else {
      console.log('   ⚠️  No matches found. Possible reasons:');
      console.log('      - No other users have set their location');
      console.log('      - No users within your search radius');
      console.log('      - Other users don\'t have social accounts connected');
      console.log('   💡 Try running: npm run seed (to add test users)');
    }

    return {
      currentUser,
      matches: matchesWithDistance
    };
  }

  /**
   * Generate and save matches with AI analysis
   */
  async generateMatches(userId, options = {}) {
    const { currentUser, matches } = await this.findMatches(userId, options);

    if (matches.length === 0) {
      return {
        message: 'No potential collaborators found in your area. Try increasing your search radius.',
        matches: []
      };
    }

    const currentUserAccounts = currentUser.socialAccounts || [];
    const savedMatches = [];

    for (const match of matches) {
      try {
        // For each potential match, analyze compatibility with user's social accounts
        const matchAnalyses = [];

        for (const currentAccount of currentUserAccounts) {
          for (const matchAccount of match.socialAccounts) {
            // Prepare creator data for AI analysis
            const creator1Data = {
              platform: currentAccount.platform,
              followers: currentAccount.followers,
              engagement: currentAccount.engagementRate,
              recentTopics: currentAccount.profileData?.recentTopics || []
            };

            const creator2Data = {
              platform: matchAccount.platform,
              followers: matchAccount.followers,
              engagement: matchAccount.engagementRate,
              recentTopics: matchAccount.profileData?.recentTopics || []
            };

            // Analyze audience compatibility
            const audienceAnalysis = await aiService.analyzeAudienceCompatibility(
              creator1Data,
              creator2Data
            );

            // Suggest collaboration formats
            const collaborationFormats = await aiService.suggestCollaborationFormats(
              creator1Data,
              creator2Data,
              match.distance
            );

            matchAnalyses.push({
              audienceAnalysis,
              collaborationFormats,
              currentPlatform: currentAccount.platform,
              matchPlatform: matchAccount.platform
            });
          }
        }

        // Calculate overall match score
        const avgCompatibility =
          matchAnalyses.reduce((sum, a) => sum + (a.audienceAnalysis?.compatibilityScore || 50), 0) /
          matchAnalyses.length;

        // Distance bonus: closer = higher score
        const distanceScore = Math.max(0, 100 - (match.distance / 2)); // Max 100 points at 0 miles, 0 points at 200+ miles
        const finalScore = (avgCompatibility * 0.7 + distanceScore * 0.3).toFixed(2);

        // Get best collaboration formats
        const bestFormats = matchAnalyses.length > 0 ? matchAnalyses[0].collaborationFormats : [];
        const bestAudienceInsights = matchAnalyses.length > 0 ? matchAnalyses[0].audienceAnalysis : {};

        // Save or update the match
        const [savedMatch, created] = await CollaboratorMatch.upsert({
          userId: currentUser.id,
          matchedUserId: match.user.id,
          matchScore: finalScore,
          distanceMiles: match.distance.toFixed(2),
          matchReasons: {
            distance: `${match.distance.toFixed(1)} miles away`,
            compatibility: avgCompatibility.toFixed(1),
            platforms: matchAnalyses.map(a => `${a.currentPlatform} ↔ ${a.matchPlatform}`)
          },
          collaborationFormats: bestFormats,
          audienceInsights: bestAudienceInsights,
          status: 'pending'
        });

        // Fetch the complete match with user data
        const completeMatch = await CollaboratorMatch.findByPk(savedMatch.id, {
          include: [
            {
              model: User,
              as: 'matchedUser',
              include: [
                {
                  model: SocialAccount,
                  as: 'socialAccounts'
                }
              ]
            }
          ]
        });

        savedMatches.push(completeMatch);
      } catch (error) {
        console.error(`Error generating match for user ${match.user.id}:`, error.message);
        // Continue with other matches
      }
    }

    return {
      message: `Found ${savedMatches.length} potential collaborators`,
      matches: savedMatches
    };
  }

  /**
   * Get saved matches for a user
   */
  async getSavedMatches(userId, status = null) {
    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const matches = await CollaboratorMatch.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'matchedUser',
          include: [
            {
              model: SocialAccount,
              as: 'socialAccounts'
            }
          ]
        }
      ],
      order: [['matchScore', 'DESC']]
    });

    return matches;
  }

  /**
   * Update match status
   */
  async updateMatchStatus(matchId, userId, status, notes = null) {
    const match = await CollaboratorMatch.findOne({
      where: {
        id: matchId,
        userId: userId
      }
    });

    if (!match) {
      throw new Error('Match not found');
    }

    match.status = status;
    if (notes) {
      match.notes = notes;
    }

    await match.save();
    return match;
  }

  /**
   * Mark outreach as sent
   */
  async markOutreachSent(matchId, userId) {
    const match = await CollaboratorMatch.findOne({
      where: {
        id: matchId,
        userId: userId
      }
    });

    if (!match) {
      throw new Error('Match not found');
    }

    match.outreachSent = true;
    match.outreachSentAt = new Date();
    match.status = 'contacted';

    await match.save();
    return match;
  }
}

module.exports = new MatchingService();
