# Local Creator Network

AI-powered collaboration matching for local content creators.

## 🚀 Quick Start

### 1. Configure API Credentials

Edit `backend/.env` with your API credentials:

- **Instagram:** https://developers.facebook.com
- **TikTok:** https://developers.tiktok.com (requires approval)
- **YouTube:** https://console.cloud.google.com

See `SETUP-GUIDE.md` for detailed instructions.

### 2. Start Backend

```bash
cd backend
npm run dev
```

Backend will run on http://localhost:3001

### 3. Start Frontend (in a new terminal)

```bash
cd frontend
npm start
```

Frontend will run on http://localhost:3000

### 4. Test the API

```bash
cd backend
npm test
```

## 📁 Project Structure

```
creator-network/
├── backend/              # Express API server
│   ├── server.js        # Main server file (copy from artifacts)
│   ├── test-api.js      # API testing script (copy from artifacts)
│   ├── .env             # Environment variables (configure this!)
│   ├── .gitignore       # Git ignore rules
│   └── package.json     # Dependencies
├── frontend/            # React application
│   ├── src/
│   │   ├── App.js              # Router config (copy from artifacts)
│   │   ├── LocalCreatorNetwork.js  # Main component (copy from artifacts)
│   │   └── CallbackHandler.js      # OAuth handler (copy from artifacts)
│   ├── public/
│   ├── .env             # Frontend environment variables
│   └── package.json     # Dependencies
└── README.md            # This file
```

## ⚙️ Configuration Required

After running setup, you need to:

1. **Copy server files from artifacts** to `backend/`:
   - `server.js`
   - `test-api.js`

2. **Copy React components from artifacts** to `frontend/src/`:
   - `App.js`
   - `LocalCreatorNetwork.js`
   - `CallbackHandler.js`

3. **Configure API credentials** in `backend/.env`

4. **Get API credentials** (see SETUP-GUIDE.md)

## 🧪 Testing

```bash
# Test backend
cd backend
npm test

# Test frontend
cd frontend
npm test
```

## 📚 Documentation

- **Setup Guide:** Detailed setup instructions with API credential walkthrough
- **API Documentation:** Complete API endpoint reference
- **Deployment Guide:** Production deployment instructions

## 🔧 Common Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run API tests

# Frontend
cd frontend
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

## 🆘 Troubleshooting

**Backend won't start:**
- Check if port 3001 is available
- Verify .env file exists and has correct format
- Run `npm install` again

**Frontend won't start:**
- Check if port 3000 is available
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

**OAuth errors:**
- Verify redirect URIs match exactly in developer consoles
- Check API credentials in .env
- Ensure credentials are for the correct environment (dev/prod)

## 📞 Support

Check the comprehensive SETUP-GUIDE.md for detailed instructions on:
- Getting API credentials
- OAuth configuration
- Testing and debugging
- Deployment options

## 📄 License

MIT License - feel free to use this for your own projects!
