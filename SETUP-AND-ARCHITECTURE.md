# Complete Setup Guide: AI Collaborator Matching

## 🚀 Quick Start (Get It Working Now)

### Step 1: Configure Database

Your `.env` file needs a real database URL. Here are your options:

#### Option A: Use Supabase (Recommended - Free & Easy)

1. Go to https://supabase.com/
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)
6. Update `backend/.env`:

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
```

#### Option B: Use Local PostgreSQL

```bash
# Install PostgreSQL locally
brew install postgresql  # Mac
sudo apt install postgresql  # Linux

# Start PostgreSQL
brew services start postgresql  # Mac
sudo service postgresql start  # Linux

# Create database
createdb creator_network

# Update backend/.env
DATABASE_URL=postgresql://localhost:5432/creator_network
```

### Step 2: Seed Test Data

```bash
cd backend
npm run seed
```

This creates 5 test users with locations and social accounts.

### Step 3: Start Services

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 4: Test Matching

1. Go to http://localhost:3000
2. Login as `test1@example.com` / `password123`
3. Click "Find Collaborators" tab
4. Click "Find Collaborators" button
5. **You should see 3-4 matches!**

---

## 🏗️ System Architecture

The AI Collaborator Matching system consists of 4 main layers:

### Layer 1: Frontend (React)
- **Components:**
  - `LocationSetup.js` - Capture user location
  - `CollaboratorMatches.js` - Display matches & outreach
  - `LocalCreatorNetwork.js` - Main coordinator

### Layer 2: Backend API (Express)
- **Endpoints:**
  - `PUT /api/user/location` - Save user location
  - `POST /api/matches/generate` - Find & generate matches
  - `GET /api/matches` - Retrieve saved matches
  - `POST /api/matches/:id/outreach` - Generate AI outreach

### Layer 3: Business Logic (Services)
- **matchingService.js:**
  - Geographic distance calculation (Haversine)
  - User filtering by location
  - Match scoring algorithm

- **aiService.js:**
  - Audience compatibility analysis
  - Collaboration format suggestions
  - Personalized outreach generation

### Layer 4: Data (PostgreSQL)
- **Tables:**
  - `users` - User profiles with location data
  - `social_accounts` - Connected social media profiles
  - `collaborator_matches` - Saved match results

---

## 🔍 How Matching Works: Detailed Explanation

### Phase 1: User Discovery (Geographic Search)

**Input:** Current user's location + search radius

**Algorithm:**
```javascript
1. Get user's coordinates (latitude, longitude)
2. Calculate bounding box:
   - latRange = searchRadius / 69 miles per degree
   - lonRange = searchRadius / (69 * cos(latitude))
3. Query database for users within bounding box
4. Exclude current user
5. Filter by social account requirements
```

**Example:**
```
User in San Francisco: 37.7749°N, 122.4194°W
Search radius: 50 miles
Bounding box:
  - Lat: 37.05°N to 38.50°N
  - Lon: -123.20°W to -121.64°W
```

### Phase 2: Distance Calculation (Haversine Formula)

For each potential match, calculate exact distance:

```javascript
Haversine Formula:
- a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
- c = 2 × atan2(√a, √(1−a))
- distance = R × c  (where R = 3959 miles)
```

**Why Haversine?**
- Accounts for Earth's curvature
- Accurate for distances up to ~500 miles
- More precise than simple lat/lon delta

### Phase 3: Match Scoring

**Components:**

1. **Audience Compatibility Score (0-100)** - AI analyzes:
   - Follower count similarity (similar sizes work well)
   - Engagement rate compatibility
   - Topic overlap
   - Platform alignment

2. **Distance Score (0-100)**:
   ```
   Distance Score = max(0, 100 - (distance_in_miles / 2))
   ```
   - 0 miles = 100 points
   - 50 miles = 75 points
   - 100 miles = 50 points
   - 200+ miles = 0 points

3. **Final Match Score**:
   ```
   Match Score = (Audience Compatibility × 0.7) + (Distance Score × 0.3)
   ```
   - 70% weight on audience fit
   - 30% weight on proximity

**Example Calculation:**
```
User A (SF): 15K followers, 4.5% engagement
User B (Oakland): 18K followers, 5.1% engagement
Distance: 12.3 miles

