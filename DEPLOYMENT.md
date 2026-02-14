# 🚀 Quick Deployment Guide

## Deploy to Vercel (Recommended - 2 minutes)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com/new
2. **Import Git Repository**: 
   - Sign in with GitHub
   - Select your `NammaOoru` repository
3. **Configure**:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Add Environment Variable**:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY = your_gemini_api_key
   ```
5. **Click Deploy**

**Done!** You'll get a URL like: `https://namma-ooru-xyz.vercel.app`

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: namma-guide
# - Directory: ./
# - Want to modify settings? No

# Add environment variable
vercel env add NEXT_PUBLIC_GEMINI_API_KEY

# Production deployment
vercel --prod
```

---

## Deploy to Firebase Hosting (Alternative)

### Prerequisites
- Firebase account
- Firebase CLI installed

### Steps

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase (in project root)
cd E:\Projects\NammaOoru
firebase init hosting

# Select:
# - Use existing project or create new
# - Public directory: frontend/out
# - Single-page app: Yes
# - Setup automatic builds: No

# Build the app
cd frontend
npm run build

# Deploy
firebase deploy --only hosting
```

---

## Environment Variables Required

### Frontend
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### Backend (for full functionality)
```env
GEMINI_API_KEY=your_gemini_api_key
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_URL=wss://your-livekit-url
```

**Note**: Frontend can be deployed standalone for demo purposes. Backend needs separate hosting (Railway, Render, or Cloud Run).

---

## Recommended: Vercel + Railway

**Frontend** → Vercel (static/frontend)
**Backend** → Railway (Python backend)

### Deploy Backend to Railway:

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `NammaOoru`  repository
4. Root directory: `backend`
5. Add environment variables
6. Deploy!

---

## Quick Links

- **Vercel**: https://vercel.com
- **Firebase**: https://console.firebase.google.com
- **Railway**: https://railway.app
- **Render**: https://render.com

---

**Fastest deployment**: Vercel (2 mins, free tier available)
