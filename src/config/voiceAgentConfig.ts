// Dynamic voice agent configuration system
export interface VoiceConfig {
  provider: 'openai' | 'playht' | '11labs';
  voiceId: string;
  speed?: number;
  stability?: number;
  similarityBoost?: number;
}

export interface ModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature: number;
  maxTokens?: number;
  messages: Array<{
    role: string;
    content: string;
  }>;
}

export interface TranscriberConfig {
  provider: 'deepgram' | 'whisper';
  model?: string;
  language?: string;
}

export interface ToolConfig {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  };
}

export interface AssistantConfig {
  name: string;
  firstMessage: string;
  model: ModelConfig;
  voice: VoiceConfig;
  transcriber?: TranscriberConfig;
  tools?: ToolConfig[];
}

export interface ContextConfig {
  id: string;
  name: string;
  description: string;
  assistant: AssistantConfig;
  functions?: Record<string, (params: any) => Promise<any>>;
}

// Default voice configurations
export const DEFAULT_VOICES: Record<string, VoiceConfig> = {
  'openai-alloy': {
    provider: 'openai',
    voiceId: 'alloy'
  },
  'openai-echo': {
    provider: 'openai',
    voiceId: 'echo'
  },
  'openai-nova': {
    provider: 'openai',
    voiceId: 'nova'
  },
  'openai-shimmer': {
    provider: 'openai',
    voiceId: 'shimmer'
  },
  'playht-jennifer': {
    provider: 'playht',
    voiceId: 'jennifer'
  },
  'playht-ryan': {
    provider: 'playht',
    voiceId: 'ryan'
  },
  '11labs-rachel': {
    provider: '11labs',
    voiceId: '21m00Tcm4TlvDq8ikWAM'
  }
};

