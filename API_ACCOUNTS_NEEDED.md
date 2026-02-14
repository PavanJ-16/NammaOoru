# 🔑 Required API Accounts & Setup for Namma Guide

You'll need to create accounts and obtain API keys for the following services before we can build the application:

---

## ✅ **Critical Services (Must Have)**

### 1. **Firebase** 
**Purpose:** Authentication (Google Sign-in) + Firestore database + Cloud Storage

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "namma-guide"
3. Enable **Google Authentication** in Authentication section
4. Create a **Firestore database** (start in test mode, we'll add security rules later)
5. Generate a **Web app** config (copy the config object)
6. Download **Service Account Key** for backend:
   - Project Settings → Service Accounts → Generate New Private Key
   - Save this JSON file securely (DO NOT commit to git)

**Documentation:** [Firebase Admin SDK Python](https://firebase.google.com/docs/admin/setup)

---

### 2. **Google Gemini 3 API**
**Purpose:** All AI reasoning, vision, audio, and multi-agent orchestration

**Steps:**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key for both frontend (`NEXT_PUBLIC_GEMINI_API_KEY`) and backend (`GEMINI_API_KEY`)

**Documentation:** [Gemini 3 Developer Guide](https://ai.google.dev/gemini-api/docs)

**Models we'll use:**
- `gemini-3-pro` - Orchestrator, Translation, Transport, Action agents
- `gemini-3-flash` - Discovery, Memory agents (faster, cheaper)
- `gemini-3-flash-vision` - Vision agent (camera input)
- `gemini-3-audio` - Audio agent (mic/speaker)

---

### 3. **Mappls (MapmyIndia)**
**Purpose:** Routes, live traffic, places, navigation for Bengaluru

**Steps:**
1. Sign up at [Mappls Developer Portal](https://apis.mappls.com/)
2. Create a new project
3. Get your **Client ID**, **Client Secret**, and **API Key**
4. Enable the following APIs:
   - Place Search
   - Routing API
   - Distance Matrix
   - Nearby Places

**Documentation:** [Mappls API Docs](https://github.com/mappls-api/mappls-rest-apis)

**Free Tier:** 2,500 requests/day

---

### 4. **Razorpay**
**Purpose:** UPI payments for bookings

**Steps:**
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Complete KYC (for production, test mode works immediately)
3. Get your **Test Key ID** and **Test Key Secret** from Settings → API Keys
4. Enable **Payment Links** and **UPI** in Settings

**Documentation:** [Razorpay API Reference](https://razorpay.com/docs/api/)

**Test Mode:** Free, no KYC needed for development

---

## ⚠️ **Optional/Complex Services**

### 5. **ONDC Network**
**Purpose:** Mobility discovery (Namma Yatri style rides) + Food delivery

**Status:** ⚠️ **Complex onboarding** - Requires business verification and technical integration

**Steps:**
1. Register as a Network Participant at [ONDC Portal](https://ondc.org/network-participants/)
2. Complete onboarding process (can take 2-4 weeks)
3. Get **Subscriber ID**, **URL**, and **Signing Keys**

**Alternative for MVP:**
- We can build a **mock ONDC adapter** initially
- Use Mappls routing + Razorpay payments as a substitute
- Integrate ONDC later in production

**Documentation:** [ONDC Developer Guide](https://ondc.org/developer-guide/)

---

### 6. **BMTC/BMRCL GTFS Data**
**Purpose:** Real-time bus and metro schedules

**Status:** ✅ **Publicly available** via India Urban Data Exchange (IUDX)

**Access:**
1. BMTC GTFS: [IUDX BMTC Dataset](https://iudx.org.in/)
2. BMRCL API: [Bengaluru Open Data Portal](https://benscl.com/)
3. **No API key needed** for basic access (rate-limited)
4. For production, register at IUDX for higher limits

**Alternative:**
- We can also scrape/cache GTFS feeds locally
- Use static schedules initially, add real-time later

---

## 📋 **Quick Setup Checklist**

### **Phase 1: Start Development (Week 1)**
- [ ] Firebase project created
- [ ] Gemini 3 API key obtained
- [ ] Mappls account created (test mode)
- [ ] Razorpay test keys obtained

### **Phase 2: Enhanced Features (Week 2-3)**
- [ ] BMTC/BMRCL GTFS data accessed
- [ ] Razorpay production KYC completed

### **Phase 3: Production (Week 4+)**
- [ ] ONDC network participant registration (if needed)
- [ ] All services moved to production credentials

---

## 💰 **Cost Estimates (Development)**

| Service | Free Tier | Estimated Cost/Month |
|---------|-----------|---------------------|
| Firebase | 1GB DB, 50K daily users | **Free** |
| Gemini 3 API | 15 req/min free tier | **$0 - $20** |
| Mappls | 2,500 req/day | **Free** |
| Razorpay | Test mode unlimited | **Free** (2% on live) |
| ONDC | Registration cost | **₹10,000 - ₹50,000** |
| BMTC/BMRCL GTFS | Public access | **Free** |

**Total for MVP:** ~$0 - $20/month

---

## 🚀 **Next Steps**

1. **Start with Firebase + Gemini** - We can build the core app with just these two
2. **Add Mappls + Razorpay** - For transport and payments
3. **Mock ONDC initially** - Build the interface, integrate real ONDC later
4. **GTFS can be static** - Download GTFS files, load into Firestore

**I'll start building once you have:**
✅ Firebase config object (frontend .env)  
✅ Firebase service account JSON (backend)  
✅ Gemini API key  
✅ (Optional) Mappls credentials  
✅ (Optional) Razorpay test keys
