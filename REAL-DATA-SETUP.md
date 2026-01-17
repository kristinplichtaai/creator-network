# Real Social Media Integration Guide

## Phase 1: Instagram OAuth Setup

Instagram requires going through Facebook's developer platform since Meta owns Instagram.

### Step 1: Create Meta Developer Account (5 minutes)

1. **Go to:** https://developers.facebook.com/
2. **Click "Get Started"** (top right)
3. **Login** with your Facebook account (or create one)
4. **Complete registration** as a developer
5. **Verify your email** if prompted

---

### Step 2: Create a New App (10 minutes)

1. **Click "My Apps"** in top navigation
2. **Click "Create App"**
3. **Choose app type:** Select **"Consumer"**
4. **Click "Next"**

**App Details:**
- **App Name:** `Creator Network`
- **App Contact Email:** Your email
- **Business Account:** Can skip for now

5. **Click "Create App"**
6. **Complete Security Check** (if prompted)

---

### Step 3: Add Instagram Basic Display (5 minutes)

1. In your app dashboard, **scroll down** to "Add Products"
2. Find **"Instagram Basic Display"**
3. **Click "Set Up"**

---

### Step 4: Configure Instagram Basic Display

#### 4.1: Basic Settings

1. **Go to:** Settings → Basic
2. Copy your **App ID** and **App Secret**
3. **App Domains:** Add `localhost` (for testing)
4. **Privacy Policy URL:** Can use a placeholder for now: `https://yoursite.com/privacy` (we'll create this later)
5. **Save Changes**

#### 4.2: Instagram Basic Display Settings

1. **Go to:** Instagram Basic Display → Settings
2. **Click "Create New App"**

**Fill in the form:**

**Valid OAuth Redirect URIs:**
```
http://localhost:3000/callback/instagram
https://yoursite.com/callback/instagram
```

**Deauthorize Callback URL:**
```
http://localhost:3000/auth/instagram/deauth
```

**Data Deletion Request URL:**
```
http://localhost:3000/auth/instagram/delete
```

3. **Click "Save Changes"**
4. **Copy your Instagram App ID** and **Instagram App Secret**

---

### Step 5: Add Test Users (Required for Testing)

Before going live, you need to add test Instagram accounts:

1. **Go to:** Instagram Basic Display → Basic Display → User Token Generator
2. **Click "Add or Remove Instagram Testers"**
3. This opens Instagram's settings
4. **Add your Instagram username** as a tester
5. **Go to your Instagram account:**
   - Open Instagram app/website
   - Go to Settings → Apps and Websites → Tester Invites
   - **Accept the invite**

---

### Step 6: Get Your Credentials

You now have these credentials:

**From Facebook App Settings → Basic:**
- `App ID` (this is your Instagram Client ID)
- `App Secret` (this is your Instagram Client Secret)

**Add to your `.env` file:**

```bash
# Instagram OAuth
INSTAGRAM_CLIENT_ID=your_app_id_here
INSTAGRAM_CLIENT_SECRET=your_app_secret_here
INSTAGRAM_REDIRECT_URI=http://localhost:3000/callback/instagram
```

---

### Step 7: Test the Integration

1. **Restart your backend:**
   ```bash
   cd /e/creator-network/backend
   # Stop with Ctrl+C
   npm run dev
   ```

2. **Go to frontend:**
   - Navigate to "Connected Platforms" tab
   - Click "Connect Instagram"
   - You'll be redirected to Instagram login
   - Login with your test account
   - **Authorize the app**
   - You'll be redirected back

3. **Check the results:**
   - Your Instagram profile should appear
   - Shows: username, followers, engagement rate
   - Recent topics extracted from your posts

---

## Phase 1B: YouTube OAuth Setup (After Instagram Works)

### Step 1: Create Google Cloud Project

1. **Go to:** https://console.cloud.google.com/
2. **Create new project:** "Creator Network"
3. **Enable YouTube Data API v3**
4. **Create OAuth 2.0 credentials**

### Step 2: Configure OAuth Consent Screen

- **User Type:** External
- **App Name:** Creator Network
- **Support Email:** Your email
- **Scopes:** Add `youtube.readonly`
- **Test Users:** Add your Gmail

### Step 3: Create OAuth Credentials

1. **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. **Application Type:** Web application
3. **Authorized redirect URIs:**
   ```
   http://localhost:3000/callback/youtube
   ```
4. **Copy Client ID and Client Secret**

### Step 4: Add to .env

```bash
# YouTube OAuth
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REDIRECT_URI=http://localhost:3000/callback/youtube
YOUTUBE_API_KEY=your_api_key_here
```

---

## Phase 1C: TikTok OAuth Setup (Optional)

TikTok has stricter requirements and requires business verification. We can add this later if needed.

**For now, focus on Instagram and YouTube** - those are the most popular creator platforms.

---

## Testing with Real Data

Once you have Instagram/YouTube OAuth set up:

1. **Create your own account:**
   - Register with your real email
   - Set your real location (your city)
   - Connect your Instagram and/or YouTube

2. **Invite a friend:**
   - Have them register
   - Set their location (hopefully nearby)
   - Connect their social accounts

3. **Test matching:**
   - Click "Find Collaborators"
   - You should see your friend appear (if they're within 50 miles)
   - Real follower counts and engagement rates
   - Real content topics from their posts

---

## Current Status

✅ System works with test data
⏳ Need to set up Instagram OAuth (follow steps above)
⏳ Need to set up YouTube OAuth (after Instagram works)
⏳ Ready to test with real creators

---

## Next Steps

1. **Start with Instagram** (most creators use this)
2. **Test with your own account**
3. **Once working, add YouTube**
4. **Invite real users to test**

**Estimated Time:**
- Instagram setup: 20-30 minutes
- YouTube setup: 15-20 minutes
- Testing: 10 minutes

Let me know when you're ready to start the Instagram setup and I'll walk you through any issues!
