"""
Simplified LiveKit Voice Agent - Basic Connection Test
"""
import os
import logging
from dotenv import load_dotenv
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli

load_dotenv()
logger = logging.getLogger("namma-guide")
logging.basicConfig(level=logging.INFO)


async def entrypoint(ctx: JobContext):
    """Main entry point for LiveKit agent"""
    logger.info("🏙️ Namma Guide agent starting...")
    
    try:
        # Connect to room
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
        logger.info("✅ Connected to LiveKit room")
        
        # Wait for participant
        participant = await ctx.wait_for_participant()
        logger.info(f"👤 Participant joined: {participant.identity}")
        
        # Agent is now ready and listening
        logger.info("🎤 Voice agent ready!")
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")


if __name__ == "__main__":
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    ws_url = os.getenv("LIVEKIT_URL")
    
    logger.info(f"Starting agent with URL: {ws_url}")
    logger.info(f"API Key configured: {bool(api_key)}")
    logger.info(f"API Secret configured: {bool(api_secret)}")
    
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            api_key=api_key,
            api_secret=api_secret,
            ws_url=ws_url,
        )
    )
