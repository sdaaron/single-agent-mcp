import { isTestEnvironment } from '@/lib/constants';

interface ChatModel {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  isReasoningEnabled: boolean;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'gemini-2.5-pro-preview-03-25',
    name: 'Gemini 2.5 Pro (thinking)',
    description: 'Google\'s most powerful thinking model (Preview).',
    contextWindow: 1_000_000,
    isReasoningEnabled: true,
  },
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude Sonnet 3.7',
    description: 'Anthropic\'s Sonnet model (3-7 version).',
    contextWindow: 200_000,
    isReasoningEnabled: false,
  },
  {
    id: 'claude-3-7-sonnet-20250219-thinking',
    name: 'Claude Sonnet 3.7 (thinking)',
    description: 'Anthropic\'s Sonnet model (3-7 version) with reasoning.',
    contextWindow: 200_000,
    isReasoningEnabled: true,
  },
  {
    id: 'grok-3-beta',
    name: 'Grok 3 Beta (thinking)',
    description: 'xAI\'s Beta model with reasoning capabilities.',
    contextWindow: 131_072,
    isReasoningEnabled: true,
  },
  {
    id: 'grok-3-mini-beta',
    name: 'Grok 3 Mini Beta (thinking)',
    description: 'A smaller xAI model optimized for speed, with reasoning capabilities.',
    contextWindow: 131_072,
    isReasoningEnabled: true,
  },
];

// Set the default chat model to the first one in the new list.
export const DEFAULT_CHAT_MODEL = chatModels[0].id;

// --- Image Models --- (Separate definition for clarity)
interface ImageModel {
  id: string;
  name: string;
  description: string;
}

export const imageModelsList: Array<ImageModel> = [
 {
    id: 'gemini-2.0-flash-exp-image-generation',
    name: 'Gemini 2.0 Flash Image Generation',
    description: 'Google\'s experimental image generation model.',
  },
   // Add other image models here if needed
];

// Note: The old test environment models are removed for simplicity.
// If needed, they can be added back within an isTestEnvironment check.