Audience Compatibility: 85/100 (similar size, good engagement)
Distance Score: 100 - (12.3 / 2) = 93.85
Final Match Score: (85 × 0.7) + (93.85 × 0.3) = 87.66/100
```

### Phase 4: AI Analysis (For Each Match)

**Step 1: Audience Compatibility Analysis**

AI (Claude/GPT-4) evaluates:
```
Input: Both creators' profiles
Output: {
  compatibilityScore: 85,
  topicOverlap: "medium",
  audienceSizeCompatibility: "similar",
  strengths: ["Geographic proximity", "Similar engagement"],
  concerns: ["Different platforms"],
  recommendation: "highly_recommended"
}
```

**Step 2: Collaboration Format Suggestions**

AI generates specific, actionable ideas:
```
Input: Creator profiles + distance
Output: [
  {
    type: "Local Meetup Event",
    description: "Host joint in-person event",
    effort: "high",
    impact: "high",
    inPerson: true
  },
  {
    type: "Cross-Promotion Campaign",
    description: "Feature each other's content",
    effort: "low",
    impact: "medium",
    inPerson: false
  }
]
```

**Step 3: Personalized Outreach Generation**

AI creates authentic, contextual messages:
```
Input:
- Your profile (name, location, platform)
- Their profile (content topics, stats)
- Collaboration suggestions

Output: 150-200 word personalized message
- References their specific content
- Highlights geographic opportunity
- Suggests concrete collaboration ideas
- Conversational, not salesy
```

### Phase 5: Match Storage & Management

Matches are saved to database with:
- Match score
- Distance in miles
- AI insights (compatibility, suggestions)
- Status (pending/contacted/accepted/rejected)
- Outreach tracking

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌───────────────────┐  ┌────────────┐ │
│  │  LocationSetup │  │ CollaboratorMatch │  │  Outreach  │ │
│  │   Component    │→ │    Component      │→ │   Panel    │ │
│  └────────────────┘  └───────────────────┘  └────────────┘ │
│         ↓                      ↓                    ↓       │
└─────────────────────────────────────────────────────────────┘
          │                      │                    │
          └──────────────────────┼────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PUT /user/location     POST /matches/generate              │
│         ↓                        ↓                           │
│  ┌──────────────┐      ┌────────────────┐                  │
│  │ Auth Router  │      │ Match Router   │                  │
│  └──────────────┘      └────────────────┘                  │
│         ↓                        ↓                           │
└─────────────────────────────────────────────────────────────┘
          │                        │
          ↓                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │  matchingService.js  │──────│    aiService.js      │    │
│  │                      │      │                      │    │
│  │ • findMatches()      │      │ • analyzeAudience()  │    │
│  │ • calculateDistance()│      │ • suggestFormats()   │    │
│  │ • generateMatches()  │      │ • generateOutreach() │    │
│  └──────────────────────┘      └──────────────────────┘    │
│           ↓                              ↓                   │
│           └──────────────┬───────────────┘                   │
│                          ↓                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER (PostgreSQL)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────┐   │
│  │   users     │  │ social_accounts  │  │ collaborator│   │
│  │             │  │                  │  │  _matches   │   │
│  │ • id        │  │ • userId         │  │ • userId    │   │
│  │ • email     │  │ • platform       │  │ • matchedId │   │
│  │ • city      │  │ • username       │  │ • score     │   │
│  │ • state     │  │ • followers      │  │ • distance  │   │
│  │ • latitude  │  │ • engagement     │  │ • insights  │   │
│  │ • longitude │  │ • topics         │  │ • status    │   │
│  └─────────────┘  └──────────────────┘  └─────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL AI SERVICES                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌──────────────────┐         ┌──────────────────┐       │
│    │ Anthropic Claude │   OR    │   OpenAI GPT-4   │       │
│    │  (Preferred)     │         │   (Fallback)     │       │
│    └──────────────────┘         └──────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Process Flow Diagram

### User Journey: Finding Collaborators

```
┌─────────────────────────────────────────────────────────────┐
│ START: User wants to find local collaborators               │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │ 1. Connect Social Media Accounts     │
         │    (Instagram/YouTube/TikTok)        │
         └──────────────────┬───────────────────┘
                            ↓
              ┌─────────────────────────┐
              │ Platform OAuth Flow     │
              │ → Get access token      │
              │ → Fetch profile data    │
              │ → Save to database      │
              └─────────┬───────────────┘
                        ↓
         ┌──────────────────────────────────────┐
         │ 2. Set Location                      │
         │    Options:                          │
         │    A) Use current location (GPS)     │
         │    B) Enter manually (city/state)    │
         └──────────────────┬───────────────────┘
                            ↓
              ┌─────────────────────────┐
              │ Geocode to coordinates  │
              │ → latitude, longitude   │
              │ → Save to database      │
              └─────────┬───────────────┘
                        ↓
         ┌──────────────────────────────────────┐
         │ 3. Click "Find Collaborators"        │
         └──────────────────┬───────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│                    MATCHING ALGORITHM                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Step 1: Geographic Search                                   │
