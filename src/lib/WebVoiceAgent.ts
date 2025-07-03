import Vapi from '@vapi-ai/web';
import { EventEmitter } from 'events';
import type { 
  ContextConfig, 
  AssistantConfig,
  VoiceConfig,
  ModelConfig
} from '../config/voiceAgentConfig';
import { 
  VoiceAgentConfigBuilder, 
  PRESET_CONTEXTS
} from '../config/voiceAgentConfig';

export interface WebVoiceAgentConfig {
  publicKey: string;
  baseUrl?: string;
  autoCreateDefaultContexts?: boolean;
}

export interface WebCallOptions {
  assistantId?: string;
  assistant?: any;
  // Dynamic data that gets injected into the context
  dynamicData?: {
    prospectName?: string;
    companyName?: string;
    candidateName?: string;
    position?: string;
    [key: string]: any;
  };
}

export interface WebCallEvents {
  'call-start': () => void;
  'call-end': () => void;
  'speech-start': () => void;
  'speech-end': () => void;
  'volume-level': (level: number) => void;
  'message': (message: any) => void;
  'error': (error: Error) => void;
  'function-call': (functionCall: any) => void;
}

export abstract class WebBaseContext {
  protected config: ContextConfig;

  constructor(config: ContextConfig) {
    this.config = config;
  }

  getContextConfig(): ContextConfig {
    return this.config;
  }

  abstract handleFunctionCall(functionName: string, parameters: any): Promise<any>;

  // Apply dynamic data to the assistant configuration
  applyDynamicData(dynamicData: Record<string, any>): AssistantConfig {
    const assistant = { ...this.config.assistant };
    
    // Replace placeholders in first message
    let firstMessage = assistant.firstMessage;
    Object.entries(dynamicData).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      firstMessage = firstMessage.replace(placeholder, value);
    });
    
    // Replace placeholders in system message
    let systemMessage = assistant.model.messages[0].content;
    Object.entries(dynamicData).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      systemMessage = systemMessage.replace(placeholder, value);
    });

    return {
      ...assistant,
      firstMessage,
      model: {
        ...assistant.model,
        messages: [{
          ...assistant.model.messages[0],
          content: systemMessage
        }]
      }
    };
  }
}

export class WebSDRContext extends WebBaseContext {
  constructor() {
    // Create config with template placeholders
    const config = {
      ...PRESET_CONTEXTS.sdr(),
      assistant: {
        ...PRESET_CONTEXTS.sdr().assistant,
        firstMessage: 'Hi {{prospectName}}! I\'m calling from {{companyName}} to discuss an exciting opportunity. Do you have a quick moment to chat?',
        model: {
          ...PRESET_CONTEXTS.sdr().assistant.model,
          messages: [{
            role: 'system',
            content: `You are an experienced Sales Development Representative calling {{prospectName}} from {{companyName}}. Focus on:
1. Building rapport quickly with {{prospectName}}
2. Qualifying leads using BANT criteria
3. Scheduling meetings with qualified prospects
4. Handling objections gracefully
5. Being concise and professional

The prospect's name is {{prospectName}} and they work at {{companyName}}.
Available functions: schedule_meeting, qualify_lead, log_call_notes`
          }]
        }
      }
    };
    super(config);
  }

