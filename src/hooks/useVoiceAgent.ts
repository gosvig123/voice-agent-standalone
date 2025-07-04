import { useReducer, useEffect, useCallback, useRef } from "react";
import {
  WebVoiceAgent,
  type WebVoiceAgentConfig,
  type WebCallOptions,
} from "../lib/WebVoiceAgent";

export interface UseVoiceAgentOptions {
  publicKey: string;
}

export interface VoiceAgentState {
  isCallActive: boolean;
  isConnecting: boolean;
  currentContext?: string;
  volumeLevel: number;
  speechActive: boolean;
  error?: string;
  availableContexts: string[];
  agentReady: boolean;
  connectionAttempts: number;
  isReconnecting: boolean;
}

type VoiceAgentAction =
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_CALL_ACTIVE'; payload: boolean }
  | { type: 'SET_SPEECH_ACTIVE'; payload: boolean }
  | { type: 'SET_VOLUME_LEVEL'; payload: number }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_CONTEXT'; payload: string }
  | { type: 'SET_AGENT_READY'; payload: { ready: boolean; contexts: string[] } }
  | { type: 'SET_RECONNECTING'; payload: boolean }
  | { type: 'INCREMENT_CONNECTION_ATTEMPTS' }
  | { type: 'RESET_CONNECTION_ATTEMPTS' }
  | { type: 'RESET_CALL_STATE' };

const initialState: VoiceAgentState = {
  isCallActive: false,
  isConnecting: false,
  volumeLevel: 0,
  speechActive: false,
  availableContexts: [],
  agentReady: false,
  connectionAttempts: 0,
  isReconnecting: false,
};

function voiceAgentReducer(state: VoiceAgentState, action: VoiceAgentAction): VoiceAgentState {
  switch (action.type) {
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload, error: action.payload ? undefined : state.error };
    case 'SET_CALL_ACTIVE':
      return { 
        ...state, 
        isCallActive: action.payload, 
        isConnecting: false,
        speechActive: action.payload ? state.speechActive : false,
        volumeLevel: action.payload ? state.volumeLevel : 0,
        isReconnecting: false,
      };
    case 'SET_SPEECH_ACTIVE':
      return { ...state, speechActive: action.payload };
    case 'SET_VOLUME_LEVEL':
      return { ...state, volumeLevel: action.payload };
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        isConnecting: false, 
        isCallActive: false,
        isReconnecting: false,
      };
    case 'SET_CONTEXT':
      return { ...state, currentContext: action.payload };
    case 'SET_AGENT_READY':
      return { ...state, agentReady: action.payload.ready, availableContexts: action.payload.contexts };
    case 'SET_RECONNECTING':
      return { ...state, isReconnecting: action.payload };
    case 'INCREMENT_CONNECTION_ATTEMPTS':
      return { ...state, connectionAttempts: state.connectionAttempts + 1 };
    case 'RESET_CONNECTION_ATTEMPTS':
      return { ...state, connectionAttempts: 0 };
    case 'RESET_CALL_STATE':
      return { 
        ...state, 
        isCallActive: false, 
        isConnecting: false, 
        speechActive: false, 
        volumeLevel: 0, 
        isReconnecting: false,
      };
    default:
      return state;
  }
}

export function useVoiceAgent(options: UseVoiceAgentOptions) {
  const { publicKey } = options;
  const agentRef = useRef<WebVoiceAgent | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, dispatch] = useReducer(voiceAgentReducer, initialState);

  const handleCallStart = useCallback(() => {
    dispatch({ type: 'SET_CALL_ACTIVE', payload: true });
    dispatch({ type: 'RESET_CONNECTION_ATTEMPTS' });
  }, []);

  const handleCallEnd = useCallback(() => {
    dispatch({ type: 'SET_CALL_ACTIVE', payload: false });
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const handleSpeechStart = useCallback(() => {
    dispatch({ type: 'SET_SPEECH_ACTIVE', payload: true });
  }, []);

  const handleSpeechEnd = useCallback(() => {
    dispatch({ type: 'SET_SPEECH_ACTIVE', payload: false });
  }, []);

  const handleVolumeLevel = useCallback((level: number) => {
    dispatch({ type: 'SET_VOLUME_LEVEL', payload: level });
  }, []);

  const handleError = useCallback((error: Error) => {
    dispatch({ type: 'SET_ERROR', payload: error.message });
    dispatch({ type: 'INCREMENT_CONNECTION_ATTEMPTS' });
    
    if (state.connectionAttempts < 3 && state.isCallActive) {
      const retryDelay = Math.min(1000 * Math.pow(2, state.connectionAttempts), 5000);
      dispatch({ type: 'SET_RECONNECTING', payload: true });
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (agentRef.current && state.currentContext) {
          agentRef.current.startCall().catch(() => {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to reconnect' });
          });
        }
      }, retryDelay);
    }
  }, [state.connectionAttempts, state.isCallActive, state.currentContext]);

  useEffect(() => {
    if (!publicKey) return;

    try {
      const config: WebVoiceAgentConfig = { publicKey };
      agentRef.current = new WebVoiceAgent(config);

      const agent = agentRef.current;

      agent.on("call-start", handleCallStart);
      agent.on("call-end", handleCallEnd);
      agent.on("speech-start", handleSpeechStart);
      agent.on("speech-end", handleSpeechEnd);
      agent.on("volume-level", handleVolumeLevel);
      agent.on("error", handleError);

      const contexts = agent.getRegisteredContexts();
      dispatch({ type: 'SET_AGENT_READY', payload: { ready: true, contexts } });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : "Failed to initialize voice agent"
      });
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (agentRef.current?.isCallActive()) {
        agentRef.current.endCall();
      }
    };
  }, [publicKey, handleCallStart, handleCallEnd, handleSpeechStart, handleSpeechEnd, handleVolumeLevel, handleError]);

  const startCall = useCallback(
    async (contextId: string, options: WebCallOptions = {}) => {
      if (!agentRef.current) {
        throw new Error("Voice agent not initialized");
      }

      dispatch({ type: 'SET_CONNECTING', payload: true });
      dispatch({ type: 'RESET_CONNECTION_ATTEMPTS' });

      try {
        agentRef.current.switchContext(contextId);
        dispatch({ type: 'SET_CONTEXT', payload: contextId });
        await agentRef.current.startCall(options);
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : "Failed to start call"
        });
        throw error;
      }
    },
    [],
  );

  const endCall = useCallback(async () => {
    if (!agentRef.current) return;

    try {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      await agentRef.current.endCall();
      dispatch({ type: 'RESET_CALL_STATE' });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : "Failed to end call"
      });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: undefined });
  }, []);

  return {
    ...state,
    startCall,
    endCall,
    clearError,
    agent: agentRef.current,
  };
}