│  ┌─────────────────────────────────────────┐                │
│  │ • Get user's lat/lon & search radius    │                │
│  │ • Calculate bounding box                │                │
│  │ • Query users in box                    │                │
│  │ • Filter: has social accounts           │                │
│  └─────────────────┬───────────────────────┘                │
│                    ↓                                          │
│  Step 2: Distance Calculation                                │
│  ┌─────────────────────────────────────────┐                │
│  │ For each potential match:               │                │
│  │ • Calculate exact distance (Haversine)  │                │
│  │ • Filter: within search radius          │                │
│  │ • Sort by distance (closest first)      │                │
│  └─────────────────┬───────────────────────┘                │
│                    ↓                                          │
│  Step 3: AI Analysis (for each match)                        │
│  ┌─────────────────────────────────────────┐                │
│  │ Parallel processing:                    │                │
│  │                                          │                │
│  │ A) Audience Compatibility               │                │
│  │    ├─ Compare follower counts           │                │
│  │    ├─ Analyze engagement rates          │                │
│  │    ├─ Check topic overlap               │                │
│  │    └─ Score: 0-100                      │                │
│  │                                          │                │
│  │ B) Collaboration Suggestions            │                │
│  │    ├─ Consider distance (IRL?)          │                │
│  │    ├─ Analyze content types             │                │
│  │    └─ Generate 4-5 formats              │                │
│  │                                          │                │
│  │ C) Calculate Match Score                │                │
│  │    = (Compatibility × 0.7)              │                │
│  │      + (Distance Score × 0.3)           │                │
│  └─────────────────┬───────────────────────┘                │
│                    ↓                                          │
│  Step 4: Save to Database                                    │
│  ┌─────────────────────────────────────────┐                │
│  │ • Store match with score                │                │
│  │ • Store AI insights                     │                │
│  │ • Store collaboration formats           │                │
│  │ • Set status: 'pending'                 │                │
│  └─────────────────┬───────────────────────┘                │
│                    ↓                                          │
└───────────────────────────────────────────────────────────────┘
                    ↓
         ┌──────────────────────────────────────┐
         │ 4. Display Matches                   │
         │    → Sorted by match score           │
         │    → Show distance                   │
         │    → Show compatibility insights     │
         │    → Show collaboration ideas        │
         └──────────────────┬───────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │ 5. User Selects Match                │
         │    → Click "Generate Outreach"       │
         └──────────────────┬───────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────────┐
│                   OUTREACH GENERATION                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────┐               │
│  │ AI Prompt Construction:                  │               │
│  │                                           │               │
│  │ Your Profile:                             │               │
│  │ • Name, location                          │               │
│  │ • Platform, follower count                │               │
│  │                                           │               │
│  │ Their Profile:                            │               │
│  │ • Name, username                          │               │
│  │ • Content topics                          │               │
│  │ • Stats (followers, engagement)           │               │
│  │ • Distance                                │               │
│  │                                           │               │
│  │ Context:                                  │               │
│  │ • Collaboration suggestions               │               │
│  │ • Match reasons                           │               │
│  └──────────────────┬────────────────────────┘               │
│                     ↓                                         │
│  ┌──────────────────────────────────────────┐               │
│  │ AI Generation (Claude/GPT-4):            │               │
│  │                                           │               │
│  │ Creates 150-200 word message:             │               │
│  │ • Genuine interest in their content       │               │
│  │ • Mentions specific topics                │               │
│  │ • Highlights local proximity              │               │
│  │ • Suggests 1-2 collaboration ideas        │               │
│  │ • Conversational, authentic tone          │               │
│  │ • Clear but low-pressure CTA              │               │
│  └──────────────────┬────────────────────────┘               │
│                     ↓                                         │
└───────────────────────────────────────────────────────────────┘
                     ↓
         ┌──────────────────────────────────────┐
         │ 6. Review & Edit Message             │
         │    → User can customize              │
         │    → Copy to clipboard               │
         └──────────────────┬───────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │ 7. Send via Platform                 │
         │    → User sends DM manually          │
         │    → Mark as "Sent" in system        │
         └──────────────────┬───────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │ 8. Track Response                    │
         │    → Update status                   │
         │    → Add notes                       │
         │    → Manage collaboration            │
         └──────────────────────────────────────┘
                            ↓
                    ┌───────────────┐
                    │  END: Success │
                    └───────────────┘