  async handleFunctionCall(functionName: string, parameters: any): Promise<any> {
    console.log(`[SDR] Function called: ${functionName}`, parameters);
    
    switch (functionName) {
      case 'schedule_meeting':
        return {
          success: true,
          message: 'Meeting scheduled successfully',
          meeting_id: `meeting_${Date.now()}`,
          ...parameters,
        };
      
      case 'qualify_lead':
        return {
          success: true,
          message: 'Lead qualification recorded',
          lead_id: `lead_${Date.now()}`,
          qualified: parameters.score >= 6,
          ...parameters,
        };
      
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }
}

export class WebRecruiterContext extends WebBaseContext {
  constructor() {
    // Create config with template placeholders
    const config = {
      ...PRESET_CONTEXTS.recruiter(),
      assistant: {
        ...PRESET_CONTEXTS.recruiter().assistant,
        firstMessage: 'Hello {{candidateName}}! Thank you for taking the time to speak with me today about the {{position}} role. I\'m excited to learn more about your background.',
        model: {
          ...PRESET_CONTEXTS.recruiter().assistant.model,
          messages: [{
            role: 'system',
            content: `You are an experienced recruiter conducting a phone screen with {{candidateName}} for the {{position}} role at {{companyName}}. Focus on:
1. Creating a welcoming atmosphere for {{candidateName}}
2. Assessing candidate qualifications for the {{position}} role
3. Evaluating technical skills relevant to {{position}}
4. Gauging cultural fit at {{companyName}}
5. Collecting detailed information

The candidate's name is {{candidateName}} and the position is {{position}} at {{companyName}}.
Available functions: record_candidate_info, assess_technical_skills, log_interview_notes`
          }]
        }
      }
    };
    super(config);
  }

  async handleFunctionCall(functionName: string, parameters: any): Promise<any> {
    console.log(`[Recruiter] Function called: ${functionName}`, parameters);
    
    switch (functionName) {
      case 'record_candidate_info':
        return {
          success: true,
          message: 'Candidate information recorded',
          candidate_id: `candidate_${Date.now()}`,
          status: parameters.overall_rating >= 7 ? 'promising' : 'needs_review',
          ...parameters,
        };
      
      case 'assess_technical_skills':
        return {
          success: true,
          message: 'Technical assessment recorded',
          assessment_id: `assessment_${Date.now()}`,
          competency_level: parameters.technical_rating >= 8 ? 'expert' : 'proficient',
          ...parameters,
        };
      
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }
}

export class WebVoiceAgent extends EventEmitter {
  private vapi: Vapi;
  private contexts: Map<string, WebBaseContext> = new Map();
  private currentContext?: WebBaseContext;
  private callActive = false;
  private config: WebVoiceAgentConfig;

  constructor(config: WebVoiceAgentConfig) {
    super();
    this.config = config;
    this.vapi = new Vapi(config.publicKey);
    this.setupEventListeners();
    
    if (config.autoCreateDefaultContexts !== false) {
      this.registerDefaultContexts();
    }
  }

  on<K extends keyof WebCallEvents>(event: K, listener: WebCallEvents[K]): this {
    return super.on(event, listener);
  }

  emit<K extends keyof WebCallEvents>(event: K, ...args: Parameters<WebCallEvents[K]>): boolean {
    return super.emit(event, ...args);
  }

  private setupEventListeners() {
    this.vapi.on('call-start', () => {
      this.callActive = true;
      this.emit('call-start');
    });

    this.vapi.on('call-end', () => {
      this.callActive = false;
      this.emit('call-end');
    });

    this.vapi.on('speech-start', () => {
      this.emit('speech-start');
    });

    this.vapi.on('speech-end', () => {
      this.emit('speech-end');
    });

    this.vapi.on('volume-level', (level: number) => {
      this.emit('volume-level', level);
    });

    this.vapi.on('message', (message: any) => {
      this.emit('message', message);
      
      if (message.type === 'function-call') {
        this.handleFunctionCall(message);
      }
    });

    this.vapi.on('error', (error: any) => {
      this.emit('error', new Error(error.message || 'Vapi error'));
    });
  }

  private registerDefaultContexts() {
    this.registerContext(new WebSDRContext());
    this.registerContext(new WebRecruiterContext());
  }

  registerContext(context: WebBaseContext) {
    const config = context.getContextConfig();
    console.log('Registering context:', config.id, config.name);
    this.contexts.set(config.id, context);
  }

