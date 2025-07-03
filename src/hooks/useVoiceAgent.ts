import { useState, useEffect, useCallback, useRef } from 'react';
import { WebVoiceAgent } from '../lib/WebVoiceAgent';
import type { WebVoiceAgentConfig, WebCallOptions } from '../lib/WebVoiceAgent';
import type { VoiceConfig, ModelConfig, AssistantConfig } from '../config/voiceAgentConfig';
import { VoiceAgentConfigBuilder, PRESET_CONTEXTS, DEFAULT_VOICES, DEFAULT_MODELS } from '../config/voiceAgentConfig';

export interface UseVoiceAgentOptions {
  publicKey: string;
  baseUrl?: string;
  autoRegisterContexts?: boolean;
}

export interface VoiceAgentState {
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

export function useVoiceAgent(options: UseVoiceAgentOptions) {
  const { publicKey, baseUrl, autoRegisterContexts = true } = options;
  const agentRef = useRef<WebVoiceAgent | null>(null);
  
  const [state, setState] = useState<VoiceAgentState>({
    isCallActive: false,
    isMuted: false,
    isConnecting: false,
    volumeLevel: 0,
    speechActive: false,
    availableContexts: [],
    agentReady: false,
  });

  // Initialize agent
  useEffect(() => {
    if (!publicKey) return;

    try {
      const config: WebVoiceAgentConfig = { 
        publicKey,
        baseUrl,
        autoCreateDefaultContexts: autoRegisterContexts
      };
      agentRef.current = new WebVoiceAgent(config);

      const agent = agentRef.current;

      // Set up event listeners
      agent.on('call-start', () => {
        setState(prev => ({ 
          ...prev, 
          isCallActive: true, 
          isConnecting: false,
          error: undefined 
        }));
      });

      agent.on('call-end', () => {
        setState(prev => ({ 
          ...prev, 
          isCallActive: false, 
          isConnecting: false,
          speechActive: false,
          volumeLevel: 0 
        }));
      });

      agent.on('speech-start', () => {
        setState(prev => ({ ...prev, speechActive: true }));
      });

      agent.on('speech-end', () => {
        setState(prev => ({ ...prev, speechActive: false }));
      });

      agent.on('volume-level', (level: number) => {
        setState(prev => ({ ...prev, volumeLevel: level }));
      });

      agent.on('message', (message: any) => {
        setState(prev => ({ ...prev, lastMessage: message }));
      });

      agent.on('function-call', (functionCall: any) => {
        setState(prev => ({ ...prev, lastFunctionCall: functionCall }));
      });

      agent.on('error', (error: Error) => {
        setState(prev => ({ 
          ...prev, 
          error: error.message,
          isConnecting: false,
          isCallActive: false 
        }));
      });

      // Set agent ready and available contexts after successful initialization
      const contexts = agent.getRegisteredContexts();
      console.log('Voice agent initialized with contexts:', contexts);
      setState(prev => ({
        ...prev,
        agentReady: true,
        availableContexts: contexts
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to initialize voice agent' 
      }));
    }

    return () => {
      if (agentRef.current?.isCallActive()) {
        agentRef.current.endCall();
      }
    };
  }, [publicKey, baseUrl, autoRegisterContexts]);

  // Core call management with dynamic data support
  const startCall = useCallback(async (contextId: string, options: WebCallOptions = {}) => {
    if (!agentRef.current) {
      throw new Error('Voice agent not initialized');
    }

    setState(prev => ({ ...prev, isConnecting: true, error: undefined }));

    try {
      agentRef.current.switchContext(contextId);
      setState(prev => ({ ...prev, currentContext: contextId }));
      
      await agentRef.current.startCall(options);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to start call' 
      }));
      throw error;
    }
  }, []);

  // Start call with dynamic data (names, companies, etc.)
  const startCallWithData = useCallback(async (contextId: string, dynamicData: Record<string, any>, options: WebCallOptions = {}) => {
    return startCall(contextId, { ...options, dynamicData });
  }, [startCall]);

  const endCall = useCallback(async () => {
    if (!agentRef.current) return;

    try {
      await agentRef.current.endCall();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to end call' 
      }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!agentRef.current) return;

    const newMutedState = !state.isMuted;
    agentRef.current.setMuted(newMutedState);
    setState(prev => ({ ...prev, isMuted: newMutedState }));
  }, [state.isMuted]);

  // Context management
  const registerCustomContext = useCallback((
    id: string,
    name: string,
    description: string,
    assistant: AssistantConfig,
    functionHandlers?: Record<string, (params: any) => Promise<any>>
  ) => {
    if (!agentRef.current) {
      throw new Error('Voice agent not initialized');
    }

    agentRef.current.registerCustomContext(id, name, description, assistant, functionHandlers);
    
    // Update available contexts
    const contexts = agentRef.current.getRegisteredContexts();
    setState(prev => ({ ...prev, availableContexts: contexts }));
  }, []);

  // Quick context creation helpers
  const createSDRContext = useCallback((customConfig?: Partial<AssistantConfig>) => {
    const config = PRESET_CONTEXTS.sdr(customConfig);
    registerCustomContext(config.id, config.name, config.description, config.assistant);
    return config.id;
  }, [registerCustomContext]);

  const createRecruiterContext = useCallback((customConfig?: Partial<AssistantConfig>) => {
    const config = PRESET_CONTEXTS.recruiter(customConfig);
    registerCustomContext(config.id, config.name, config.description, config.assistant);
    return config.id;
  }, [registerCustomContext]);

  const createCustomerSupportContext = useCallback((customConfig?: Partial<AssistantConfig>) => {
    const config = PRESET_CONTEXTS.customerSupport(customConfig);
    registerCustomContext(config.id, config.name, config.description, config.assistant);
    return config.id;
  }, [registerCustomContext]);

  // Builder pattern helper
  const createContextWithBuilder = useCallback((builderCallback: (builder: VoiceAgentConfigBuilder) => VoiceAgentConfigBuilder) => {
    const builder = VoiceAgentConfigBuilder.create('custom-context');
    const config = builderCallback(builder).build();
    registerCustomContext(config.id, config.name, config.description, config.assistant, config.functions);
    return config.id;
  }, [registerCustomContext]);

  // Utility functions
  const getAvailableContexts = useCallback(() => {
    return state.availableContexts;
  }, [state.availableContexts]);

  const getCurrentContext = useCallback(() => {
    return agentRef.current?.getCurrentContext();
  }, []);

  const getContextConfig = useCallback((contextId: string) => {
    return agentRef.current?.getContextConfig(contextId);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);

  return {
    // State
    ...state,
    
    // Core actions
    startCall,
    startCallWithData, // New: Start call with dynamic data
    endCall,
    toggleMute,
    
    // Context management
    registerCustomContext,
    createSDRContext,
    createRecruiterContext,
    createCustomerSupportContext,
    createContextWithBuilder,
    
    // Utilities
    getAvailableContexts,
    getCurrentContext,
    getContextConfig,
    clearError,
    
    // Constants for easy access
    availableVoices: DEFAULT_VOICES,
    availableModels: DEFAULT_MODELS,
    
    // Agent instance (for advanced usage)
    agent: agentRef.current,
  };
}