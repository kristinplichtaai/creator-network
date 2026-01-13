# 🚀 Quick Start: Get Collaborator Matching Working

Follow these steps in order to get the system working in under 10 minutes.

## ✅ Checklist

### Step 1: Configure Database ⏱️ 5 minutes

**Option A: Supabase (Recommended)**
- [ ] Go to https://supabase.com/
- [ ] Create free account
- [ ] Create new project
- [ ] Copy database connection string from Settings → Database
- [ ] Update `backend/.env` with your DATABASE_URL

**Option B: Local PostgreSQL**
- [ ] Install PostgreSQL on your machine
- [ ] Create database: `createdb creator_network`
- [ ] Update `backend/.env`: `DATABASE_URL=postgresql://localhost:5432/creator_network`

### Step 2: Add Test Data ⏱️ 1 minute

```bash
cd backend
npm run seed
```

Expected output:
```
✅ Database seeded successfully!
📊 Test Users Created:
1. Sarah Johnson (test1@example.com)
2. Mike Chen (test2@example.com)
3. Emma Rodriguez (test3@example.com)
4. Alex Kim (test4@example.com)
5. Jamie Martinez (test5@example.com)
```

### Step 3: Start Services ⏱️ 1 minute

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Look for:
- ✅ `✓ Database connection established successfully`
- ✅ `✓ Database tables synchronized`
- ✅ `🚀 Backend server running on port 3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Browser should open to http://localhost:3000

### Step 4: Test Matching ⏱️ 2 minutes

- [ ] Login as `test1@example.com` / `password123`
- [ ] Click "Find Collaborators" tab
- [ ] Click "Find Collaborators" button
- [ ] **You should see 3-4 matches!**

### Step 5: Test AI Outreach ⏱️ 1 minute (Optional)

- [ ] Add AI API key to `backend/.env`:
  ```bash
  ANTHROPIC_API_KEY=sk-ant-your-key-here
  # OR
  OPENAI_API_KEY=sk-your-key-here
  ```
- [ ] Restart backend
- [ ] Click "Generate Outreach" on any match
- [ ] AI creates personalized message!

---

## 🐛 Troubleshooting

### "No collaborators found"
**Check backend console for logs:**
```
🔍 Finding matches for user: xxx
   Found 0 potential matches in database  ← This is the problem
```

**Fix:** Run `npm run seed` to add test users

### Database connection error
**Check `.env` file has valid DATABASE_URL**

Test connection:
```bash
cd backend
node -e "require('./database').testConnection()"
```

Should see: `✓ Database connection established successfully`

### Port already in use
**Backend (port 3001):**
```bash
lsof -ti:3001 | xargs kill -9
```

**Frontend (port 3000):**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Next Steps

Once matching works:

1. **Read the architecture docs:**
   - `SETUP-AND-ARCHITECTURE.md` - Full system explanation
   - `diagrams/` - Visual diagrams

2. **Invite real users:**
   - Each must connect social accounts
   - Each must set their location
   - Matching works once multiple users exist

3. **Customize for your needs:**
   - Adjust search radius
   - Filter by follower count
   - Filter by platform

---

## 💡 Quick Reference

### Test User Credentials
All test users have password: `password123`

- `test1@example.com` - Sarah Johnson, SF (Instagram, 15K)
- `test2@example.com` - Mike Chen, Oakland (YouTube, 25K)
- `test3@example.com` - Emma Rodriguez, San Jose (Instagram, 32K)
- `test4@example.com` - Alex Kim, Berkeley (TikTok, 45K)
- `test5@example.com` - Jamie Martinez, Palo Alto (Instagram, 18K)

### Useful Commands

```bash
# Seed test data
cd backend && npm run seed

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm start

# View backend logs
cd backend && npm run dev | grep "Finding matches"

# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Key Files

- `backend/.env` - Configuration (DATABASE_URL, API keys)
- `backend/services/matchingService.js` - Matching algorithm
- `backend/services/aiService.js` - AI integration
- `frontend/src/CollaboratorMatches.js` - Matches UI
- `frontend/src/LocationSetup.js` - Location setup

---

## ✅ Success Criteria

You'll know it's working when:

1. **Backend starts without errors**
   ```
   ✓ Database connection established successfully
   ✓ Database tables synchronized
   🚀 Backend server running on port 3001
   ```

2. **Frontend loads**
   - You can login
   - You see 3 tabs (Platforms, Location, Find Collaborators)

3. **Matching works**
   - Click "Find Collaborators"
   - See match cards with scores
   - See collaboration suggestions
   - Can generate outreach

4. **Backend shows detailed logs**
   ```
   🔍 Finding matches for user: xxx
      Found 4 potential matches in database
      After distance filtering: 3 matches within 50 miles
      Matches:
        1. Mike Chen - 12.3 miles (Oakland, CA)
        2. Alex Kim - 14.5 miles (Berkeley, CA)
        3. Jamie Martinez - 28.7 miles (Palo Alto, CA)
   ```

---

## 🆘 Still Not Working?

1. **Check this file first:** `TROUBLESHOOTING.md`
2. **Review architecture:** `SETUP-AND-ARCHITECTURE.md`
3. **Check backend console** for error messages
4. **Verify database connection:**
   ```bash
   cd backend
   node -e "require('./database').testConnection()"
   ```

Everything committed and pushed to branch: `claude/ai-collaborator-matching-ZTldx`
