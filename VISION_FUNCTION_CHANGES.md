# Vision Function Calling Implementation

## Changes Needed:

### 1. Add captureImage to function declarations (in setup message around line 215):

```typescript
{
  name: 'captureImage', 
description: 'Capture and analyze the current camera view. Use when user asks "what do you see", "who am I", "describe this". Camera must be on.',
  parameters: {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        description: 'Why capturing (e.g., "user asked what I can see")'
      }
    },
    required: []
  }
}
```

### 2. Add captureImage handler in handleFunctionCall (around line 340):

```typescript
else if (name === 'captureImage') {
  addLog(`📸 Capturing image: ${args.reason || 'on request'}`);
  
  if (!isCameraOn || !videoRef.current || !canvasRef.current) {
    result = { error: 'Camera not on' };
  } else {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
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
            addLog('📸 Image sent to Gemini');
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', 0.9);
      
      result = { success: true, message: 'Image captured' };
    } else {
      result = { error: 'Video not ready' };
    }
  }
}
```

### 3. Update console.log to addLog in handleFunctionCall:

```typescript
addLog(`🔧 Function called: ${name}`);
// and at the end:
addLog(`📤 Response sent for ${name}`);
```

### 4. Add Debug Log Panel in UI (before camera preview around line 670):

```typescript
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
```

This will restore debug logs and add on-demand vision!
