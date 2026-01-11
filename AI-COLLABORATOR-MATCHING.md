# AI Collaborator Matching Feature

This document describes the AI-powered collaborator matching system that helps creators find and connect with local content creators for collaboration opportunities.

## Overview

The AI Collaborator Matching feature uses geographic location, audience analysis, and AI-powered insights to match content creators with complementary audiences in their area. It suggests collaboration formats and generates personalized outreach messages.

## Features

### 1. **Geographic Matching**
- Users set their location (city, state, coordinates)
- Define search radius (default: 50 miles)
- System finds creators within the specified radius using Haversine formula for accurate distance calculation

### 2. **AI-Powered Audience Analysis**
- Analyzes audience compatibility between creators
- Evaluates:
  - Topic overlap
  - Audience size compatibility
  - Engagement rate similarity
  - Platform alignment
- Provides compatibility scores (0-100)
- Identifies strengths and potential concerns

### 3. **Collaboration Format Suggestions**
- AI suggests specific, actionable collaboration formats
- Differentiates between IRL (in-person) and virtual collaborations
- Considers:
  - Geographic proximity
  - Content types
  - Audience interests
  - Platform capabilities

### 4. **Intelligent Outreach Generation**
- Creates personalized, genuine outreach messages
- References specific creator content and topics
- Highlights geographic proximity
- Suggests concrete collaboration ideas
- Maintains professional yet conversational tone

### 5. **Match Management**
- Track match status: pending, contacted, accepted, rejected, archived
- Mark outreach as sent with timestamp
- Add notes to matches
- View detailed audience insights

## Setup Requirements

### Backend Environment Variables

Add these to your `backend/.env` file:

```bash
# AI API Keys (choose one or both)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# The system will prefer Anthropic Claude if both are provided
```

### Database

The system automatically creates the following tables:
- `users` - Enhanced with location fields (city, state, country, latitude, longitude, searchRadius)
- `collaborator_matches` - Stores match results and AI insights

Run the backend to auto-migrate the database:
```bash
cd backend
npm run dev
```

## User Flow

### Step 1: Connect Social Media Platforms
1. Navigate to "Connected Platforms" tab
2. Click on Instagram, YouTube, or TikTok
3. Complete OAuth authentication
4. System fetches profile data, followers, engagement rates, and content topics

### Step 2: Set Location
1. Navigate to "Location Setup" tab
2. Option A: Click "Use My Current Location" for automatic geolocation
3. Option B: Manually enter city, state, and ZIP code
4. Set preferred search radius (5-500 miles)
5. Click "Save Location"

### Step 3: Find Collaborators
1. Navigate to "Find Collaborators" tab
2. Click "Find Collaborators" button
3. System searches for creators within your radius
4. AI analyzes audience compatibility
5. Matches are displayed with:
   - Match score (0-100)
   - Distance in miles
   - Collaboration format suggestions
   - Audience compatibility insights

### Step 4: Generate Outreach
1. Click "Generate Outreach" on any match
2. AI creates a personalized message based on:
   - Your profile and their profile
   - Suggested collaboration formats
   - Geographic proximity
   - Content topics
3. Edit the message if desired
4. Copy and send via your preferred platform
5. Mark as "Sent" to track outreach

## API Endpoints

### User Profile & Location

**Update User Location**
```
PUT /api/user/location
Authorization: Bearer <token>
Body: {
  "city": "San Francisco",
  "state": "CA",
  "country": "US",
  "zipCode": "94102",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "searchRadius": 50
}
```

**Get User Profile**
```
GET /api/user/profile
Authorization: Bearer <token>
```

### Collaborator Matching

**Generate Matches**
```
POST /api/matches/generate
Authorization: Bearer <token>
Body: {
  "maxDistance": 50,           // Optional, defaults to user's searchRadius
  "minFollowers": 1000,        // Optional
  "maxFollowers": 100000,      // Optional
  "platforms": ["instagram"],  // Optional
  "minEngagement": 2.0,        // Optional
  "limit": 10                  // Optional, defaults to 20
}
```

