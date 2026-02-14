# 🏙️ Namma Guide - Your Intelligent Bengaluru Companion

> The AI-powered city companion for anyone new to Bengaluru. Speak in any language, see with your camera, and navigate the city like a local.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.x-orange)
![Gemini](https://img.shields.io/badge/Gemini-3-purple)

---

## ✨ Features

### 🎤 **Multi-lingual Voice Assistant**
- Speak in English, Hindi, Kannada, or any Indian language
- Real-time translation with Bangalore slang
- Auto-driver negotiation mode

### 📸 **Visual Intelligence**
- Point your camera at bus stops, food stalls, PG boards
- OCR for menus, signs, rental listings
- Scene understanding with cultural context

### 🚌 **Smart Transport Planning**
- BMTC bus + Namma Metro + auto/cab integration
- Real-time traffic-aware routing via Mappls
- Live arrival predictions

### 🍛 **Hyperlocal Discovery**
- ONDC-powered food & mobility search
- Hidden gems from local crowd-sourcing
- Budget-friendly PG/hostel finder

### 💰 **Integrated Payments**
- Razorpay UPI for all bookings
- Expense tracking across days
- Shared cost calculator (for group trips)

### 🧠 **Context-Aware Memory**
- Remembers your preferences, home location, work area
- Cross-session conversation history
- Learns your budget patterns

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  User (Browser - PWA)                           │
│  Camera | Mic | Speaker via Web APIs            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Next.js 15 Frontend (React 19)                 │
│  - Gemini 3 Direct Browser Calls                │
│  - Real-time Agent Orchestration                │
│  - PWA with offline support                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  FastAPI Backend (Python 3.12)                  │
│  - Firebase Auth + Firestore                    │
│  - External API Gateway (Mappls, ONDC, etc)     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Multi-Agent Swarm (Gemini 3)                   │
│  ├─ Orchestrator (Pro)                          │
│  ├─ Vision Agent (Flash Vision)                 │
│  ├─ Audio Agent (Audio)                         │
│  ├─ Translation Agent (Pro)                     │
│  ├─ Transport Agent (Pro)                       │
│  ├─ Discovery Agent (Flash)                     │
│  ├─ Action Agent (Pro)                          │
│  └─ Memory Agent (Flash)                        │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, create accounts and obtain API keys for:
1. ✅ **Firebase** - Auth + Firestore (FREE)
2. ✅ **Google Gemini 3 API** ($0-20/month)
3. ✅ **Mappls** - Routing & Places (FREE tier: 2.5K req/day)
4. ✅ **Razorpay** - Payments (FREE in test mode)
5. ⚠️ **ONDC** - Optional for MVP (can mock initially)

📘 **Detailed setup guide:** See [`api_accounts_needed.md`](./api_accounts_needed.md)

---

### 1️⃣ **Clone & Install**

```bash
# Clone the repository
git clone https://github.com/yourusername/namma-guide.git
cd namma-guide

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

### 2️⃣ **Configure Environment Variables**

#### Frontend (`frontend/.env.local`)
```bash
cp frontend/.env.example frontend/.env.local
# Edit .env.local with your Firebase & Gemini credentials
```

#### Backend (`backend/.env`)
```bash
cp backend/.env.example backend/.env
# Edit .env with all API keys
# Place your Firebase service account JSON in backend/config/
```

---

### 3️⃣ **Run Development Servers**

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

🎉 **Open [http://localhost:3000](http://localhost:3000)** in your browser

---

## 📁 Project Structure

```
namma-guide/
├── frontend/                    # Next.js 15 app
│   ├── app/                     # App router pages
│   │   ├── page.tsx             # Home screen (big mic button)
│   │   ├── layout.tsx           # Root layout with PWA
│   │   ├── onboarding/
│   │   ├── transport/
│   │   └── discovery/
│   ├── components/
│   │   ├── agents/              # Agent chat UI components
│   │   │   ├── AgentCard.tsx
│   │   │   └── AgentSelector.tsx
│   │   ├── media/               # Camera, Mic, Speaker
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── VoiceRecorder.tsx
│   │   │   └── SpeakerOutput.tsx
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── gemini.ts            # Direct Gemini 3 client
│   │   ├── firebase.ts          # Firebase config
│   │   └── agents/              # Agent orchestration
│   ├── public/
│   │   └── manifest.json        # PWA manifest
│   └── package.json
│
├── backend/                     # FastAPI server
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── agents/              # Agent router & logic
│   │   │   ├── orchestrator.py
│   │   │   ├── vision_agent.py
│   │   │   └── ...
│   │   ├── tools/               # External API integrations
│   │   │   ├── mappls.py
│   │   │   ├── ondc.py
│   │   │   ├── razorpay.py
│   │   │   └── gtfs.py
│   │   ├── models/              # Pydantic schemas
│   │   └── config/
│   │       └── serviceAccountKey.json  # Firebase (gitignored)
│   └── requirements.txt
│
├── shared/                      # Shared types (optional)
├── firebase.json                # Firebase config
├── .gitignore
└── README.md
```

---

## 🎯 Milestone Roadmap

### ✅ **Milestone 1: Voice + Vision (Week 1)**
- [x] Google login onboarding
- [x] Voice recording with Web Speech API
- [x] Camera capture component
- [x] Gemini 3 integration (audio + vision)
- [x] Live Kannada translation

### 🚧 **Milestone 2: Transport Planner (Week 2)**
- [ ] Mappls route API integration
- [ ] BMTC + Metro GTFS parsing
- [ ] Multi-modal route display
- [ ] Live traffic updates

### 📋 **Milestone 3: Discovery + Payments (Week 3)**
- [ ] ONDC discovery mock
- [ ] Razorpay payment flow
- [ ] Booking confirmation
- [ ] Memory persistence in Firestore

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** Tailwind CSS + shadcn/ui + lucide-react
- **PWA:** next-pwa
- **AI SDK:** @google/generative-ai
- **State:** Zustand + TanStack Query
- **Media:** Web Speech API + MediaRecorder

### Backend
- **Framework:** FastAPI (Python 3.12)
- **Server:** Uvicorn + Gunicorn
- **Database:** Firebase Firestore
- **Auth:** Firebase Admin SDK
- **HTTP Client:** httpx
- **Validation:** Pydantic v2

### AI & APIs
- **LLM:** Gemini 3 (Pro, Flash, Flash Vision, Audio)
- **Maps:** Mappls (Routes, Traffic, Places)
- **Mobility:** ONDC Network (Beckn protocol)
- **Payments:** Razorpay (UPI, Orders)
- **Transit:** BMTC/BMRCL GTFS via IUDX

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway / Fly.io / Cloud Run)
```bash
cd backend
# Railway: railway up
# Fly.io: fly deploy
# Cloud Run: gcloud run deploy
```

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- Built with ❤️ for Bengaluru newcomers
- Powered by Google Gemini 3
- Inspired by the Namma Yatri movement
- Special thanks to BMTC, BMRCL, and ONDC for open data

---

## 📞 Support

- **Docs:** [Full documentation](./docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/namma-guide/issues)
- **Discord:** [Join our community](#)

---

**Made with 🏙️ in Bengaluru**
