import { useVoiceAgent } from "./hooks/useVoiceAgent";
import { VoiceControls } from "./components/VoiceControls";

// Vapi public key from environment variables
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

function App() {
  const voiceAgent = useVoiceAgent({
    publicKey: VAPI_PUBLIC_KEY,
  });

  console.log("Using Vapi public key:", VAPI_PUBLIC_KEY ? "Set" : "Not set");

  const handleStartCall = async (contextId: string) => {
    try {
      await voiceAgent.startCall(contextId);
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  const handleEndCall = async () => {
    try {
      await voiceAgent.endCall();
    } catch (error) {
      console.error("Failed to end call:", error);
    }
  };

  const handleStartSDRCallWithData = async () => {
    try {
      await voiceAgent.startCall("sdr", {
        dynamicData: {
          prospectName: "John Smith",
          companyName: "Tech Solutions Inc.",
        },
      });
    } catch (error) {
      console.error("Failed to start SDR call with data:", error);
    }
  };

  const handleStartRecruiterCallWithData = async () => {
    try {
      await voiceAgent.startCall("recruiter", {
        dynamicData: {
          candidateName: "Sarah Johnson",
          position: "Senior Software Engineer",
          companyName: "Innovate Corp",
        },
      });
    } catch (error) {
      console.error("Failed to start recruiter call with data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900">
      <header className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4 animate-fade-in">
            🎤 Voice Agent Demo
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto animate-slide-up">
            AI-powered voice conversations with dynamic data injection
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-12">
          <div className="animate-fade-in">
            <VoiceControls
              state={voiceAgent}
              onStartCall={handleStartCall}
              onEndCall={handleEndCall}
              onClearError={voiceAgent.clearError}
            />

            {/* Dynamic Data Controls */}
            <div className="glass-card p-8 mt-8">
              <h3 className="text-2xl font-semibold mb-6 text-gradient">
                🎯 Dynamic Data Examples
              </h3>
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={handleStartSDRCallWithData}
                  className="btn-primary flex-1 min-w-[280px]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>🎯</span>
                    SDR Call: John @ Tech Solutions
                  </span>
                </button>
                <button
                  onClick={handleStartRecruiterCallWithData}
                  className="btn-primary flex-1 min-w-[280px]"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>👔</span>
                    Recruiter Call: Sarah for SWE Role
                  </span>
                </button>
              </div>
              <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <strong>💡 Pro Tip:</strong> These buttons demonstrate dynamic
                data injection - names and companies are automatically inserted
                into the conversation context.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-xl font-semibold mb-3 text-indigo-600">
                  🎯 SDR Context
                </h3>
                <p className="text-gray-600 mb-4">
                  Sales calls with dynamic prospect data
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Personalized greetings with {`{{prospectName}}`}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Company-aware conversations {`{{companyName}}`}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    BANT criteria qualification
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Meeting scheduling
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                  <small className="text-indigo-700 font-medium">
                    Voice: Nova | Model: GPT-4 | Template: "Hi{" "}
                    {`{{prospectName}}`}"
                  </small>
                </div>
              </div>

              <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-xl font-semibold mb-3 text-purple-600">
                  👔 Recruiter Context
                </h3>
                <p className="text-gray-600 mb-4">
                  Candidate screening with role-specific data
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Candidate name personalization {`{{candidateName}}`}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Position-specific questions {`{{position}}`}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Company culture alignment {`{{companyName}}`}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Technical assessments
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <small className="text-purple-700 font-medium">
                    Voice: Shimmer | Model: GPT-4 | Template: "Hello{" "}
                    {`{{candidateName}}`}!"
                  </small>
                </div>
              </div>

              <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-xl font-semibold mb-3 text-pink-600">
                  🚀 Dynamic Data
                </h3>
                <p className="text-gray-600 mb-4">
                  Runtime data injection into conversations
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Template placeholders in messages
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Context-aware system prompts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Function call personalization
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    Real-time data binding
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                  <small className="text-pink-700 font-medium">
                    Template Engine | Data Binding | Personalization
                  </small>
                </div>
              </div>
            </div>

            {voiceAgent.error && (
              <div className="glass-card p-6 border-red-200 bg-red-50/50 animate-slide-up">
                <h3 className="text-lg font-semibold mb-3 text-red-600">
                  🔴 Connection Status
                </h3>
                <div className="space-y-2">
                  <p className="text-red-700">
                    <strong>Error:</strong> {voiceAgent.error}
                  </p>
                  {voiceAgent.connectionAttempts > 0 && (
                    <p className="text-red-600">
                      <strong>Reconnection attempts:</strong>{" "}
                      {voiceAgent.connectionAttempts}/3
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
