// server.js - Express Backend with Database Integration
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection, initializeDatabase } = require('./database');
const { User, SocialAccount, CollaboratorMatch } = require('./models');
const { router: authRouter, authenticateToken } = require('./auth');
const matchingService = require('./services/matchingService');
const aiService = require('./services/aiService');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Configuration
const config = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI
  },
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    redirectUri: process.env.TIKTOK_REDIRECT_URI
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: process.env.YOUTUBE_REDIRECT_URI,
    apiKey: process.env.YOUTUBE_API_KEY
  }
};

// In-memory token store
const tokenStore = new Map();

// ==================== INSTAGRAM API ====================
class InstagramAPI {
  static async getProfile(accessToken) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/me`,
        {
          params: {
            fields: 'id,username,account_type,media_count',
            access_token: accessToken
          }
        }
      );
      
      const insights = await axios.get(
        `https://graph.instagram.com/${response.data.id}`,
        {
          params: {
            fields: 'followers_count,follows_count',
            access_token: accessToken
          }
        }
      ).catch(() => ({ data: { followers_count: 0, follows_count: 0 } }));

      return { ...response.data, ...insights.data };
    } catch (error) {
      console.error('Instagram API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  static async getRecentMedia(accessToken, userId) {
    try {
      const response = await axios.get(
        `https://graph.instagram.com/${userId}/media`,
        {
          params: {
            fields: 'id,caption,media_type,timestamp,like_count,comments_count,permalink',
            limit: 20,
            access_token: accessToken
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Instagram Media Error:', error.response?.data || error.message);
      return [];
    }
  }

  static calculateEngagement(posts, followerCount) {
    if (!posts.length || !followerCount) return 0;
    
    const totalEngagement = posts.reduce((sum, post) => 
      sum + (post.like_count || 0) + (post.comments_count || 0), 0
    );
    const avgEngagement = totalEngagement / posts.length;
    return ((avgEngagement / followerCount) * 100).toFixed(2);
  }

  static extractTopics(posts) {
    const allCaptions = posts.map(p => p.caption || '').join(' ').toLowerCase();
    const words = allCaptions.match(/\b\w{4,}\b/g) || [];
    const frequency = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
}

// ==================== YOUTUBE API ====================
class YouTubeAPI {
  static async getChannel(accessToken) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/channels',
        {
          params: {
            part: 'snippet,statistics',
            mine: true
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.data.items[0];
    } catch (error) {
      console.error('YouTube API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  static async getRecentVideos(accessToken, channelId) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            part: 'snippet',
            channelId: channelId,
            order: 'date',
            maxResults: 20,
            type: 'video'
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      const videoIds = response.data.items.map(item => item.id.videoId).join(',');
      const stats = await axios.get(
        'https://www.googleapis.com/youtube/v3/videos',
        {
          params: {
            part: 'statistics',
            id: videoIds
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      return response.data.items.map((item, idx) => ({
        ...item,
        statistics: stats.data.items[idx]?.statistics || {}
      }));
    } catch (error) {
      console.error('YouTube Videos Error:', error.response?.data || error.message);
      return [];
    }
  }

  static calculateEngagement(videos, subscriberCount) {
    if (!videos.length || !subscriberCount) return 0;
    
    const totalEngagement = videos.reduce((sum, video) => {
      const stats = video.statistics || {};
      return sum + 
        parseInt(stats.likeCount || 0) + 
        parseInt(stats.commentCount || 0);
    }, 0);
    
    const avgEngagement = totalEngagement / videos.length;
    return ((avgEngagement / subscriberCount) * 100).toFixed(2);
  }
}

// ==================== DATA NORMALIZER ====================
function normalizeCreatorData(platform, profileData, mediaData) {
  let normalized = {
    platform,
    lastUpdated: new Date().toISOString()
  };

  switch(platform) {
    case 'instagram':
      normalized = {
        ...normalized,
        platformUserId: profileData.id,
        username: profileData.username,
        displayName: profileData.username,
        followers: profileData.followers_count || 0,
        following: profileData.follows_count || 0,
        postCount: profileData.media_count || 0,
        engagement: InstagramAPI.calculateEngagement(mediaData, profileData.followers_count),
        recentTopics: InstagramAPI.extractTopics(mediaData),
        profileUrl: `https://instagram.com/${profileData.username}`
      };
      break;

    case 'youtube':
      const stats = profileData.statistics;
      normalized = {
        ...normalized,
        platformUserId: profileData.id,
        username: profileData.snippet.customUrl || profileData.snippet.title,
        displayName: profileData.snippet.title,
        followers: parseInt(stats.subscriberCount) || 0,
        following: 0,
        postCount: parseInt(stats.videoCount) || 0,
        engagement: YouTubeAPI.calculateEngagement(mediaData, parseInt(stats.subscriberCount)),
        recentTopics: [],
        profileUrl: `https://youtube.com/channel/${profileData.id}`
      };
      break;
  }

  return normalized;
}

// ==================== ROUTES ====================

// Authentication routes
app.use('/auth', authRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// OAuth initiation
app.get('/auth/:platform/init', (req, res) => {
  const { platform } = req.params;
  let authUrl;

  switch(platform) {
    case 'instagram':
      authUrl = `https://api.instagram.com/oauth/authorize?client_id=${config.instagram.clientId}&redirect_uri=${config.instagram.redirectUri}&scope=user_profile,user_media&response_type=code`;
      break;
    case 'tiktok':
      authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${config.tiktok.clientKey}&scope=user.info.basic,video.list&response_type=code&redirect_uri=${config.tiktok.redirectUri}`;
      break;
    case 'youtube':
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.youtube.clientId}&redirect_uri=${config.youtube.redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&access_type=offline`;
      break;
    default:
      return res.status(400).json({ error: 'Invalid platform' });
  }

  res.json({ authUrl });
});

// OAuth callback
app.post('/auth/:platform/callback', async (req, res) => {
  const { platform } = req.params;
  const { code } = req.body;

  try {
    let tokenResponse;

    switch(platform) {
      case 'instagram':
        tokenResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
          client_id: config.instagram.clientId,
          client_secret: config.instagram.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: config.instagram.redirectUri,
          code
        });
        break;
      case 'youtube':
        tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
          client_id: config.youtube.clientId,
          client_secret: config.youtube.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: config.youtube.redirectUri
        });
        break;
    }

    const accessToken = tokenResponse.data.access_token;
    const userId = `${platform}_${Date.now()}`;
    
    tokenStore.set(userId, { platform, accessToken });
    
    res.json({ userId, success: true });
  } catch (error) {
    console.error('OAuth Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get creator profile (with database saving and user association)
app.get('/api/creator/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const loggedInUserId = req.user.id;
  
  const tokenData = tokenStore.get(userId);
  if (!tokenData) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const { platform, accessToken } = tokenData;
    let profile, media;

    switch(platform) {
      case 'instagram':
        profile = await InstagramAPI.getProfile(accessToken);
        media = await InstagramAPI.getRecentMedia(accessToken, profile.id);
        break;
      case 'youtube':
        profile = await YouTubeAPI.getChannel(accessToken);
        media = await YouTubeAPI.getRecentVideos(accessToken, profile.id);
        break;
    }

    const normalized = normalizeCreatorData(platform, profile, media);
    
    // Save to database WITH user association
    try {
      await SocialAccount.upsert({
        userId: loggedInUserId,
        platformUserId: normalized.platformUserId,
        platform: normalized.platform,
        username: normalized.username,
        displayName: normalized.displayName,
        followers: normalized.followers,
        following: normalized.following,
        postCount: normalized.postCount,
        engagementRate: parseFloat(normalized.engagement),
        profileUrl: normalized.profileUrl,
        accessToken: accessToken,
        lastSyncedAt: new Date(),
        profileData: { recentTopics: normalized.recentTopics }
      });
      console.log('✓ Saved social account to database for user:', loggedInUserId);
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    res.json(normalized);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user's saved social accounts
app.get('/api/user/social-accounts', authenticateToken, async (req, res) => {
  try {
    const accounts = await SocialAccount.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    const formatted = accounts.map(acc => ({
      id: acc.id,
      platform: acc.platform,
      username: acc.username,
      displayName: acc.displayName,
      followers: acc.followers,
      following: acc.following,
      postCount: acc.postCount,
      engagement: acc.engagementRate,
      profileUrl: acc.profileUrl,
      recentTopics: acc.profileData?.recentTopics || [],
      lastUpdated: acc.lastSyncedAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    res.status(500).json({ error: 'Failed to fetch social accounts' });
  }
});

// ==================== COLLABORATOR MATCHING ENDPOINTS ====================

// Update user location
app.put('/api/user/location', authenticateToken, async (req, res) => {
  try {
    const { city, state, country, zipCode, latitude, longitude, searchRadius } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update location fields
    if (city) user.city = city;
    if (state) user.state = state;
    if (country) user.country = country;
    if (zipCode) user.zipCode = zipCode;
    if (latitude) user.latitude = latitude;
    if (longitude) user.longitude = longitude;
    if (searchRadius) user.searchRadius = searchRadius;

    await user.save();

    res.json({
      message: 'Location updated successfully',
      user: {
        id: user.id,
        city: user.city,
        state: user.state,
        country: user.country,
        searchRadius: user.searchRadius
      }
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get user profile with location
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'city', 'state', 'country', 'zipCode', 'latitude', 'longitude', 'searchRadius']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Find and generate collaborator matches
app.post('/api/matches/generate', authenticateToken, async (req, res) => {
  try {
    const { maxDistance, minFollowers, maxFollowers, platforms, minEngagement, limit } = req.body;

    const options = {
      maxDistance,
      minFollowers,
      maxFollowers,
      platforms,
      minEngagement,
      limit
    };

    const result = await matchingService.generateMatches(req.user.id, options);

    res.json(result);
  } catch (error) {
    console.error('Error generating matches:', error);
    res.status(500).json({ error: error.message || 'Failed to generate matches' });
  }
});

// Get saved matches
app.get('/api/matches', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;

    const matches = await matchingService.getSavedMatches(req.user.id, status);

    // Format matches for response
    const formatted = matches.map(match => ({
      id: match.id,
      matchScore: match.matchScore,
      distance: match.distanceMiles,
      status: match.status,
      outreachSent: match.outreachSent,
      outreachSentAt: match.outreachSentAt,
      collaborationFormats: match.collaborationFormats,
      audienceInsights: match.audienceInsights,
      matchReasons: match.matchReasons,
      notes: match.notes,
      createdAt: match.createdAt,
      matchedUser: {
        id: match.matchedUser.id,
        name: match.matchedUser.name,
        city: match.matchedUser.city,
        state: match.matchedUser.state,
        socialAccounts: match.matchedUser.socialAccounts.map(acc => ({
          id: acc.id,
          platform: acc.platform,
          username: acc.username,
          displayName: acc.displayName,
          followers: acc.followers,
          following: acc.following,
          postCount: acc.postCount,
          engagement: acc.engagementRate,
          profileUrl: acc.profileUrl,
          recentTopics: acc.profileData?.recentTopics || []
        }))
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Update match status
app.put('/api/matches/:matchId/status', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { status, notes } = req.body;

    const match = await matchingService.updateMatchStatus(matchId, req.user.id, status, notes);

    res.json({
      message: 'Match status updated',
      match
    });
  } catch (error) {
    console.error('Error updating match status:', error);
    res.status(500).json({ error: error.message || 'Failed to update match status' });
  }
});

// Generate AI outreach message
app.post('/api/matches/:matchId/outreach', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get the match with full details
    const match = await CollaboratorMatch.findOne({
      where: {
        id: matchId,
        userId: req.user.id
      },
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

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Get current user data
    const currentUser = await User.findByPk(req.user.id, {
      include: [
        {
          model: SocialAccount,
          as: 'socialAccounts'
        }
      ]
    });

    // Prepare target creator data
    const targetCreator = {
      displayName: match.matchedUser.name || match.matchedUser.socialAccounts[0]?.displayName,
      username: match.matchedUser.socialAccounts[0]?.username,
      platform: match.matchedUser.socialAccounts[0]?.platform,
      followers: match.matchedUser.socialAccounts[0]?.followers,
      engagement: match.matchedUser.socialAccounts[0]?.engagementRate,
      recentTopics: match.matchedUser.socialAccounts[0]?.profileData?.recentTopics || [],
      distance: parseFloat(match.distanceMiles)
    };

    // Generate AI outreach message
    const outreachMessage = await aiService.generateOutreachMessage(
      currentUser,
      targetCreator,
      match.collaborationFormats || []
    );

    res.json({
      message: outreachMessage,
      targetCreator: {
        name: targetCreator.displayName,
        username: targetCreator.username,
        platform: targetCreator.platform
      }
    });
  } catch (error) {
    console.error('Error generating outreach:', error);
    res.status(500).json({ error: 'Failed to generate outreach message' });
  }
});

// Mark outreach as sent
app.post('/api/matches/:matchId/outreach/sent', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await matchingService.markOutreachSent(matchId, req.user.id);

    res.json({
      message: 'Outreach marked as sent',
      match
    });
  } catch (error) {
    console.error('Error marking outreach as sent:', error);
    res.status(500).json({ error: error.message || 'Failed to mark outreach as sent' });
  }
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Server starting without database.');
    }
    
    if (dbConnected) {
      await initializeDatabase();
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📱 Ready to handle social media API integrations`);
      if (dbConnected) {
        console.log(`🗄️  Database connected and ready`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;