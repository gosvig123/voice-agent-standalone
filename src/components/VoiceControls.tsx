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
    <div className="voice-controls">
      <div className="controls-header">
        <h2>Voice Agent Controls</h2>
        <div className="status-indicator">
          <span
            className={`status-dot ${state.isCallActive ? "active" : "inactive"}`}
          ></span>
          <span className="status-text">
            {state.isReconnecting
              ? "Reconnecting..."
              : state.isConnecting
                ? "Connecting..."
                : state.isCallActive
                  ? "Call Active"
                  : "Ready"}
          </span>
        </div>
      </div>

      {state.error && (
        <div className="error-message">
          <span>{state.error}</span>
          <button onClick={onClearError} className="error-dismiss">
            ✕
          </button>
        </div>
      )}

      <div className="context-selection">
        <label htmlFor="context-select">Select Context:</label>
        <select
          id="context-select"
          value={selectedContext}
          onChange={(e) => setSelectedContext(e.target.value)}
          disabled={state.isCallActive || state.isConnecting}
        >
          {state.availableContexts.map((context) => (
            <option key={context} value={context}>
              {context.charAt(0).toUpperCase() + context.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="call-controls">
        {!state.isCallActive ? (
          <button
            onClick={handleStartCall}
            disabled={state.isConnecting || state.isReconnecting || !selectedContext}
            className="start-call-btn"
          >
            {state.isConnecting ? "Starting..." : "Start Call"}
          </button>
        ) : (
          <div className="active-call-controls">
            <button onClick={onEndCall} className="end-call-btn">
              End Call
            </button>
          </div>
        )}
      </div>

      {state.isCallActive && (
        <div className="call-info">
          <div className="context-info">
            <strong>Active Context:</strong> {state.currentContext}
          </div>

          {state.speechActive && (
            <div className="speech-indicator">
              <span className="pulse">🗣️ Speaking...</span>
            </div>
          )}

          <div className="volume-meter">
            <label>Volume Level:</label>
            <div className="volume-bar">
              <div
                className="volume-fill"
                style={{ width: `${Math.min(state.volumeLevel * 100, 100)}%` }}
              ></div>
            </div>
            <span className="volume-value">
              {Math.round(state.volumeLevel * 100)}%
            </span>
          </div>
        </div>
      )}

      {state.connectionAttempts > 0 && state.isReconnecting && (
        <div className="connection-info">
          <div className="reconnection-status">
            <span>Reconnection attempt: {state.connectionAttempts}/3</span>
          </div>
        </div>
      )}
    </div>
  );
}
