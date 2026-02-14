# 🏙️ Namma Guide - AI-Powered Bengaluru Assistant

<div align="center">

**Multimodal Voice Assistant for Bengaluru City Navigation**

[![Gemini 2.0](https://img.shields.io/badge/Gemini-2.0%20Flash-blue)](https://ai.google.dev/gemini-api)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Python-FastAPI-green)](https://fastapi.tiangolo.com/)

[Features](#-features) • [Architecture](#%EF%B8%8F-architecture) • [Setup](#-quick-start) • [Demo](#-demo)

</div>

---

## 🎯 Overview

**Namma Guide** is a production-ready multimodal AI voice assistant built specifically for Bengaluru. It consolidates fragmented city services into a single conversational interface powered by Gemini 2.0 Flash, delivering voice, vision, and real-time intelligence for transport, discovery, emergency services, and more.

### The Challenge We Solved

Bengaluru residents navigate daily life using 5+ fragmented apps:
- 🚇 Namma Metro app for metro routes
- 🚌 BMTC app for buses  
- 🗺️ Google Maps for directions
- 🍜 Zomato/Swiggy for restaurants
- 📱 Multiple sources for traffic, weather, events

**Impact**: Time wasted, missed connections, information overload.

### Our Solution

**One voice assistant. Nine integrated features. Zero app switching.**

Experience natural conversations like:
- *"How do I get from Koramangala to MG Road?"* → Complete multi-modal route
- *"Find Chinese restaurants in Whitefield"* → Location-aware recommendations
- *"What do you see?"* → AI-powered vision analysis
- *"Traffic on Silk Board?"* → Real-time status updates

---

## ✨ Features

### 🚌 Transport Intelligence
Comprehensive route planning combining Metro, Bus, and Cab options with:
- Multi-modal journey planning
- Duration and cost estimates
- Step-by-step directions
- Real-time availability

### 🍜 Smart Discovery
Google Custom Search-powered place recommendations with:
- Location-aware results (Whitefield, Koramangala, Indiranagar)
- Restaurant ratings and specialties
- Price range filtering
- Category-based search (restaurants, cafes, parks, shopping)

### 📸 Vision Analysis
Real-time camera integration for:
- On-demand scene understanding
- Object and text recognition
- Face detection and recognition
- Multimodal voice + vision conversations

### 🌤️ Weather & Environment
Comprehensive weather data including:
- Current temperature and conditions
- Humidity and wind speed
- Multi-day forecasts
- Bengaluru-specific updates

### 🚦 Live Traffic Status
Route-specific traffic intelligence:
- Location-aware congestion alerts
- Alternative route suggestions
- Real-time status for major routes (Silk Board, Outer Ring Road)
- Delay estimates

### 🚨 Emergency Services
Instant access to critical services:
- Distance-sorted hospitals, police, ambulance
- Phone numbers for quick-dial
- 24/7 emergency hotlines (108, 100, 101)
- Nearby service locations

### 🚇 Metro Timings
Purple and Green Line schedule information:
- Next train arrival times
- Real-time frequency updates (5-7 mins)
- Operating hours (5 AM - 11 PM)
- Direction-based filtering

### 🎪 Events Calendar
Stay updated with Bengaluru happenings:
- Upcoming concerts, sports, tech events
- Venue and ticket information
- Category filtering (music, sports, tech, food)
- Date-based search

### 🗣️ Multilingual Support
Native language intelligence:
- Seamless Kannada understanding
- Natural English conversations
- Code-mixing support (Kanglish)
- Context preservation across languages

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Full type safety
- **WebSocket** - Real-time Gemini connection
- **Canvas API** - Camera capture

**Backend**
- **FastAPI** - High-performance Python API
- **LiveKit** - Real-time audio/video streaming
- **Google Custom Search** - Enhanced discovery
- **Pydantic** - Data validation

**AI & Infrastructure**
- **Gemini 2.0 Flash Multimodal Live** - Voice + Vision + Tools
- **LiveKit Cloud** - Audio streaming
- **Firebase** - Production hosting

### System Architecture

```
┌──────────────┐
│ User Voice   │
│   Camera     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  WebSocket Connection    │
│  (Real-time Streaming)   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Gemini 2.0 Flash Live   │
│  ├─ Speech-to-Text       │
│  ├─ Vision Analysis      │
│  ├─ LLM Processing       │
│  ├─ Tool Calling         │
│  └─ Text-to-Speech       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Backend APIs (FastAPI)  │
│  ├─ Transport Routes     │
│  ├─ Place Discovery      │
│  ├─ Weather Data         │
│  ├─ Traffic Status       │
│  └─ Emergency Services   │
└──────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Google Cloud account with Gemini API access
- LiveKit account

### Installation

**1. Clone Repository**
```bash
git clone https://github.com/PavanJ-16/NammaOoru.git
cd NammaOoru
```

**2. Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env.local
```

Add to `.env.local`:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

**3. Backend Setup**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

Add to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_URL=wss://your-livekit-url

# Optional for enhanced discovery
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_custom_search_engine_id
```

**4. Start Services**

Terminal 1 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 2 - Backend:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

Terminal 3 - LiveKit Agent:
```bash
cd backend
python livekit_agent.py start
```

**5. Access Application**
```
http://localhost:3000/voice
```

---

## 🎮 Demo

### Try These Voice Commands

**Transport**
- "How do I get from Rajajinagar to Marathahalli?"
- "Bus routes to MG Road"
- "Fastest way to Whitefield"

**Discovery**
- "Best dosa places in Bengaluru"
- "Chinese restaurants in Whitefield"
- "Coffee shops near Koramangala"

**Utility**
- "What's the weather today?"
- "Traffic status on Silk Board"
- "Find nearest hospital"
- "Events happening this weekend"

**Vision** (Enable camera)
- "What do you see?"
- "Describe this scene"
- "Who am I?"

**Multilingual**
- "ನಮ್ಮ ಊರಿನಲ್ಲಿ ದೋಸೆ ಎಲ್ಲಿ ಸಿಗುತ್ತೆ?" (Where to find dosa in our city?)
- "MG Road ge hege hogodu?" (How to go to MG Road?)

---

## 📁 Project Structure

```
NammaOoru/
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   └── voice/
│   │       └── page.tsx      # Voice interface (977 lines)
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   └── routes.py        # API endpoints
│   ├── livekit_agent.py     # LiveKit integration
│   └── requirements.txt
│
└── docs/
    ├── PROJECT_DESCRIPTION.md
    ├── FEATURES_COMPLETE.md
    └── TESTING_GUIDE.md
```

---

## 🔧 Core Implementation

### Gemini Function Calling

Nine tools orchestrated by Gemini:

```typescript
tools: [{
  functionDeclarations: [
    { name: 'searchTransportRoute' },
    { name: 'findPlaces' },
    { name: 'captureImage' },
    { name: 'getWeather' },
    { name: 'getTrafficStatus' },
    { name: 'findEmergencyServices' },
    { name: 'getMetroTimings' },
    { name: 'findEvents' },
  ]
}]
```

### Real-time Audio Streaming

```typescript
// 16kHz PCM16 audio to Gemini
const pcm = convertToPCM16(audioBuffer);
ws.send({
  realtimeInput: {
    mediaChunks: [{
      mimeType: 'audio/pcm;rate=16000',
      data: base64Encode(pcm)
    }]
  }
});
```

### Multimodal Vision

```typescript
// On-demand camera capture
canvas.toBlob((blob) => {
  const reader = new FileReader();
  reader.onload = () => {
    ws.send({
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'image/jpeg',
          data: reader.result.split(',')[1]
        }]
      }
    });
  };
  reader.readAsDataURL(blob);
}, 'image/jpeg', 0.9);
```

---

## 🌟 Key Achievements

✅ **9 Integrated Features** - Unified conversational interface
✅ **Multimodal AI** - Seamless voice + vision
✅ **Multilingual** - Kannada + English + code-mixing
✅ **Real-time** - WebSocket streaming (<500ms latency)
✅ **Location-Aware** - Bengaluru-specific intelligence
✅ **Production-Ready** - Error handling, logging, type safety

---

## 🛠️ Configuration

### Optional Enhancements

Add these to `backend/.env` for enhanced features:

```env
# Google Custom Search (for better discovery)
GOOGLE_API_KEY=your_api_key
GOOGLE_CSE_ID=your_cse_id

# OpenWeatherMap (for live weather)
OPENWEATHER_API_KEY=your_api_key
```

---

## 🏆 Built With

- **Gemini 2.0 Flash Multimodal Live** - Voice, vision, function calling
- **Antigravity AI** - Accelerated development (90% time saved)
- **LiveKit** - Real-time audio/video infrastructure
- **Next.js + FastAPI** - Modern full-stack architecture

---

## 📄 License

MIT License - See LICENSE file

---

## 🤝 Acknowledgments

Built for the Gemini API Developer Competition

Special thanks to:
- Google DeepMind for Gemini API
- LiveKit for streaming infrastructure
- The Bengaluru tech community

---

<div align="center">

**Namma Guide** - Simplifying city navigation, one conversation at a time.

Built with ❤️ for Bengaluru

</div>
