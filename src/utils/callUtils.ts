import { SAMPLE_DATA } from './constants';

export const handleCallError = (error: unknown, context: string) => {
  console.error(`Failed to start ${context} call:`, error);
};

export const createCallHandler = (
  startCall: (contextId: string, options?: { dynamicData?: Record<string, string> }) => Promise<void>,
  contextId: string,
  dynamicData?: Record<string, string>
) => {
  return async () => {
    try {
      const options = dynamicData ? { dynamicData } : {};
      await startCall(contextId, options);
    } catch (error) {
      handleCallError(error, contextId);
    }
  };
};

export const createSDRCallHandler = (
  startCall: (contextId: string, options?: { dynamicData?: Record<string, string> }) => Promise<void>
) => {
  return createCallHandler(startCall, 'sdr', SAMPLE_DATA.sdr);
};

export const createRecruiterCallHandler = (
  startCall: (contextId: string, options?: { dynamicData?: Record<string, string> }) => Promise<void>
) => {
  return createCallHandler(startCall, 'recruiter', SAMPLE_DATA.recruiter);
};