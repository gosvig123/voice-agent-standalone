# 🎤 Dynamic Voice Agent Configuration System

A flexible, configuration-driven voice agent system built with Vapi.ai that allows dynamic context switching and real-time parameter updates.

## ✨ Features

### 🔧 Dynamic Configuration
- **Real-time Updates**: Change voice, model, and messages during runtime
- **Builder Pattern**: Fluent API for creating custom contexts
- **Type Safety**: Full TypeScript support with strict typing
- **Preset Configurations**: Ready-to-use contexts for common scenarios

### 🎯 Context Management
- **Multiple Contexts**: SDR, Recruiter, Customer Support, and custom contexts
- **Function Handling**: Custom function implementations per context
- **Context Switching**: Seamless switching between different agent personalities
- **Hot Swapping**: Update configurations without restarting

### 🎨 Voice & Model Options
- **Multiple Voice Providers**: OpenAI, PlayHT, 11Labs
- **Model Selection**: GPT-3.5, GPT-4, GPT-4o with custom parameters
- **Transcriber Options**: Deepgram, Whisper with various models
- **Temperature Control**: Fine-tune response creativity

## 🚀 Quick Start

### Basic Usage

```typescript
import { useDynamicVoiceAgent } from './hooks/useDynamicVoiceAgent';

function App() {
  const voiceAgent = useDynamicVoiceAgent({
    publicKey: 'your-public-key'
  });

  // Start a call with SDR context
  const handleStartCall = async () => {
    await voiceAgent.startCall('sdr');
  };

  return (
    <div>
      <button onClick={handleStartCall}>
        Start SDR Call
      </button>
    </div>
  );
}
```

## 📖 Configuration Examples

### Creating Custom Contexts

#### Using Builder Pattern
```typescript
const customContextId = voiceAgent.createContextWithBuilder((builder) =>
  builder
    .setId('custom-sales')
    .setName('Custom Sales Agent')
    .setDescription('Specialized sales agent')
    .setAssistant({
      name: 'Custom Sales Assistant',
      firstMessage: 'Hi! Ready to boost your sales?',
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.8,
        messages: [{
          role: 'system',
          content: 'You are an energetic sales expert.'
        }]
      },
      voice: {
        provider: 'openai',
        voiceId: 'nova'
      }
    })
);
```

#### Using Preset Helpers
```typescript
// Create a custom SDR context
const sdrId = voiceAgent.createSDRContext({
  voice: DEFAULT_VOICES['openai-shimmer'],
  model: {
    ...DEFAULT_MODELS['gpt-4'],
    temperature: 0.9,
    messages: [{
      role: 'system',
      content: 'You are a high-energy sales professional.'
    }]
  }
});
```

### Dynamic Updates

```typescript
// Change voice on the fly
voiceAgent.updateContextVoice({
  provider: 'openai',
  voiceId: 'alloy'
});

// Update model parameters
voiceAgent.updateContextModel({
  provider: 'openai',
  model: 'gpt-4o',
  temperature: 0.7,
  messages: [{
    role: 'system',
    content: 'Updated system message'
  }]
});

// Update greeting message
voiceAgent.updateContextFirstMessage(
  'Hello! This is a dynamically updated greeting!'
);
```

### Custom Function Handlers

```typescript
const functionHandlers = {
  async customFunction(params: any) {
    console.log('Custom function called:', params);
    return {
      success: true,
      data: 'Custom response',
      timestamp: new Date().toISOString()
    };
  }
};

voiceAgent.registerCustomContext(
  'custom-id',
  'Custom Context',
  'Description',
  assistantConfig,
  functionHandlers
);
```

## 🛠 Configuration Options

### Voice Providers

```typescript
const voices = {
  // OpenAI Voices
  'openai-alloy': { provider: 'openai', voiceId: 'alloy' },
  'openai-echo': { provider: 'openai', voiceId: 'echo' },
  'openai-nova': { provider: 'openai', voiceId: 'nova' },
  'openai-shimmer': { provider: 'openai', voiceId: 'shimmer' },
  
  // PlayHT Voices
  'playht-jennifer': { provider: 'playht', voiceId: 'jennifer' },
  'playht-ryan': { provider: 'playht', voiceId: 'ryan' },
  
  // 11Labs Voices
  '11labs-rachel': { provider: '11labs', voiceId: '21m00Tcm4TlvDq8ikWAM' }
};
```

