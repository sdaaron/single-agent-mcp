export const DEFAULT_CHAT_MODEL: string = 'chat-model';

interface ChatModel {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  isReasoningEnabled: boolean;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat',
    contextWindow: 0,
    isReasoningEnabled: false,
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
    contextWindow: 0,
    isReasoningEnabled: true,
  },
  {
    id: 'grok-2-1212',
    name: 'Grok 2',
    description: 'The latest model from xAI, capable of advanced reasoning.',
    contextWindow: 131_072,
    isReasoningEnabled: false,
  },
  {
    id: 'grok-3-mini-beta',
    name: 'Grok 3 Mini Beta',
    description: 'A smaller model optimized for speed and efficiency, with reasoning capabilities.',
    contextWindow: 131_072,
    isReasoningEnabled: true,
  },
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3-7 Sonnet (20250219)',
    description: 'Anthropic\'s Sonnet model (3-7 version, 20250219).',
    contextWindow: 200_000,
    isReasoningEnabled: false,
  },
  {
    id: 'gemini-2.5-pro-preview-03-25',
    name: 'Gemini 2.5 Pro (Preview)',
    description: 'Google\'s most powerful thinking model (Preview). State-of-the-art performance.',
    contextWindow: 1_000_000,
    isReasoningEnabled: false,
  },
];
