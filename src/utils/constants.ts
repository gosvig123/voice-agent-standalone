export const FEATURE_CARDS = [
  {
    id: 'sdr',
    title: '🎯 SDR Context',
    description: 'Sales calls with dynamic prospect data',
    color: 'indigo',
    features: [
      'Personalized greetings with {{prospectName}}',
      'Company-aware conversations {{companyName}}',
      'BANT criteria qualification',
      'Meeting scheduling',
    ],
    metadata: 'Voice: Nova | Model: GPT-4 | Template: "Hi {{prospectName}}"',
  },
  {
    id: 'recruiter',
    title: '👔 Recruiter Context',
    description: 'Candidate screening with role-specific data',
    color: 'purple',
    features: [
      'Candidate name personalization {{candidateName}}',
      'Position-specific questions {{position}}',
      'Company culture alignment {{companyName}}',
      'Technical assessments',
    ],
    metadata: 'Voice: Shimmer | Model: GPT-4 | Template: "Hello {{candidateName}}!"',
  },
  {
    id: 'dynamic',
    title: '🚀 Dynamic Data',
    description: 'Runtime data injection into conversations',
    color: 'pink',
    features: [
      'Template placeholders in messages',
      'Context-aware system prompts',
      'Function call personalization',
      'Real-time data binding',
    ],
    metadata: 'Template Engine | Data Binding | Personalization',
  },
] as const;

export const SAMPLE_DATA = {
  sdr: {
    prospectName: 'John Smith',
    companyName: 'Tech Solutions Inc.',
  },
  recruiter: {
    candidateName: 'Sarah Johnson',
    position: 'Senior Software Engineer',
    companyName: 'Innovate Corp',
  },
} as const;

export const UI_TEXT = {
  header: {
    title: '🎤 Voice Agent Demo',
    subtitle: 'AI-powered voice conversations with dynamic data injection',
  },
  dynamicData: {
    title: '🎯 Dynamic Data Examples',
    proTip: '💡 Pro Tip: These buttons demonstrate dynamic data injection - names and companies are automatically inserted into the conversation context.',
    sdrButton: '🎯 SDR Call: John @ Tech Solutions',
    recruiterButton: '👔 Recruiter Call: Sarah for SWE Role',
  },
  error: {
    title: '🔴 Connection Status',
    errorLabel: 'Error:',
    attemptsLabel: 'Reconnection attempts:',
  },
} as const;