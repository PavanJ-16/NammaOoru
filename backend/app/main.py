"""
FastAPI Backend for Namma Guide - Simplified
Provides REST API and LiveKit token generation
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="Namma Guide API",
    description="AI-powered Bengaluru city companion",
    version="1.0.0"
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Namma Guide API - Bengaluru AI Companion"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Namma Guide API is running",
        "livekit": "configured" if os.getenv("LIVEKIT_API_KEY") else "not configured"
    }


@app.post("/livekit/token")
async def create_livekit_token(request: dict):
    """Generate LiveKit access token for voice session"""
    try:
        from livekit import api
        from uuid import uuid4
        
        # Get credentials
        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        
        if not api_key or not api_secret:
            raise HTTPException(status_code=500, detail="LiveKit not configured")
        
        # Get user identity from request or generate
        user_id = request.get("userId", f"user-{uuid4()}")
        room_name = request.get("room", "namma-guide")
        
        # Create token
        token = api.AccessToken(api_key, api_secret)
        token.with_identity(user_id)
        token.with_name(request.get("userName", "Guest"))
        token.with_grants(
            api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
            )
        )
        
        # Return token
        return {
            "token": token.to_jwt(),
            "url": os.getenv("LIVEKIT_URL"),
            "room": room_name
        }
    except Exception as e:
        logger.error(f"Token generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
