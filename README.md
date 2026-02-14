# Namma Guide - Multimodal AI Assistant for Bengaluru 🏙️

A real-time, voice-first AI assistant for Bengaluru powered by Gemini Live API with vision, voice, and function calling capabilities.

## ✨ Features

### 🎤 Voice Interaction
- **Real-time bidirectional audio streaming** with Gemini Live API
- **Low-latency voice responses** using native audio (PCM encoding)
- **Hands-free operation** - just speak naturally
- **Visual feedback** with animated waveforms for listening/speaking states

### 👁️ Vision Capabilities
- **Live camera stream** to Gemini AI
- **Scene description** and object recognition
- **Face recognition** for personalized greetings
- **Text reading** from signs and documents
- **Real-time visual analysis** (1 frame per second)

### 🔧 Function Calling
- **Transport Integration**: Search metro routes, bus info, cab estimates
  - Example: "Rajajinagar to MG Road metro route"
- **Discovery Integration**: Find restaurants, cafes, parks, attractions
  - Example: "Best dosa near Koramangala"
- **Real-time data** from backend APIs

### 🗣️ Multi-language Support
- **Kannada & English** - speak in either language or mix both
- **Natural local slang** - understands "anna", "akka", "swalpa", etc.
- **Code-switching** - seamlessly switches between languages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and Python 3.12+
- Gemini API key (with Live API access)
- Webcam and microphone

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PavanJ-16/NammaOoru.git
cd NammaOoru
```

2. **Setup Frontend**
```bash
cd frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

3. **Setup Backend**
```bash
cd ../backend
pip install -r requirements.txt
```

Create `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_maps_key (optional)
```

4. **Run the Application**

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

5. **Access the App**
- Open http://localhost:3000/voice
- Click the microphone button
- Allow microphone (and camera) access
- Start speaking!

## 🎯 Usage Examples

### Voice Commands

**Transport:**
- "How do I get from Rajajinagar to MG Road?"
- "Show me the metro route to Indiranagar"
- "Bus from Whitefield to Electronic City"

**Discovery:**
- "Best coffee shops near me"
- "Find vegetarian restaurants in Koramangala"
- "Where can I get authentic dosas?"

**Vision:**
- "Who am I?" (with camera on)
- "What do you see?"
- "Describe this place"
- "Read this sign for me"

**Multi-language:**
- "ನಮಸ್ತೆ, ನನಗೆ ಸಹಾಯ ಮಾಡಿ" (Namaste, help me)
- "MG Road ge hege hogodu?" (How to go to MG Road?)
- Mix Kannada and English naturally!

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js 15)   │
│                 │
│  - Voice UI     │
│  - Camera       │
│  - WebSocket    │
└────────┬────────┘
         │
         │ WebSocket
         │
┌────────▼────────────────────┐
│   Gemini Live API           │
│  (Google AI)                │
│                             │
│  - Speech-to-Text           │
│  - Vision Analysis          │
│  - LLM Processing           │
│  - Text-to-Speech           │
│  - Function Calling         │
└────────┬────────────────────┘
         │
         │ Function Calls
         │
┌────────▼────────┐
│   Backend       │
│  (FastAPI)      │
│                 │
│  - Transport    │
│  - Discovery    │
│  - Translation  │
└─────────────────┘
```

## 📱 Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Web Audio API** - Audio processing
- **MediaStream API** - Camera access

### Backend
- **FastAPI** - Python web framework
- **Google Maps API** - Location data
- **Gemini API** - AI capabilities

### AI Model
- **Gemini 2.5 Flash** with Native Audio
  - Model: `gemini-2.5-flash-native-audio-preview-12-2025`
  - Supports: Audio input/output, Vision, Function calling
  - Sample rate: 24kHz output, 16kHz input
  - Format: PCM16

## 🔒 Security

- API keys are stored in environment variables
- No API keys in client-side code
- CORS enabled for local development
- Camera/mic permissions required

## 🎨 UI/UX Features

- **Animated waveforms** for audio activity
- **Pulsing glow effects** during interaction
- **Real-time status indicators**
- **Live camera preview** with recording indicator
- **Conversation log** for debugging
- **Feature cards** highlighting capabilities

## 📝 Implementation Notes

### Audio Processing
- **Input**: 16kHz PCM16 mono from microphone
- **Output**: 24kHz PCM16 mono from Gemini
- **Latency**: ~500ms typical
- **Chunk size**: 4096 samples

### Vision Processing
- **Frame rate**: 1 FPS (adjustable)
- **Resolution**: 640x480
- **Format**: JPEG (80% quality)
- **Base64 encoding** for transmission

### Function Calling
- Functions are declared in setup message
- Gemini decides when to call functions
- Results are sent back for natural response

## 🐛 Troubleshooting

**No audio output:**
- Check browser audio permissions
- Ensure speakers/headphones are connected
- Check Gemini API key validity

**Camera not working:**
- Check browser camera permissions
- Ensure no other app is using camera
- Try different browser (Chrome recommended)

**Connection errors:**
- Verify API key has Live API access
- Check internet connection
- Look for CORS errors in console

## 🚧 Roadmap

- [ ] Real API integration for transport  
- [x] Vision capability with camera
- [x] Function calling
- [ ] Screen sharing
- [ ] Multi-turn conversations with context
- [ ] Firestore persistence
- [ ] User preferences
- [ ] Mobile app (React Native)

## 📄 License

MIT License - see LICENSE file

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 👨‍💻 Author

**PavanJ-16**

---

Built with ❤️ in Bengaluru using Gemini Live API