**Get Saved Matches**
```
GET /api/matches?status=pending
Authorization: Bearer <token>
```

**Update Match Status**
```
PUT /api/matches/:matchId/status
Authorization: Bearer <token>
Body: {
  "status": "contacted",
  "notes": "Sent DM on Instagram"
}
```

**Generate AI Outreach Message**
```
POST /api/matches/:matchId/outreach
Authorization: Bearer <token>
```

**Mark Outreach as Sent**
```
POST /api/matches/:matchId/outreach/sent
Authorization: Bearer <token>
```

## AI Services

### Anthropic Claude (Preferred)
- Model: `claude-3-5-sonnet-20241022`
- Used for outreach generation and audience analysis
- More nuanced, conversational output
- Better at understanding context and tone

### OpenAI GPT-4 (Fallback)
- Model: `gpt-4`
- Activated if Anthropic key is not available
- Reliable for structured analysis

### Fallback Templates
If no AI API key is configured, the system uses template-based generation with basic algorithms for compatibility scoring.

## Matching Algorithm

### Match Score Calculation
```
Match Score = (Audience Compatibility * 0.7) + (Distance Score * 0.3)

Where:
- Audience Compatibility: 0-100 from AI analysis
- Distance Score: 100 - (distance_in_miles / 2), capped at 0-100
```

### Compatibility Factors
1. **Follower Count Similarity** - Similar sized audiences work well together
2. **Engagement Rate Alignment** - Similar engagement suggests compatible audience quality
3. **Topic Overlap** - Shared content themes increase collaboration value
4. **Platform Compatibility** - Same platform enables cross-promotion
5. **Geographic Proximity** - Closer distance enables IRL collaborations

## Best Practices

### For Users
1. **Complete Profile** - Connect all your social platforms for better matching
2. **Accurate Location** - Use precise coordinates for best distance calculations
3. **Adjust Search Radius** - Start with 25-50 miles, expand if needed
4. **Personalize Outreach** - Edit AI-generated messages to add your personal touch
5. **Track Responses** - Update match status to stay organized

### For Developers
1. **API Rate Limits** - AI services have rate limits, implement queueing for batch operations
2. **Geocoding** - OpenStreetMap Nominatim has rate limits (1 req/sec), consider caching
3. **Database Indexing** - Ensure indexes on latitude/longitude for performance
4. **Error Handling** - Gracefully fall back to templates if AI services fail

## Troubleshooting

### "User location not set" error
- User must complete location setup before generating matches
- Navigate to Location Setup tab and save location

### No matches found
- Try increasing search radius
- Check if other users in the area have connected accounts
- Reduce filter criteria (remove min/max followers)

### AI outreach generation fails
- Verify API keys are correctly set in .env
- Check API key balance/quota
- System will fall back to template-based generation

### Geocoding errors
- Rate limited by OpenStreetMap - wait and retry
- Invalid city/state combination - verify location data
- Use "Current Location" for most accurate results

## Future Enhancements

Potential improvements for the matching system:

1. **Email Integration** - Send outreach directly from the platform
2. **Calendar Integration** - Schedule collaboration meetings
3. **Multi-Platform Matching** - Match YouTube creators with Instagram creators
4. **Industry/Niche Filtering** - Filter by specific content categories
5. **Collaboration History** - Track successful past collaborations
6. **Analytics Dashboard** - Show match acceptance rates, response times
7. **Smart Notifications** - Alert when new matches appear in your area
8. **Batch Messaging** - Generate outreach for multiple matches at once

## Security & Privacy

- User locations are stored securely in the database
- Coordinates are only used for distance calculations
- Matches are private - only you can see your matches
- Outreach messages are generated but not sent automatically
- No data is shared with other users without explicit action

## Support

For issues or questions:
1. Check this documentation
2. Review the API endpoint responses for error messages
3. Verify environment variables are correctly set
4. Check browser console for frontend errors
5. Review backend logs for detailed error information