  // Register a custom context using the builder pattern
  registerCustomContext(
    id: string,
    name: string,
    description: string,
    assistant: AssistantConfig,
    functionHandlers?: Record<string, (params: any) => Promise<any>>
  ): void {
    const config = VoiceAgentConfigBuilder
      .create(id)
      .setName(name)
      .setDescription(description)
      .setAssistant(assistant)
      .setFunctions(functionHandlers || {})
      .build();

    // Create a generic context class for custom contexts
    class CustomContext extends WebBaseContext {
      constructor(config: ContextConfig) {
        super(config);
      }

      async handleFunctionCall(functionName: string, parameters: any): Promise<any> {
        console.log(`[${config.name}] Function called: ${functionName}`, parameters);
        
        if (this.config.functions && this.config.functions[functionName]) {
          return await this.config.functions[functionName](parameters);
        }
        
        throw new Error(`Unknown function: ${functionName}`);
      }
    }

    this.registerContext(new CustomContext(config));
  }

  switchContext(contextId: string) {
    const context = this.contexts.get(contextId);
    if (!context) {
      throw new Error(`Context '${contextId}' not found`);
    }
    this.currentContext = context;
    console.log(`Switched to context: ${contextId}`);
  }

  // Convert our assistant config to Vapi format
  private convertToVapiAssistant(assistant: AssistantConfig): any {
    return {
      name: assistant.name,
      firstMessage: assistant.firstMessage,
      model: {
        provider: assistant.model.provider,
        model: assistant.model.model,
        temperature: assistant.model.temperature,
        messages: assistant.model.messages,
        ...(assistant.model.maxTokens && {
          maxTokens: assistant.model.maxTokens,
        }),
      },
      voice: assistant.voice,
      // Temporarily disable transcriber and tools to get basic calls working
      // ...(assistant.transcriber && { transcriber: assistant.transcriber }),
      // ...(assistant.tools && { tools: assistant.tools }),
    };
  }

  async startCall(options: WebCallOptions = {}) {
    if (!this.currentContext) {
      throw new Error('No context selected. Use switchContext() first.');
    }

    // Apply dynamic data if provided
    let assistant;
    if (options.assistant) {
      assistant = options.assistant;
    } else {
      const contextConfig = this.currentContext.getContextConfig();
      
      if (options.dynamicData) {
        // Apply dynamic data to create personalized assistant
        const personalizedAssistant = this.currentContext.applyDynamicData(options.dynamicData);
        assistant = this.convertToVapiAssistant(personalizedAssistant);
      } else {
        // Use default assistant config
        assistant = this.convertToVapiAssistant(contextConfig.assistant);
      }
    }

    console.log('Starting call with assistant config:', JSON.stringify(assistant, null, 2));

    try {
      await this.vapi.start(assistant);
    } catch (error) {
      console.error('Vapi start error:', error);
      this.emit('error', error as Error);
      throw error;
    }
  }

  async endCall() {
    if (!this.callActive) {
      console.warn('No active call to end');
      return;
    }

    try {
      this.vapi.stop();
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  private async handleFunctionCall(message: any) {
    if (!this.currentContext) {
      console.error('No context available to handle function call');
      return;
    }

    try {
      const result = await this.currentContext.handleFunctionCall(
        message.functionCall.name,
        message.functionCall.parameters
      );
      
      this.emit('function-call', {
        name: message.functionCall.name,
        parameters: message.functionCall.parameters,
        result,
      });

      // Send result back to Vapi (commented out due to API compatibility)
      // this.vapi.send({
      //   type: 'function-call-result',
      //   functionCallId: message.functionCall.id,
      //   result,
      // });
    } catch (error) {
      console.error('Function call failed:', error);
      this.emit('error', error as Error);
    }
  }

  getCurrentContext() {
    return this.currentContext;
  }

  getRegisteredContexts() {
    return Array.from(this.contexts.keys());
  }

  isMuted() {
    return this.vapi.isMuted();
  }

  setMuted(muted: boolean) {
    this.vapi.setMuted(muted);
  }

  isCallActive() {
    return this.callActive;
  }
}