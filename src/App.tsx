import { useVoiceAgent } from './hooks/useVoiceAgent';
import { VoiceControls } from './components/VoiceControls';
import './components/VoiceControls.css';
import './App.css';

// Vapi public key from environment variables
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

function App() {
  const voiceAgent = useVoiceAgent({
    publicKey: VAPI_PUBLIC_KEY,
  });

  console.log('Using Vapi public key:', VAPI_PUBLIC_KEY ? 'Set' : 'Not set');

  const handleStartCall = async (contextId: string) => {
    try {
      await voiceAgent.startCall(contextId);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      await voiceAgent.endCall();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  // Example of starting a call with dynamic data
  const handleStartSDRCallWithData = async () => {
    try {
      await voiceAgent.startCallWithData('sdr', {
        prospectName: 'John Smith',
        companyName: 'Tech Solutions Inc.'
      });
    } catch (error) {
      console.error('Failed to start SDR call with data:', error);
    }
  };

  const handleStartRecruiterCallWithData = async () => {
    try {
      await voiceAgent.startCallWithData('recruiter', {
        candidateName: 'Sarah Johnson',
        position: 'Senior Software Engineer',
        companyName: 'Innovate Corp'
      });
    } catch (error) {
      console.error('Failed to start recruiter call with data:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎤 Voice Agent Demo</h1>
        <p>AI-powered voice conversations with dynamic data injection</p>
      </header>

      <main className="app-main">
        <div className="demo-section">
          <VoiceControls
            state={voiceAgent}
            availableContexts={voiceAgent.getAvailableContexts()}
            onStartCall={handleStartCall}
            onEndCall={handleEndCall}
            onToggleMute={voiceAgent.toggleMute}
            onClearError={voiceAgent.clearError}
          />
          
          {/* Dynamic Data Controls */}
          <div className="dynamic-controls">
            <h3>🎯 Dynamic Data Examples</h3>
            <div className="control-buttons">
              <button onClick={handleStartSDRCallWithData} className="config-btn">
                SDR Call: John @ Tech Solutions
              </button>
              <button onClick={handleStartRecruiterCallWithData} className="config-btn">
                Recruiter Call: Sarah for SWE Role
              </button>
            </div>
            <p className="dynamic-info">
              These buttons demonstrate dynamic data injection - names and companies are 
              automatically inserted into the conversation context.
            </p>
          </div>
        </div>

        <div className="info-section">
          <div className="context-info-cards">
            <div className="context-card">
              <h3>🎯 SDR Context</h3>
              <p>Sales calls with dynamic prospect data</p>
              <ul>
                <li>Personalized greetings with {`{{prospectName}}`}</li>
                <li>Company-aware conversations {`{{companyName}}`}</li>
                <li>BANT criteria qualification</li>
                <li>Meeting scheduling</li>
              </ul>
              <small>Voice: Nova | Model: GPT-4 | Template: "Hi {`{{prospectName}}`}"</small>
            </div>

            <div className="context-card">
              <h3>👔 Recruiter Context</h3>
              <p>Candidate screening with role-specific data</p>
              <ul>
                <li>Candidate name personalization {`{{candidateName}}`}</li>
                <li>Position-specific questions {`{{position}}`}</li>
                <li>Company culture alignment {`{{companyName}}`}</li>
                <li>Technical assessments</li>
              </ul>
              <small>Voice: Shimmer | Model: GPT-4 | Template: "Hello {`{{candidateName}}`}!"</small>
            </div>

            <div className="context-card">
              <h3>🚀 Dynamic Data</h3>
              <p>Runtime data injection into conversations</p>
              <ul>
                <li>Template placeholders in messages</li>
                <li>Context-aware system prompts</li>
                <li>Function call personalization</li>
                <li>Real-time data binding</li>
              </ul>
              <small>Template Engine | Data Binding | Personalization</small>
            </div>
          </div>

          {voiceAgent.lastMessage && (
            <div className="message-log">
              <h3>Latest Message</h3>
              <pre>{JSON.stringify(voiceAgent.lastMessage, null, 2)}</pre>
            </div>
          )}

          {voiceAgent.lastFunctionCall && (
            <div className="function-log">
              <h3>Latest Function Call</h3>
              <pre>{JSON.stringify(voiceAgent.lastFunctionCall, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Built with <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer">Vapi</a> • 
          Dynamic Configuration System • 
          Powered by AI voice technology
        </p>
      </footer>
    </div>
  );
}

export default App;