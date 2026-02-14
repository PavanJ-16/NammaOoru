# LiveKit Voice Assistant - Quick Start

## Prerequisites
- LiveKit API Secret (get from LiveKit dashboard)
- Python 3.10+
- Node.js 18+

## Setup Steps

### 1. Add LiveKit Secret
Open `backend/.env` and add your LiveKit API secret:
```bash
LIVEKIT_API_SECRET=your_secret_here
```

### 2. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 4. Start the Services

**Terminal 1 - Backend API:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Terminal 2 - LiveKit Agent:**
```bash
cd backend
python livekit_agent.py start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## Usage

1. Open http://localhost:3000
2. Click "Voice Mode"
3. Click "Start Voice Chat"
4. Just start talking!

## Example Conversations

**Transport:**
- "How do I get to MG Road?"
- "Show me the metro to Koramangala"

**Discovery:**
- "Find me good dosa places"
- "Where can I get coffee nearby?"

**Translation:**
- "How do I say 'how much' in Kannada?"
- "Translate 'stop here' to Kannada"

**Camera:**
- "Read this sign for me"
- "What does this menu say?"

## Troubleshooting

**Agent won't start:**
- Check LIVEKIT_API_SECRET is set in backend/.env
- Ensure all dependencies installed

**Can't connect:**
- Make sure backend API is running on port 8000
- Check LiveKit agent is running

**No audio:**
- Allow microphone permissions in browser
- Check browser console for errors

## Configuration

LiveKit URL: `wss://gemini-hacks-zf0zga46.livekit.cloud`
LiveKit API Key: `API56dnEdLi3SGr`
LiveKit API Secret: (add to .env)
