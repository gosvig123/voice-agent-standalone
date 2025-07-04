import { useState, useEffect, useCallback, useRef } from "react";
import {
  WebVoiceAgent,
  type WebVoiceAgentConfig,
  type WebCallOptions,
} from "../lib/WebVoiceAgent";

export interface UseVoiceAgentOptions {
  publicKey: string;
}

export interface FunctionCall {
  name: string;
  parameters: object;
  result: { success: boolean; timestamp: string };
}

export interface VoiceAgentState {
  isCallActive: boolean;
  isMuted: boolean;
  isConnecting: boolean;
  currentContext?: string;
  volumeLevel: number;
  speechActive: boolean;
  error?: string;
  lastMessage?: object;
  lastFunctionCall?: FunctionCall;
  availableContexts: string[];
  agentReady: boolean;
}

export function useVoiceAgent(options: UseVoiceAgentOptions) {
  const { publicKey } = options;
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
      const config: WebVoiceAgentConfig = { publicKey };
      agentRef.current = new WebVoiceAgent(config);

      const agent = agentRef.current;

      // Set up event listeners
      agent.on("call-start", () => {
        setState((prev) => ({
          ...prev,
          isCallActive: true,
          isConnecting: false,
          error: undefined,
        }));
      });

      agent.on("call-end", () => {
        setState((prev) => ({
          ...prev,
          isCallActive: false,
          isConnecting: false,
          speechActive: false,
          volumeLevel: 0,
        }));
      });

      agent.on("speech-start", () => {
        setState((prev) => ({ ...prev, speechActive: true }));
      });

      agent.on("speech-end", () => {
        setState((prev) => ({ ...prev, speechActive: false }));
      });

      agent.on("volume-level", (level: number) => {
        setState((prev) => ({ ...prev, volumeLevel: level }));
      });

      agent.on("message", (message: object) => {
        setState((prev) => ({ ...prev, lastMessage: message }));
      });

      agent.on("function-call", (functionCall: FunctionCall) => {
        setState((prev) => ({ ...prev, lastFunctionCall: functionCall }));
      });

      agent.on("error", (error: Error) => {
        setState((prev) => ({
          ...prev,
          error: error.message,
          isConnecting: false,
          isCallActive: false,
        }));
      });

      // Set agent ready and available contexts
      const contexts = agent.getRegisteredContexts();
      console.log("Voice agent initialized with contexts:", contexts);
      setState((prev) => ({
        ...prev,
        agentReady: true,
        availableContexts: contexts,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize voice agent",
      }));
    }

    return () => {
      if (agentRef.current?.isCallActive()) {
        agentRef.current.endCall();
      }
    };
  }, [publicKey]);

  // Start call (basic)
  const startCall = useCallback(
    async (contextId: string, options: WebCallOptions = {}) => {
      if (!agentRef.current) {
        throw new Error("Voice agent not initialized");
      }

      setState((prev) => ({ ...prev, isConnecting: true, error: undefined }));

      try {
        agentRef.current.switchContext(contextId);
        setState((prev) => ({ ...prev, currentContext: contextId }));

        await agentRef.current.startCall(options);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error:
            error instanceof Error ? error.message : "Failed to start call",
        }));
        throw error;
      }
    },
    [],
  );

  // Start call with dynamic data
  const startCallWithData = useCallback(
    async (contextId: string, dynamicData: Record<string, string>) => {
      return startCall(contextId, { dynamicData });
    },
    [startCall],
  );

  const endCall = useCallback(async () => {
    if (!agentRef.current) return;

    try {
      await agentRef.current.endCall();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to end call",
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: undefined }));
  }, []);

  // Simple getters
  const getAvailableContexts = useCallback(() => {
    return state.availableContexts;
  }, [state.availableContexts]);

  const getCurrentContext = useCallback(() => {
    return agentRef.current?.getCurrentContext();
  }, []);

  return {
    // State
    ...state,

    // Actions
    startCall,
    startCallWithData,
    endCall,
    clearError,

    // Utilities
    getAvailableContexts,
    getCurrentContext,

    // Agent instance (for advanced usage)
    agent: agentRef.current,
  };
}
