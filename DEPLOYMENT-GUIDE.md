# 🚀 Production Deployment Guide

This guide will walk you through deploying Creator Network to production.

## Prerequisites

- GitHub account
- Vercel account (free - sign up at vercel.com)
- Railway account (free - sign up at railway.app)
- Your Supabase database is already set up ✅
- YouTube OAuth credentials configured ✅

## Deployment Overview

1. **Deploy Backend to Railway** (~15 min)
2. **Deploy Frontend to Vercel** (~10 min)
3. **Update OAuth Redirect URIs** (~5 min)
4. **Test Production** (~5 min)

---

## Step 1: Deploy Backend to Railway

### 1.1 Push Code to GitHub (if not already)

```bash
cd /e/creator-network
git add .
git commit -m "Prepare for production deployment"
git push origin claude/ai-collaborator-matching-ZTldx
```

### 1.2 Deploy to Railway

1. **Go to [railway.app](https://railway.app)** and sign in with GitHub
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository:** `creator-network`
5. **Select the backend directory:**
   - Click "Add variables"
   - Set `ROOT` to `backend` (Railway will deploy from this folder)
6. **Add environment variables** (click "Variables" tab):

   Copy these from your local `backend/.env` file:
   ```
   DATABASE_URL=<your-supabase-connection-string>
   JWT_SECRET=<your-jwt-secret>
   YOUTUBE_CLIENT_ID=<your-youtube-client-id>
   YOUTUBE_CLIENT_SECRET=<your-youtube-client-secret>
   YOUTUBE_REDIRECT_URI=https://YOUR-FRONTEND-URL.vercel.app/callback/youtube
   YOUTUBE_API_KEY=<your-youtube-api-key>
   PORT=3001
   NODE_ENV=production
   ```
   ⚠️ **Note:** You'll update `YOUTUBE_REDIRECT_URI` after deploying frontend

   💡 **Tip:** Use the exact values from your local `.env` file that's working

7. **Railway will auto-deploy** and give you a URL like: `https://your-app.railway.app`
8. **Save this backend URL** - you'll need it for the frontend

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. **Click "Add New Project"**
3. **Import your GitHub repository:** `creator-network`
4. **Configure project:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend` (click "Edit" and select `frontend`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

5. **Add environment variable:**
   - Click "Environment Variables"
   - Add: `REACT_APP_API_URL` = `https://your-backend.railway.app` (use the Railway URL from Step 1.2.7)

6. **Click "Deploy"**
7. **Vercel will build and deploy** - takes ~2-3 minutes
8. **You'll get a URL like:** `https://creator-network-xxx.vercel.app`

---

## Step 3: Update Configuration

### 3.1 Update Backend Environment Variables

Go back to Railway:
1. **Open your backend project**
2. **Click "Variables" tab**
3. **Update:** `YOUTUBE_REDIRECT_URI=https://YOUR-FRONTEND-URL.vercel.app/callback/youtube`
4. **Click "Deploy"** to restart with new variables

### 3.2 Update Google Cloud Console

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **APIs & Services → Credentials**
3. **Click your OAuth 2.0 Client ID**
4. **Add to "Authorized redirect URIs":**
   ```
   https://YOUR-FRONTEND-URL.vercel.app/callback/youtube
   ```
5. **Click "Save"**

---

## Step 4: Test Production Deployment

### 4.1 Test the Full Flow

1. **Visit your Vercel URL:** `https://creator-network-xxx.vercel.app`
2. **Sign up** with a new account
3. **Connect YouTube** - should redirect to Google OAuth
4. **Authorize** the app
5. **Verify** you see your YouTube channel data
6. **Set location** and test collaborator matching
7. **Generate outreach** message

### 4.2 Check for Errors

- **Open browser console** (F12) - should have no errors
- **Check Railway logs** - verify backend is running
- **Test API health:** Visit `https://your-backend.railway.app/health`

---

## Troubleshooting

### Frontend can't reach backend
- Check `REACT_APP_API_URL` in Vercel environment variables
- Make sure Railway backend is running
- Check CORS settings in backend

### YouTube OAuth fails
- Verify redirect URI in Google Cloud Console matches exactly
- Check `YOUTUBE_REDIRECT_URI` in Railway matches your Vercel URL
- Ensure OAuth credentials are correct

### Database connection fails
- Verify `DATABASE_URL` in Railway environment variables
- Check Supabase database is accessible (should be ✅)

---

## Next Steps After Deployment

1. **Custom Domain** (optional)
   - Vercel: Settings → Domains → Add domain
   - Railway: Settings → Domains → Add custom domain

2. **Add Anthropic API Key** (for AI outreach)
   - Get key from console.anthropic.com
   - Add `ANTHROPIC_API_KEY` to Railway variables

3. **Share with creators**
   - Post on social media
   - Invite creator friends
   - Get feedback!

4. **Monitor usage**
   - Railway dashboard shows requests/logs
   - Vercel analytics shows visitor stats

---

## Cost Breakdown

- **Vercel:** Free (100GB bandwidth/month)
- **Railway:** Free tier ($5 credit/month) then ~$5-10/month
- **Supabase:** Free tier (500MB database, plenty for testing)
- **YouTube API:** Free (10,000 quota units/day - enough for ~50 users/day)

**Total:** Free for testing, ~$5-10/month with users

---

## Support

If you encounter issues:
1. Check Railway logs for backend errors
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Test the health endpoint: `https://your-backend.railway.app/health`
