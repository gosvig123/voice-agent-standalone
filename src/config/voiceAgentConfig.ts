// Simplified voice agent configuration
export interface AssistantConfig {
  name: string;
  firstMessage: string;
  systemMessage: string;
  voice?: {
    provider: 'openai';
    voiceId: 'alloy' | 'echo' | 'nova' | 'shimmer';
  };
  model?: {
    provider: 'openai';
    model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o';
    temperature?: number;
  };
}

export interface ContextConfig {
  id: string;
  name: string;
  assistant: AssistantConfig;
}

// Default configurations
export const DEFAULT_CONTEXTS: Record<string, ContextConfig> = {
  sdr: {
    id: 'sdr',
    name: 'Sales Development Representative',
    assistant: {
      name: 'SDR Assistant',
      firstMessage: 'Hi {{prospectName}}! I\'m calling from {{companyName}} to discuss an exciting opportunity. Do you have a quick moment to chat?',
      systemMessage: `You are an experienced Sales Development Representative calling {{prospectName}} from {{companyName}}. Focus on:
1. Building rapport quickly with {{prospectName}}
2. Qualifying leads using BANT criteria
3. Scheduling meetings with qualified prospects
4. Being concise and professional

The prospect's name is {{prospectName}} and they work at {{companyName}}.`,
      voice: { provider: 'openai', voiceId: 'nova' },
      model: { provider: 'openai', model: 'gpt-4', temperature: 0.7 }
    }
  },

  recruiter: {
    id: 'recruiter',
    name: 'Recruiter',
    assistant: {
      name: 'Recruiter Assistant',
      firstMessage: 'Hello {{candidateName}}! Thank you for taking the time to speak with me today about the {{position}} role. I\'m excited to learn more about your background.',
      systemMessage: `You are an experienced recruiter conducting a phone screen with {{candidateName}} for the {{position}} role at {{companyName}}. Focus on:
1. Creating a welcoming atmosphere for {{candidateName}}
2. Assessing candidate qualifications for the {{position}} role
3. Evaluating technical skills relevant to {{position}}
4. Gauging cultural fit at {{companyName}}

The candidate's name is {{candidateName}} and the position is {{position}} at {{companyName}}.`,
      voice: { provider: 'openai', voiceId: 'shimmer' },
      model: { provider: 'openai', model: 'gpt-4', temperature: 0.7 }
    }
  }
};