### Model Configurations

```typescript
const models = {
  'gpt-3.5-turbo': {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  },
  'gpt-4': {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 300
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7
  }
};
```

## 📋 Available Contexts

### SDR Context
- **Purpose**: Sales Development Representative calls
- **Features**: BANT qualification, meeting scheduling, objection handling
- **Functions**: `schedule_meeting`, `qualify_lead`
- **Voice**: Nova (energetic, professional)
- **Model**: GPT-4 with sales-focused prompts

### Recruiter Context
- **Purpose**: Candidate screening and recruitment
- **Features**: Skill assessment, cultural fit evaluation
- **Functions**: `record_candidate_info`, `assess_technical_skills`
- **Voice**: Shimmer (warm, welcoming)
- **Model**: GPT-4 with recruitment-focused prompts

### Customer Support Context
- **Purpose**: Customer service and issue resolution
- **Features**: Problem-solving, empathetic responses
- **Voice**: Alloy (calm, helpful)
- **Model**: GPT-3.5-turbo for efficiency

## 🔧 API Reference

### Hook: useDynamicVoiceAgent

```typescript
const voiceAgent = useDynamicVoiceAgent({
  publicKey: string,
  baseUrl?: string,
  autoRegisterContexts?: boolean
});
```

#### Methods

- `startCall(contextId: string, options?: WebCallOptions)`: Start a voice call
- `endCall()`: End the current call
- `toggleMute()`: Toggle mute state
- `switchContext(contextId: string)`: Switch to a different context
- `registerCustomContext(...)`: Register a new context
- `updateContextVoice(voice: VoiceConfig)`: Update current context voice
- `updateContextModel(model: ModelConfig)`: Update current context model
- `updateContextFirstMessage(message: string)`: Update greeting message
- `updateContextSystemMessage(message: string)`: Update system prompt

#### State

```typescript
interface DynamicVoiceAgentState {
  isCallActive: boolean;
  isMuted: boolean;
  isConnecting: boolean;
  currentContext?: string;
  volumeLevel: number;
  speechActive: boolean;
  error?: string;
  lastMessage?: any;
  lastFunctionCall?: any;
  availableContexts: string[];
  agentReady: boolean;
}
```

## 🏗 Architecture

### Component Structure
```
src/
├── config/
│   └── voiceAgentConfig.ts     # Configuration system
├── lib/
│   ├── WebVoiceAgent.ts        # Legacy agent (backward compatibility)
│   └── DynamicWebVoiceAgent.ts # New dynamic agent
├── hooks/
│   ├── useVoiceAgent.ts        # Legacy hook
│   └── useDynamicVoiceAgent.ts # New dynamic hook
├── components/
│   └── VoiceControls.tsx       # UI components
└── App.tsx                     # Main application
```

### Key Classes

- **DynamicWebVoiceAgent**: Main agent class with dynamic configuration
- **DynamicWebBaseContext**: Abstract base class for contexts
- **VoiceAgentConfigBuilder**: Builder pattern for configuration
- **PRESET_CONTEXTS**: Pre-configured context templates

## 🔄 Migration from Legacy

The system maintains backward compatibility with the original WebVoiceAgent:

```typescript
// Legacy approach (still works)
import { useVoiceAgent } from './hooks/useVoiceAgent';

// New dynamic approach (recommended)
import { useDynamicVoiceAgent } from './hooks/useDynamicVoiceAgent';
```

## 🛡 TypeScript Support

Full TypeScript support with strict typing:

```typescript
interface VoiceConfig {
  provider: 'openai' | 'playht' | '11labs';
  voiceId: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
}

interface ModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature: number;
  maxTokens?: number;
  messages: Array<{
    role: string;
    content: string;
  }>;
}
```

## 📝 Examples

Check the `App.tsx` file for complete examples of:
- Creating custom contexts
- Dynamic configuration updates
- Function call handling
- Error management
- Real-time UI updates

---

Built with ❤️ using [Vapi.ai](https://vapi.ai) and modern web technologies.