```

---

## 🧮 Matching Algorithm Pseudocode

```python
def find_collaborators(user_id, search_radius):
    # Step 1: Load user data
    user = get_user_with_location(user_id)

    if not user.latitude or not user.longitude:
        raise Error("Location not set")

    if not user.social_accounts:
        raise Error("No social accounts connected")

    # Step 2: Geographic search
    # Calculate bounding box (approximate)
    lat_range = search_radius / 69  # 69 miles per degree lat
    lon_range = search_radius / (69 * cos(user.latitude))

    potential_matches = query_database(
        latitude BETWEEN (user.lat - lat_range, user.lat + lat_range),
        longitude BETWEEN (user.lon - lon_range, user.lon + lon_range),
        id != user_id,
        has_social_accounts = true
    )

    # Step 3: Calculate exact distances
    matches = []
    for candidate in potential_matches:
        distance = haversine_distance(
            user.latitude, user.longitude,
            candidate.latitude, candidate.longitude
        )

        if distance <= search_radius:
            matches.append({
                user: candidate,
                distance: distance
            })

    # Step 4: Sort by distance
    matches.sort(by='distance', ascending=true)

    # Step 5: AI analysis for each match
    for match in matches:
        # Parallel AI calls
        compatibility = ai_analyze_audience(
            user.social_accounts,
            match.user.social_accounts
        )

        collaboration_formats = ai_suggest_formats(
            user.social_accounts,
            match.user.social_accounts,
            match.distance
        )

        # Calculate match score
        distance_score = max(0, 100 - (match.distance / 2))
        match.score = (compatibility.score * 0.7) + (distance_score * 0.3)

        # Save to database
        save_match(
            user_id=user_id,
            matched_user_id=match.user.id,
            score=match.score,
            distance=match.distance,
            insights=compatibility,
            formats=collaboration_formats
        )

    # Step 6: Return sorted by score
    return matches.sort(by='score', descending=true)


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 3959  # Earth radius in miles

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat/2)^2 + cos(lat1) * cos(lat2) * sin(dlon/2)^2
    c = 2 * atan2(sqrt(a), sqrt(1-a))

    return R * c


def ai_analyze_audience(user_accounts, match_accounts):
    prompt = f"""
    Analyze compatibility between:
    User: {user_accounts.platform}, {user_accounts.followers} followers
    Match: {match_accounts.platform}, {match_accounts.followers} followers

    Return JSON with score, overlap, compatibility, strengths, concerns
    """

    return ai_api_call(prompt)
```

---

## 🐛 Troubleshooting: Why No Matches Found

### Debug Checklist

Run this in backend console to see detailed logs:

```bash
cd backend
npm run dev
```

When you click "Find Collaborators", you'll see:

```
🔍 Finding matches for user: xxx
   Current user: Your Name
   Location: Your City, State
   Coordinates: 37.7749, -122.4194
   Social accounts: 1
   Search radius: 50 miles
   Found 0 potential matches in database  ← THIS IS THE KEY LINE
```

**If "Found 0 potential matches":**

### Solution 1: Seed Test Data

```bash
cd backend
npm run seed
```

This creates 5 test users. Then try matching again.

### Solution 2: Check Database Connection

Look for this on backend startup:
```
✓ Database connection established successfully
✓ Database tables synchronized
```

If you see connection errors, verify `DATABASE_URL` in `.env`

### Solution 3: Verify Your Setup

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Should see: users, social_accounts, collaborator_matches

-- Check if users have location data
SELECT id, email, city, state, latitude, longitude
FROM users
WHERE latitude IS NOT NULL;

-- Check if users have social accounts
SELECT COUNT(*) FROM social_accounts;
```

---

## 📈 Performance Considerations

### Database Indexes

The system creates these indexes automatically:

```sql
-- For geographic queries
CREATE INDEX idx_users_location ON users(latitude, longitude);

-- For match queries
CREATE INDEX idx_matches_user ON collaborator_matches(userId);
CREATE INDEX idx_matches_score ON collaborator_matches(matchScore);
CREATE INDEX idx_social_followers ON social_accounts(followers);
```

### Query Optimization

1. **Bounding box** reduces database scan from entire table to ~1% of data
2. **Haversine calculation** only runs on filtered subset
3. **AI analysis** runs in parallel for multiple matches
4. **Match caching** stores results to avoid re-computation

### Scaling Considerations

For large deployments (1000+ users):

- Add PostGIS for geospatial queries
- Implement Redis caching for matches
- Queue AI analysis jobs
- Add pagination for match results

---

## 🎯 Next Steps

1. **Configure database** (see Step 1 above)
2. **Run seed script**: `npm run seed`
3. **Test matching** with test users
4. **Add AI keys** for personalized outreach
5. **Invite real creators** to join

All code is committed and pushed to your branch:
`claude/ai-collaborator-matching-ZTldx`
