import Vapi from '@vapi-ai/web';
import { EventEmitter } from 'events';
import type { ContextConfig } from '../config/voiceAgentConfig';
import { DEFAULT_CONTEXTS } from '../config/voiceAgentConfig';

export interface WebVoiceAgentConfig {
  publicKey: string;
}

export interface WebCallOptions {
  dynamicData?: Record<string, string>;
}

export class WebVoiceAgent extends EventEmitter {
  private vapi: Vapi;
  private contexts = new Map<string, ContextConfig>();
  private currentContext?: ContextConfig;
  private callActive = false;

  constructor(config: WebVoiceAgentConfig) {
    super();
    this.vapi = new Vapi(config.publicKey);
    this.setupEventListeners();
    Object.values(DEFAULT_CONTEXTS).forEach(context => this.contexts.set(context.id, context));
  }

  private setupEventListeners() {
    this.vapi.on('call-start', () => { this.callActive = true; this.emit('call-start'); });
    this.vapi.on('call-end', () => { this.callActive = false; this.emit('call-end'); });
    this.vapi.on('speech-start', () => this.emit('speech-start'));
    this.vapi.on('speech-end', () => this.emit('speech-end'));
    this.vapi.on('volume-level', (level: number) => this.emit('volume-level', level));
    this.vapi.on('message', (message: object) => {
      this.emit('message', message);
      if ((message as { type?: string }).type === 'function-call') {
        const funcCall = (message as { functionCall?: { name: string; parameters: object } }).functionCall;
        if (funcCall) this.emit('function-call', { name: funcCall.name, parameters: funcCall.parameters, result: { success: true, timestamp: new Date().toISOString() } });
      }
    });
    this.vapi.on('error', (error: Error) => this.emit('error', error));
  }

  switchContext(contextId: string) {
    const context = this.contexts.get(contextId);
    if (!context) throw new Error(`Context '${contextId}' not found`);
    this.currentContext = context;
  }

  async startCall(options: WebCallOptions = {}) {
    if (!this.currentContext) throw new Error('No context selected. Use switchContext() first.');
    
    let assistant = this.currentContext.assistant;
    if (options.dynamicData) {
      let { firstMessage, systemMessage } = assistant;
      Object.entries(options.dynamicData).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        firstMessage = firstMessage.replace(placeholder, value);
        systemMessage = systemMessage.replace(placeholder, value);
      });
      assistant = { ...assistant, firstMessage, systemMessage };
    }
    
    try {
      await this.vapi.start({
        name: assistant.name,
        firstMessage: assistant.firstMessage,
        model: {
          provider: assistant.model?.provider || 'openai',
          model: assistant.model?.model || 'gpt-3.5-turbo',
          temperature: assistant.model?.temperature || 0.7,
          messages: [{ role: 'system', content: assistant.systemMessage }]
        },
        voice: {
          provider: assistant.voice?.provider || 'openai',
          voiceId: assistant.voice?.voiceId || 'alloy'
        }
      });
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  async endCall() {
    if (this.callActive) {
      try {
        this.vapi.stop();
      } catch (error) {
        this.emit('error', error as Error);
        throw error;
      }
    }
  }

  getRegisteredContexts(): string[] { return Array.from(this.contexts.keys()); }
  getCurrentContext(): ContextConfig | undefined { return this.currentContext; }
  isMuted(): boolean { return this.vapi.isMuted(); }
  setMuted(muted: boolean): void { this.vapi.setMuted(muted); }
  isCallActive(): boolean { return this.callActive; }
}