import { useCallback } from "react";
import { SAMPLE_DATA } from "../utils/constants";

export const handleCallError = (error: unknown, context: string) => {
  console.error(`Failed to start ${context} call:`, error);
};
interface UseCallHandlersProps {
  startCall: (
    contextId: string,
    options?: { dynamicData?: Record<string, string> },
  ) => Promise<void>;
  endCall: () => Promise<void>;
}

export const useCallHandlers = ({
  startCall,
  endCall,
}: UseCallHandlersProps) => {
  const handleStartCall = useCallback(
    async (contextId: string) => {
      try {
        await startCall(contextId);
      } catch (error) {
        handleCallError(error, "general");
      }
    },
    [startCall],
  );

  const handleEndCall = useCallback(async () => {
    try {
      await endCall();
    } catch (error) {
      handleCallError(error, "end call");
    }
  }, [endCall]);

  const handleStartSDRCallWithData = useCallback(async () => {
    try {
      await startCall("sdr", { dynamicData: SAMPLE_DATA.sdr });
    } catch (error) {
      handleCallError(error, "sdr");
    }
  }, [startCall]);

  const handleStartRecruiterCallWithData = useCallback(async () => {
    try {
      await startCall("recruiter", { dynamicData: SAMPLE_DATA.recruiter });
    } catch (error) {
      handleCallError(error, "recruiter");
    }
  }, [startCall]);

  return {
    handleStartCall,
    handleEndCall,
    handleStartSDRCallWithData,
    handleStartRecruiterCallWithData,
  };
};
