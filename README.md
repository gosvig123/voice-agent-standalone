# Voice Agent Vite React Demo

This is a complete React application demonstrating how to integrate the Voice Agent standalone library with a modern Vite + React frontend.

## Features

- 🎤 **Voice Controls**: Start, end, and manage voice calls
- 🔄 **Context Switching**: Switch between SDR and Recruiter contexts
- 🔊 **Real-time Audio**: Live volume indicators and speech detection  
- 🎛️ **Mute Controls**: Toggle microphone on/off during calls
- 📊 **Function Call Monitoring**: See when AI functions are executed
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file with your Vapi public key:
   ```env
   VITE_VAPI_PUBLIC_KEY=your_vapi_public_key_here
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:5173`

## How to Use

### Starting a Call

1. **Select Context**: Choose between "SDR" or "Recruiter" from the dropdown
2. **Start Call**: Click "Start Call" to begin a voice conversation
3. **Speak**: Talk naturally - the AI will respond based on the selected context

### Available Contexts

#### 🎯 SDR (Sales Development Representative)
Perfect for sales outreach and lead qualification:
- **Functions**: `schedule_meeting`, `qualify_lead`
- **Use Cases**: Cold calling, lead qualification, meeting scheduling
- **Personality**: Professional, persuasive, goal-oriented

#### 👔 Recruiter
Optimized for recruiting and candidate screening:
- **Functions**: `record_candidate_info`, `assess_technical_skills`
- **Use Cases**: Phone screens, candidate assessment, interview scheduling
- **Personality**: Warm, thorough, assessment-focused

## Integration with Your App

To integrate this voice agent into your own Vite React app:

### 1. Copy the Core Files

```bash
# Copy the web voice agent
cp ../../src/web/WebVoiceAgent.ts your-app/src/lib/
cp src/hooks/useVoiceAgent.ts your-app/src/hooks/
cp src/components/VoiceControls.tsx your-app/src/components/
cp src/components/VoiceControls.css your-app/src/components/
```

### 2. Install Dependencies

```bash
npm install @vapi-ai/web
```

### 3. Basic Integration

```tsx
import { useVoiceAgent } from './hooks/useVoiceAgent';
import { VoiceControls } from './components/VoiceControls';

function MyApp() {
  const voiceAgent = useVoiceAgent({
    publicKey: 'your-vapi-public-key',
  });

  return (
    <div>
      <VoiceControls
        state={voiceAgent}
        availableContexts={voiceAgent.getAvailableContexts()}
        onStartCall={(contextId) => voiceAgent.startCall(contextId)}
        onEndCall={() => voiceAgent.endCall()}
        onToggleMute={voiceAgent.toggleMute}
        onClearError={voiceAgent.clearError}
      />
    </div>
  );
}
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

**Note**: Microphone access requires HTTPS in production.

## Troubleshooting

### Common Issues

**"Microphone access denied"**
- Ensure HTTPS in production
- Check browser permissions

**"Failed to start call"**
- Verify Vapi public key is correct
- Check browser console for errors
- Ensure you have call credits in your Vapi account
