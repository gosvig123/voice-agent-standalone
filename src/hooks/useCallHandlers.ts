import { useCallback } from 'react';
import { handleCallError } from '../utils/callUtils';
import { SAMPLE_DATA } from '../utils/constants';

interface UseCallHandlersProps {
  startCall: (contextId: string, options?: { dynamicData?: Record<string, string> }) => Promise<void>;
  endCall: () => Promise<void>;
}

export const useCallHandlers = ({ startCall, endCall }: UseCallHandlersProps) => {
  const handleStartCall = useCallback(async (contextId: string) => {
    try {
      await startCall(contextId);
    } catch (error) {
      handleCallError(error, 'general');
    }
  }, [startCall]);

  const handleEndCall = useCallback(async () => {
    try {
      await endCall();
    } catch (error) {
      handleCallError(error, 'end call');
    }
  }, [endCall]);

  const handleStartSDRCallWithData = useCallback(async () => {
    try {
      await startCall('sdr', { dynamicData: SAMPLE_DATA.sdr });
    } catch (error) {
      handleCallError(error, 'sdr');
    }
  }, [startCall]);

  const handleStartRecruiterCallWithData = useCallback(async () => {
    try {
      await startCall('recruiter', { dynamicData: SAMPLE_DATA.recruiter });
    } catch (error) {
      handleCallError(error, 'recruiter');
    }
  }, [startCall]);

  return {
    handleStartCall,
    handleEndCall,
    handleStartSDRCallWithData,
    handleStartRecruiterCallWithData,
  };
};