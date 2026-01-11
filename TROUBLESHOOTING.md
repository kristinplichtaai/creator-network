# Troubleshooting: No Collaborators Found

## Problem

When you click "Find Collaborators", you see the message: "No potential collaborators found in your area."

## Why This Happens

The collaborator matching system needs **multiple users** with:
1. ✅ Location data set (latitude/longitude)
2. ✅ Social media accounts connected
3. ✅ Within your search radius

If you're the **only user** or the **first user** in the database, there's no one else to match with!

## Solutions

### Option 1: Add Test Users (Recommended for Testing)

We've created a seed script that adds 5 test users in the San Francisco Bay Area with realistic social media data.

**Run this command:**

```bash
cd backend
npm run seed
```

This creates:
- 5 test users with different locations
- Social media accounts for each (Instagram, YouTube, TikTok)
- Realistic follower counts and engagement rates
- Different content topics

**Login credentials for test users:**
- Email: `test1@example.com`, `test2@example.com`, etc.
- Password: `password123`

**After seeding:**
1. Login as any test user
2. Go to "Find Collaborators" tab
3. Click "Find Collaborators"
4. You should see 3-4 matches!

### Option 2: Invite Real Users

For production use:
1. Have other creators sign up
2. Each user must:
   - Connect at least one social platform
   - Set their location in "Location Setup" tab
3. Once multiple users exist, matching will work

## Debugging: Check What's Happening

The backend now logs detailed information when you search for matches. Check your backend console for:

```
🔍 Finding matches for user: xxx
   Current user: Your Name
   Location: San Francisco, CA
   Coordinates: 37.7749, -122.4194
   Social accounts: 1
   Search radius: 50 miles
   Found 4 potential matches in database
   After distance filtering: 3 matches within 50 miles
   Matches:
     1. Mike Chen - 12.3 miles (Oakland, CA)
     2. Alex Kim - 14.5 miles (Berkeley, CA)
     3. Emma Rodriguez - 42.1 miles (San Jose, CA)
```

If you see **"Found 0 potential matches in database"**, it means:
- No other users exist in the database
- OR other users don't have location set
- OR other users don't have social accounts connected

## Verify Your Setup

1. **Check your location is set:**
   ```
   Go to "Location Setup" tab
   You should see your city and coordinates
   If empty, set your location
   ```

2. **Check you have social accounts:**
   ```
   Go to "Connected Platforms" tab
   You should see at least 1 connected account
   If empty, connect Instagram/YouTube/TikTok
   ```

3. **Check database has test users:**
   ```bash
   cd backend
   npm run seed
   ```

## Common Error Messages

### "User location not set"
**Fix:** Go to "Location Setup" tab and set your location

### "No social accounts connected"
**Fix:** Go to "Connected Platforms" tab and connect a platform

### "No potential collaborators found in your area"
**Fix:** Run `npm run seed` to add test users, or invite other creators

## Advanced: Database Check

If you want to verify the database state directly:

```sql
-- Check if location columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('latitude', 'longitude', 'city');

-- Count users with location data
SELECT COUNT(*) FROM users WHERE latitude IS NOT NULL;

-- Count users with social accounts
SELECT COUNT(*) FROM social_accounts;

-- See all users with locations
SELECT id, email, name, city, state, latitude, longitude
FROM users
WHERE latitude IS NOT NULL;
```

## Still Having Issues?

1. **Check backend logs** - Look for error messages or the detailed matching logs
2. **Verify .env file** - Ensure DATABASE_URL is correct
3. **Check database connection** - Backend should show "🗄️ Database connected and ready"
4. **Run migrations** - The server auto-syncs on startup with `{ alter: true }`

## Quick Test Checklist

- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Frontend is running (`npm start` in frontend folder)
- [ ] Database is connected (see ✅ in backend logs)
- [ ] Your user has location set
- [ ] Your user has social account connected
- [ ] Test users are seeded (`npm run seed`)
- [ ] You're logged in as a test user

Once all checkboxes are complete, "Find Collaborators" should work!
