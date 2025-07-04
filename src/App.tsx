import { useVoiceAgent } from "./hooks/useVoiceAgent";
import { useCallHandlers } from "./hooks/useCallHandlers";
import { VoiceControls } from "./components/VoiceControls";
import { AppHeader } from "./components/AppHeader";
import { CallActionButtons } from "./components/CallActionButtons";
import { FeatureCard } from "./components/FeatureCard";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { FEATURE_CARDS } from "./utils/constants";

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

function App() {
  const voiceAgent = useVoiceAgent({
    publicKey: VAPI_PUBLIC_KEY,
  });

  const {
    handleStartCall,
    handleEndCall,
    handleStartSDRCallWithData,
    handleStartRecruiterCallWithData,
  } = useCallHandlers({
    startCall: voiceAgent.startCall,
    endCall: voiceAgent.endCall,
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900">
      <AppHeader />
      <main className="flex-1 max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          <div className="animate-fade-in">
            <VoiceControls
              state={voiceAgent}
              onStartCall={handleStartCall}
              onEndCall={handleEndCall}
              onClearError={voiceAgent.clearError}
            />
            <CallActionButtons
              onStartSDRCall={handleStartSDRCallWithData}
              onStartRecruiterCall={handleStartRecruiterCallWithData}
            />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURE_CARDS.map((card) => (
                <FeatureCard
                  key={card.id}
                  title={card.title}
                  description={card.description}
                  color={card.color}
                  features={card.features}
                  metadata={card.metadata}
                />
              ))}
            </div>

            {voiceAgent.error && (
              <ErrorDisplay
                error={voiceAgent.error}
                connectionAttempts={voiceAgent.connectionAttempts}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
