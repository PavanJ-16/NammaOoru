"use client";

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Bus, UtensilsCrossed, Languages, Camera, CameraOff } from 'lucide-react';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function GeminiLiveVoice() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Click to start');
  const [messages, setMessages] = useState<string[]>([]);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  // Helper to add debug logs
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${msg}`;
    console.log(logEntry);
    setDebugLog(prev => [...prev.slice(-20), logEntry]); // Keep last 20 logs
  };

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const playAudioChunk = async (audioData: ArrayBuffer) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    try {
      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      source.onended = () => {
        if (audioQueueRef.current.length > 0) {
          const next = audioQueueRef.current.shift();
          if (next) playAudioChunk(next);
        } else {
          isPlayingRef.current = false;
          setIsSpeaking(false);
        }
      };

      source.start();
      setIsSpeaking(true);
    } catch (error) {
      console.error('Audio playback error:', error);
      isPlayingRef.current = false;
      setIsSpeaking(false);
    }
  };

  const captureAndSendFrame = () => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Capture frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Convert to base64 JPEG
    canvas.toBlob((blob) => {
      if (!blob) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];

        const message = {
          realtimeInput: {
            mediaChunks: [{
              mimeType: 'image/jpeg',
              data: base64data,
            }]
          }
        };

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(message));
        }
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.8);
  };

  const startCamera = async () => {
    try {
      addLog('🎥 Requesting camera access...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack?.getSettings();
      addLog(`✅ Got camera stream: ${settings?.width}x${settings?.height}, active=${stream.active}`);

      videoStreamRef.current = stream;

      // Set camera on FIRST so the video element renders
      setIsCameraOn(true);

      // Wait for video element to be rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!videoRef.current) {
        addLog('❌ Video element not found! Retrying...');
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (videoRef.current) {
        addLog('📺 Setting video srcObject...');
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          addLog(`📹 Metadata loaded: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`);
          videoRef.current?.play()
            .then(() => {
              addLog('✅ Video playing successfully!');
              addLog('💡 Vision is on-demand - say "what do you see?"');
            })
            .catch(err => {
              addLog(`❌ Play failed: ${err.message}`);
              setMessages(prev => [...prev, `Play error: ${err.message}`]);
            });
        };
      } else {
        addLog('❌ CRITICAL: Video element still null after wait!');
        setMessages(prev => [...prev, 'Video element not found - UI issue']);
      }

    } catch (error: any) {
      addLog(`❌ Camera error: ${error.message || error}`);
      setMessages(prev => [...prev, `Camera error: ${error.message || error}`]);
    }
  };

  const stopCamera = () => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }

    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop());
      videoStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  };

  const startStreaming = async () => {
    try {
      setStatusMessage('Connecting to Gemini...');
      console.log('🔌 Connecting to Gemini Live API...');

      const ws = new WebSocket(
        `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`
      );

      ws.onopen = () => {
        console.log('🟢 WebSocket connected');
        setIsConnected(true);
        setStatusMessage('Setting up...');

        const setupMessage = {
          setup: {
            model: 'models/gemini-2.5-flash-native-audio-preview-12-2025',
            generationConfig: {
              responseModalities: 'audio'
            },
            systemInstruction: {
              parts: [{
                text: `You are Namma Guide, a friendly AI assistant for Bengaluru with vision and multimodal capabilities.

CORE CAPABILITIES:
- Transport: Help with metro routes, bus info, cab estimates, traffic updates via function calling
- Discovery: Recommend restaurants, cafes, parks, shopping, attractions via function calling  
- Translation: Understand and respond in Kannada, English, or mix
- Vision: Identify people, places, read signs, describe scenes from camera

PERSONALITY:
- Brief and conversational for voice
- Use local Kannada terms naturally (anna, akka, swalpa, etc)
- Friendly and helpful like a Bengaluru local
- When seeing someone, greet them warmly

AVAILABLE FUNCTIONS (use when appropriate):
- searchTransportRoute: When user asks about routes, metros, buses
- findPlaces: When user asks about restaurants, cafes, places to visit