// Default model configurations
export const DEFAULT_MODELS: Record<string, Omit<ModelConfig, 'messages'>> = {
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

// Default transcriber configurations
export const DEFAULT_TRANSCRIBERS: Record<string, TranscriberConfig> = {
  'deepgram-nova': {
    provider: 'deepgram',
    model: 'nova-2'
  },
  'deepgram-base': {
    provider: 'deepgram',
    model: 'base'
  },
  'whisper': {
    provider: 'whisper'
  }
};

// Configuration builder class
export class VoiceAgentConfigBuilder {
  private config: Partial<ContextConfig> = {};

  static create(id: string): VoiceAgentConfigBuilder {
    return new VoiceAgentConfigBuilder().setId(id);
  }

  setId(id: string): this {
    this.config.id = id;
    return this;
  }

  setName(name: string): this {
    this.config.name = name;
    return this;
  }

  setDescription(description: string): this {
    this.config.description = description;
    return this;
  }

  setAssistant(assistant: Partial<AssistantConfig>): this {
    this.config.assistant = {
      name: assistant.name || 'AI Assistant',
      firstMessage: assistant.firstMessage || 'Hello! How can I help you today?',
      model: assistant.model || {
        ...DEFAULT_MODELS['gpt-3.5-turbo'],
        messages: [{ role: 'system', content: 'You are a helpful AI assistant.' }]
      },
      voice: assistant.voice || DEFAULT_VOICES['openai-alloy'],
      ...(assistant.transcriber && { transcriber: assistant.transcriber }),
      ...(assistant.tools && { tools: assistant.tools })
    };
    return this;
  }

  setVoice(voiceKey: string | VoiceConfig): this {
    if (!this.config.assistant) {
      throw new Error('Assistant must be set before setting voice');
    }
    
    this.config.assistant.voice = typeof voiceKey === 'string' 
      ? DEFAULT_VOICES[voiceKey] || DEFAULT_VOICES['openai-alloy']
      : voiceKey;
    return this;
  }

  setModel(modelKey: string | ModelConfig, systemMessage?: string): this {
    if (!this.config.assistant) {
      throw new Error('Assistant must be set before setting model');
    }

    let model: ModelConfig;
    if (typeof modelKey === 'string') {
      const baseModel = DEFAULT_MODELS[modelKey] || DEFAULT_MODELS['gpt-3.5-turbo'];
      model = {
        ...baseModel,
        messages: [{ 
          role: 'system', 
          content: systemMessage || 'You are a helpful AI assistant.' 
        }]
      };
    } else {
      model = modelKey;
    }

    if (systemMessage && typeof modelKey === 'object') {
      model.messages = [{ role: 'system', content: systemMessage }];
    }

    this.config.assistant.model = model;
    return this;
  }

  setTranscriber(transcriberKey: string | TranscriberConfig): this {
    if (!this.config.assistant) {
      throw new Error('Assistant must be set before setting transcriber');
    }

    this.config.assistant.transcriber = typeof transcriberKey === 'string'
      ? DEFAULT_TRANSCRIBERS[transcriberKey] || DEFAULT_TRANSCRIBERS['deepgram-nova']
      : transcriberKey;
    return this;
  }

  setFirstMessage(message: string): this {
    if (!this.config.assistant) {
      throw new Error('Assistant must be set before setting first message');
    }
    this.config.assistant.firstMessage = message;
    return this;
  }

  setFunctions(functions: Record<string, (params: any) => Promise<any>>): this {
    this.config.functions = functions;
    return this;
  }

  addTool(tool: ToolConfig): this {
    if (!this.config.assistant) {
      throw new Error('Assistant must be set before adding tools');
    }
    if (!this.config.assistant.tools) {
      this.config.assistant.tools = [];
    }
    this.config.assistant.tools.push(tool);
    return this;
  }

  build(): ContextConfig {
    if (!this.config.id || !this.config.name || !this.config.assistant) {
      throw new Error('Missing required configuration: id, name, and assistant must be set');
    }
    return this.config as ContextConfig;
  }
}

// SDR Tools
export const SDR_TOOLS: ToolConfig[] = [
  {
    type: 'function',
    function: {
      name: 'schedule_meeting',
      description: 'Schedule a follow-up meeting with the prospect',
      parameters: {
        type: 'object',
        properties: {
          prospect_name: { type: 'string', description: 'Prospect full name' },
          meeting_type: { type: 'string', enum: ['demo', 'discovery', 'follow-up'] },
          proposed_time: { type: 'string', description: 'Proposed meeting time' },
        },
        required: ['prospect_name', 'meeting_type', 'proposed_time'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'qualify_lead',
      description: 'Record lead qualification using BANT criteria',
      parameters: {
        type: 'object',
        properties: {
          prospect_name: { type: 'string' },
          company: { type: 'string' },
          budget: { type: 'string' },
          authority: { type: 'string' },
          need: { type: 'string' },
          timeline: { type: 'string' },
          score: { type: 'number', minimum: 1, maximum: 10 },
        },
        required: ['prospect_name', 'company', 'need', 'score'],
      },
    },
  },
];

// Recruiter Tools
export const RECRUITER_TOOLS: ToolConfig[] = [
  {
    type: 'function',
    function: {
      name: 'record_candidate_info',
      description: 'Record candidate information and assessment',
      parameters: {
        type: 'object',
        properties: {
          candidate_name: { type: 'string' },
          current_role: { type: 'string' },
          experience_years: { type: 'number' },
          skills: { type: 'array', items: { type: 'string' } },
          overall_rating: { type: 'number', minimum: 1, maximum: 10 },
        },
        required: ['candidate_name', 'current_role', 'overall_rating'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'assess_technical_skills',
      description: 'Record technical skills evaluation',
      parameters: {
        type: 'object',
        properties: {
          candidate_name: { type: 'string' },
          skills_assessed: { type: 'array', items: { type: 'string' } },
          technical_rating: { type: 'number', minimum: 1, maximum: 10 },
          strengths: { type: 'array', items: { type: 'string' } },
        },
        required: ['candidate_name', 'skills_assessed', 'technical_rating'],
      },
    },
  },
];

// Preset configurations for common use cases
export const PRESET_CONTEXTS = {
  sdr: (options: Partial<AssistantConfig> = {}): ContextConfig => 
    VoiceAgentConfigBuilder
      .create('sdr')
      .setName('Sales Development Representative')
      .setDescription('Voice agent optimized for sales outreach and lead qualification')
      .setAssistant({
        name: 'SDR Assistant',
        firstMessage: 'Hi! I\'m calling to discuss an exciting opportunity. Do you have a quick moment to chat?',
        model: {
          ...DEFAULT_MODELS['gpt-4'],
          messages: [{
            role: 'system',
            content: `You are an experienced Sales Development Representative making calls. Focus on:
1. Building rapport quickly
2. Qualifying leads using BANT criteria
3. Scheduling meetings with qualified prospects
4. Handling objections gracefully
5. Being concise and professional

Available functions: schedule_meeting, qualify_lead, log_call_notes`
          }]
        },
        voice: DEFAULT_VOICES['openai-nova'],
        transcriber: DEFAULT_TRANSCRIBERS['deepgram-nova'],
        tools: SDR_TOOLS,
        ...options
      })
      .build(),

  recruiter: (options: Partial<AssistantConfig> = {}): ContextConfig =>
    VoiceAgentConfigBuilder
      .create('recruiter')
      .setName('Recruiter')
      .setDescription('Voice agent optimized for recruiting and candidate screening')
      .setAssistant({
        name: 'Recruiter Assistant',
        firstMessage: 'Hello! Thank you for taking the time to speak with me today. I\'m excited to learn more about your background and discuss this opportunity.',
        model: {
          ...DEFAULT_MODELS['gpt-4'],
          messages: [{
            role: 'system',
            content: `You are an experienced recruiter conducting phone screens. Focus on:
1. Creating a welcoming atmosphere
2. Assessing candidate qualifications
3. Evaluating technical skills
4. Gauging cultural fit
5. Collecting detailed information

Available functions: record_candidate_info, assess_technical_skills, log_interview_notes`
          }]
        },
        voice: DEFAULT_VOICES['openai-shimmer'],
        transcriber: DEFAULT_TRANSCRIBERS['deepgram-nova'],
        tools: RECRUITER_TOOLS,
        ...options
      })
      .build(),

  customerSupport: (options: Partial<AssistantConfig> = {}): ContextConfig =>
    VoiceAgentConfigBuilder
      .create('customer-support')
      .setName('Customer Support')
      .setDescription('Voice agent optimized for customer support and issue resolution')
      .setAssistant({
        name: 'Support Assistant',
        firstMessage: 'Hello! I\'m here to help you with any questions or issues you might have. How can I assist you today?',
        model: {
          ...DEFAULT_MODELS['gpt-3.5-turbo'],
          messages: [{
            role: 'system',
            content: 'You are a helpful customer support representative. Be patient, empathetic, and solution-focused.'
          }]
        },
        voice: DEFAULT_VOICES['openai-alloy'],
        ...options
      })
      .build()
};