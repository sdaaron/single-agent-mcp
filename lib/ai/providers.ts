import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { isTestEnvironment } from '../constants';
// Remove test model imports if no longer needed
// import {
//   artifactModel,
//   chatModel,
//   reasoningModel,
//   titleModel,
// } from './models.test';

// Define the provider configuration outside the isTestEnvironment check for clarity
const productionProviderConfig = {
  languageModels: {
    // Gemini Models - Re-enable middleware
    'gemini-2.5-pro-preview-03-25': wrapLanguageModel({
      model: google('gemini-2.5-pro-preview-03-25'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),

    // Claude Models - Map both IDs to the base model, remove middleware
    'claude-3-7-sonnet-20250219': anthropic('claude-3-7-sonnet-20250219'),
    'claude-3-7-sonnet-20250219-thinking': anthropic('claude-3-7-sonnet-20250219'), // Map to base model

    // Grok Models
    'grok-3-beta': wrapLanguageModel({
      model: xai('grok-3-beta'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'grok-3-mini-beta': wrapLanguageModel({
      model: xai('grok-3-mini-beta'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),

    // Keep title/artifact models if still needed, pointing to a suitable model
    // If not needed, they can be removed.
    // Example: using grok-3-mini-beta for these tasks
    'title-model': xai('grok-3-mini-beta'),
    'artifact-model': xai('grok-3-mini-beta'),
  },
  imageModels: {
    // Removed Gemini image model as it requires separate integration
    // 'gemini-2.0-flash-exp-image-generation': google.image('gemini-2.0-flash-exp-image-generation'), // Incorrect usage
    // Keep existing Grok image model if needed, otherwise remove
    'small-model': xai.image('grok-2-image'),
  },
};

// Export the provider, potentially switching based on environment
export const myProvider = isTestEnvironment
  ? customProvider({ /* Define test environment providers here if needed */
     languageModels: {},
     imageModels: {},
    })
  : customProvider(productionProviderConfig);