Keep responses short and to the point for voice interaction.`
              }]
            },
            tools: [{
              functionDeclarations: [
                {
                  name: 'searchTransportRoute',
                  description: 'Search for transport routes between two locations in Bengaluru including metro, bus, and cab options',
                  parameters: {
                    type: 'object',
                    properties: {
                      from: {
                        type: 'string',
                        description: 'Starting location'
                      },
                      to: {
                        type: 'string',
                        description: 'Destination location'
                      },
                      mode: {
                        type: 'string',
                        enum: ['metro', 'bus', 'cab', 'all'],
                        description: 'Preferred mode of transport'
                      }
                    },
                    required: ['from', 'to']
                  }
                },
                {
                  name: 'findPlaces',
                  description: 'Find restaurants, cafes, parks, or other places in Bengaluru',
                  parameters: {
                    type: 'object',
                    properties: {
                      query: {
                        type: 'string',
                        description: 'What to search for (e.g., "best dosa", "coffee shops", "parks")'
                      },
                      location: {
                        type: 'string',
                        description: 'Area or neighborhood to search in'
                      },
                      category: {
                        type: 'string',
                        enum: ['restaurant', 'cafe', 'park', 'shopping', 'attraction'],
                        description: 'Category of place'
                      }
                    },
                    required: ['query']
                  }
                },
                {
                  name: 'captureImage',
                  description: 'Capture and analyze the current camera view. Use this when user asks "what do you see", "who am I", "describe this", or any vision-related question. Camera must be turned on first.',
                  parameters: {
                    type: 'object',
                    properties: {
                      reason: {
                        type: 'string',
                        description: 'Why you are capturing the image (e.g., "user asked what I can see")'
                      }
                    },
                    required: []
                  }
                }
              ]
            }]
          }
        };

        console.log('📤 Sending setup');
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = async (event) => {
        try {
          let response;

          if (event.data instanceof Blob) {
            const text = await event.data.text();
            response = JSON.parse(text);
          } else {
            response = JSON.parse(event.data);
          }

          console.log('📥 Received:', response);

          if (response.setupComplete) {
            console.log('✅ Setup complete! Starting microphone...');
            setStatusMessage('Ready! Speak now...');
            startMicrophone();
            return;
          }

          if (response.serverContent) {
            const parts = response.serverContent.modelTurn?.parts || [];

            for (const part of parts) {
              if (part.inlineData?.mimeType?.includes('audio')) {
                const audioData = base64ToArrayBuffer(part.inlineData.data);

                if (isPlayingRef.current) {
                  audioQueueRef.current.push(audioData);
                } else {
                  isPlayingRef.current = true;
                  playAudioChunk(audioData);
                }
              }

              if (part.text) {
                console.log('💬 AI:', part.text);
                setMessages(prev => [...prev, `AI: ${part.text}`]);
              }

              // Handle function calls (singular - deprecated format)
              if (part.functionCall) {
                console.log('🔧 Function call (old format):', part.functionCall);
                handleFunctionCall(part.functionCall);
              }
            }
          }

          // Handle function calls (new format - toolCall with functionCalls array)
          if (response.toolCall) {
            console.log('🔍 DEBUG: toolCall detected:', response.toolCall);
            addLog(`🔍 toolCall received: ${JSON.stringify(response.toolCall)}`);

            if (response.toolCall.functionCalls) {
              console.log('🔍 DEBUG: functionCalls array:', response.toolCall.functionCalls);
              response.toolCall.functionCalls.forEach((fc: any) => {
                console.log('🔧 Function call (new format):', fc);
                addLog(`🔧 Calling: ${fc.name}`);
                handleFunctionCall(fc);
              });
            } else {
              console.log('❌ DEBUG: toolCall exists but no functionCalls array!');
              addLog('❌ toolCall missing functionCalls array');
            }
          }

          if (response.error) {
            console.error('❌ Server error:', response.error);
            setStatusMessage(`Error: ${response.error.message || 'Unknown'}`);
            setMessages(prev => [...prev, `Error: ${response.error.message}`]);
          }
        } catch (error) {
          console.error('Failed to parse:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setStatusMessage('Connection error - check API key');
        setMessages(prev => [...prev, 'WebSocket error - check console']);
      };

      ws.onclose = (event) => {
        console.log('🔴 Closed:', event.code, event.reason);
        setIsConnected(false);
        setStatusMessage(`Disconnected (${event.code})`);
        if (event.reason) {
          setMessages(prev => [...prev, `Reason: ${event.reason}`]);
        }
        stopStreaming();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Connection failed:', error);
      setStatusMessage('Failed to connect');
      setMessages(prev => [...prev, `Error: ${error}`]);
    }
  };

  const handleFunctionCall = async (functionCall: any) => {
    const { name, args } = functionCall;

    addLog(`🔧 Function called: ${name}`);
    let result;

    if (name === 'searchTransportRoute') {
      addLog(`🚌 Searching: ${args.from} → ${args.to}`);
      result = {
        from: args.from,
        to: args.to,
        routes: ['Metro: Purple Line', 'Bus: 500K', 'Cab: ₹250-300']
      };
    } else if (name === 'findPlaces') {
      addLog(`🍜 Finding: ${args.query}`);
      result = {
        query: args.query,
        places: ['MTR', 'Vidyarthi Bhavan', 'CTR']
      };
    } else if (name === 'captureImage') {
      addLog(`📸 Capturing image: ${args.reason || 'on request'}`);

      // Check actual camera stream, not state (avoid closure issues)
      const hasCameraStream = videoStreamRef.current?.active || false;

      // Debug: Check each requirement
      addLog(`🔍 Camera state: streamActive=${hasCameraStream}, videoRef=${!!videoRef.current}, canvasRef=${!!canvasRef.current}`);

      if (!hasCameraStream) {
        result = { error: 'Camera not turned on' };
        addLog('❌ Camera stream is not active');
      } else if (!videoRef.current) {
        result = { error: 'Video element not found' };
        addLog('❌ Video element is null');
      } else if (!canvasRef.current) {
        result = { error: 'Canvas element not found' };
        addLog('❌ Canvas element is null');
      } else {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        addLog(`🔍 Video dimensions: ${video.videoWidth}x${video.videoHeight}`);

        if (ctx && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          canvas.toBlob(async (blob) => {
            if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = (reader.result as string).split(',')[1];

                const message = {
                  realtimeInput: {
                    mediaChunks: [{ mimeType: 'image/jpeg', data: base64data }]
                  }
                };

                wsRef.current?.send(JSON.stringify(message));
                addLog('📸 Image sent to Gemini for analysis');
              };
              reader.readAsDataURL(blob);
            }
          }, 'image/jpeg', 0.9);

          result = { success: true, message: 'Image captured and sent for analysis' };
        } else {
          result = { error: 'Video not ready yet' };
          addLog('❌ Video element not ready');
        }
      }
    }

    // Send function response back
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        toolResponse: {
          functionResponses: [{
            id: functionCall.id,
            name: name,
            response: result
          }]
        }
      };

      wsRef.current.send(JSON.stringify(message));
      addLog(`📤 Response sent for ${name}`);
    }
  };

  const startMicrophone = async () => {
    try {
      console.log('🎤 Requesting microphone...');

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      audioStreamRef.current = stream;
      const source = audioContextRef.current.createMediaStreamSource(stream);

      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);

          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          const base64Audio = arrayBufferToBase64(pcmData.buffer);

          const message = {
            realtimeInput: {
              mediaChunks: [{
                mimeType: 'audio/pcm;rate=16000',
                data: base64Audio,
              }]
            }
          };

          wsRef.current.send(JSON.stringify(message));
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      setIsRecording(true);
      console.log('✅ Microphone started with PCM encoding');
    } catch (error) {
      console.error('❌ Mic error:', error);
      setStatusMessage('Microphone denied');
      setMessages(prev => [...prev, 'Please allow microphone access']);
    }
  };

  const stopStreaming = () => {
    stopCamera();

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setIsConnected(false);
    setIsSpeaking(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  };

  const toggleConnection = () => {
    if (isConnected) {
      stopStreaming();
      setStatusMessage('Click to start');
    } else {
      setMessages([]);
      startStreaming();
    }
  };

  const toggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  useEffect(() => {
    return () => stopStreaming();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <a href="/" className="text-3xl hover:opacity-80">🏙️</a>
            <div>
              <h1 className="text-xl font-bold text-white">Namma Guide Voice + Vision</h1>
              <p className="text-sm text-gray-400">AI assistant for Bengaluru</p>
            </div>
          </div>

          <button
            onClick={toggleCamera}
            disabled={!isConnected}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isCameraOn
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-white/10 hover:bg-white/20 text-gray-300'
              } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
            {isCameraOn ? 'Camera On' : 'Camera Off'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-8 max-w-6xl mx-auto w-full">
        {/* Main Voice Interface */}
        <div className="flex-1">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${isConnected
                ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                : 'bg-gray-600/20 text-gray-300 border border-gray-500/30'
                }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">{statusMessage}</h2>

            <div className="flex items-center justify-center gap-6">
              {isRecording && (
                <div className="flex items-center gap-3 animate-pulse">
                  <Mic className="w-5 h-5 text-red-500" />
                  <span className="text-red-400 font-medium">Listening</span>
                  <div className="flex gap-1 items-end">
                    <div className="w-1 h-3 bg-red-500 rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                    <div className="w-1 h-5 bg-red-500 rounded-full animate-[bounce_0.6s_ease-in-out_0.1s_infinite]" />
                    <div className="w-1 h-4 bg-red-500 rounded-full animate-[bounce_0.6s_ease-in-out_0.2s_infinite]" />
                    <div className="w-1 h-6 bg-red-500 rounded-full animate-[bounce_0.6s_ease-in-out_0.3s_infinite]" />
                    <div className="w-1 h-3 bg-red-500 rounded-full animate-[bounce_0.6s_ease-in-out_0.4s_infinite]" />
                  </div>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-3 animate-pulse">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-400 font-medium">Speaking</span>
                  <div className="flex gap-1 items-end">
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-[bounce_0.5s_ease-in-out_infinite]" />
                    <div className="w-1 h-6 bg-blue-500 rounded-full animate-[bounce_0.5s_ease-in-out_0.1s_infinite]" />
                    <div className="w-1 h-5 bg-blue-500 rounded-full animate-[bounce_0.5s_ease-in-out_0.2s_infinite]" />
                    <div className="w-1 h-7 bg-blue-500 rounded-full animate-[bounce_0.5s_ease-in-out_0.3s_infinite]" />
                    <div className="w-1 h-4 bg-blue-500 rounded-full animate-[bounce_0.5s_ease-in-out_0.4s_infinite]" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {isRecording && (
                <>
                  <div className="absolute inset-0 w-40 h-40 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                  <div className="absolute inset-0 w-40 h-40 rounded-full bg-red-500/10 animate-pulse" />
                </>
              )}
              {isSpeaking && (
                <>
                  <div className="absolute inset-0 w-40 h-40 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '1s' }} />
                  <div className="absolute inset-0 w-40 h-40 rounded-full bg-blue-500/10 animate-pulse" />
                </>
              )}

              <button
                onClick={toggleConnection}
                className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-2xl ${isConnected
                  ? 'bg-gradient-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                  }`}
              >
                {isConnected ? (
                  <MicOff className="w-20 h-20 text-white" />
                ) : (
                  <Mic className="w-20 h-20 text-white" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              ✨ Features Available
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Bus className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium text-sm">Transport</div>
                  <div className="text-gray-400 text-xs">Metro routes, bus info, cab estimates, traffic</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <UtensilsCrossed className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium text-sm">Discovery</div>
                  <div className="text-gray-400 text-xs">Restaurants, cafes, parks, shopping, attractions</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Languages className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium text-sm">Multi-language</div>
                  <div className="text-gray-400 text-xs">Speak in Kannada, English, or mix both!</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <Camera className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium text-sm">Vision</div>
                  <div className="text-gray-400 text-xs">Show me things, I can see and describe!</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400">
                <strong>Try:</strong> "Who am I?" • "What do you see?" • "Find dosa near Koramangala"
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-48 overflow-y-auto">
              <h4 className="text-white font-semibold mb-2 text-sm">Conversation:</h4>
              <div className="space-y-1 text-xs font-mono">
                {messages.map((msg, idx) => (
                  <div key={idx} className={msg.startsWith('AI:') ? 'text-blue-300' : 'text-gray-400'}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Debug Log Panel */}
        <div className="w-96">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 mb-4">
            <h4 className="text-white font-semibold mb-2 text-sm">🔍 Debug Log</h4>
            <div className="bg-black/30 rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs">
              {debugLog.length === 0 ? (
                <div className="text-gray-500">No logs yet. Click mic to start.</div>
              ) : (
                debugLog.map((log, idx) => (
                  <div key={idx} className="text-green-400 mb-1">{log}</div>
                ))
              )}
            </div>
          </div>

          {/* Camera Preview */}
          {isCameraOn && (
            <div className="w-96">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Camera View
                </h3>
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-600 rounded-full text-white text-xs flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Live
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Sending frames to Gemini • AI can see and describe what's in view
                </p>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
