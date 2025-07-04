import React from "react";
import type { VoiceAgentState } from "../hooks/useVoiceAgent";

export interface VoiceControlsProps {
  state: VoiceAgentState;
  onStartCall: (contextId: string) => void;
  onEndCall: () => void;
  onClearError: () => void;
}

export function VoiceControls({
  state,
  onStartCall,
  onEndCall,
  onClearError,
}: VoiceControlsProps) {
  const [selectedContext, setSelectedContext] = React.useState(
    state.availableContexts[0] || "",
  );

  const handleStartCall = () => {
    if (selectedContext) {
      onStartCall(selectedContext);
    }
  };

  return (
    <div className="glass-card p-8 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          🎙️ Voice Agent Controls
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={`status-dot ${state.isCallActive ? "active" : "inactive"}`}
          ></span>
          <span className="text-sm font-medium text-gray-600">
            {state.isReconnecting
              ? "🔄 Reconnecting..."
              : state.isConnecting
                ? "🔌 Connecting..."
                : state.isCallActive
                  ? "✅ Call Active"
                  : "⚡ Ready"}
          </span>
        </div>
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-red-700 font-medium">{state.error}</span>
          </div>
          <button
            onClick={onClearError}
            className="text-red-500 hover:text-red-700 font-bold text-lg transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="context-select" className="block text-sm font-semibold text-gray-700 mb-2">
          Select Context:
        </label>
        <select
          id="context-select"
          value={selectedContext}
          onChange={(e) => setSelectedContext(e.target.value)}
          disabled={state.isCallActive || state.isConnecting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          {state.availableContexts.map((context) => (
            <option key={context} value={context}>
              {context.charAt(0).toUpperCase() + context.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        {!state.isCallActive ? (
          <button
            onClick={handleStartCall}
            disabled={state.isConnecting || state.isReconnecting || !selectedContext}
            className="w-full btn-success disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
          >
            {state.isConnecting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">🔄</span>
                Starting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🎤</span>
                Start Call
              </span>
            )}
          </button>
        ) : (
          <div className="flex gap-3">
            <button onClick={onEndCall} className="flex-1 btn-danger">
              <span className="flex items-center justify-center gap-2">
                <span>📞</span>
                End Call
              </span>
            </button>
          </div>
        )}
      </div>

      {state.isCallActive && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-semibold">📡 Active Context:</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {state.currentContext}
            </span>
          </div>

          {state.speechActive && (
            <div className="flex items-center gap-2 animate-bounce-subtle">
              <span className="text-green-600">🗣️</span>
              <span className="text-green-700 font-medium">Speaking...</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                🎵 Volume Level:
              </label>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(state.volumeLevel * 100)}%
              </span>
            </div>
            <div className="volume-bar">
              <div
                className="volume-fill"
                style={{ width: `${Math.min(state.volumeLevel * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {state.connectionAttempts > 0 && state.isReconnecting && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mt-6 animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="text-warning-600">🔄</span>
            <span className="text-warning-700 font-medium">
              Reconnection attempt: {state.connectionAttempts}/3
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
