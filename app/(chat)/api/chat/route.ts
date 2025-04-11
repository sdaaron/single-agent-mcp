import {
  StreamTextResult,
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
  DataStreamWriter,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { chatModels } from '@/lib/ai/models';
import { CoreMessage } from 'ai';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel: selectedChatModelId,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveChat({ id, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    const selectedModelInfo = chatModels.find(m => m.id === selectedChatModelId);

    if (!selectedModelInfo) {
      console.error(`Model with ID ${selectedChatModelId} not found in models.ts`);
      return new Response('Invalid model selected', { status: 400 });
    }

    const modelIdForProvider = selectedChatModelId.endsWith('-thinking')
                             ? selectedChatModelId.replace('-thinking', '')
                             : selectedChatModelId;

    return createDataStreamResponse({
      execute: async (dataStream: DataStreamWriter) => {
        try {
          const tools = {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          };

          const streamTextOptions: any = {
            model: myProvider.languageModel(modelIdForProvider),
            system: systemPrompt({ selectedChatModel: selectedChatModelId }),
            messages,
            maxSteps: 5,
            experimental_transform: smoothStream({ chunking: 'word' }),
            experimental_generateMessageId: generateUUID,
            tools: tools,
            onFinish: async ({ response }: { response: any }) => {
              console.log("--- streamText raw onFinish data (middleware disabled for Gemini) ---");
              console.log("Final Response Messages Structure:", JSON.stringify(response?.messages, null, 2));
              console.log("--- End streamText raw onFinish data ---");
              
              if (session.user?.id) {
                try {
                  const assistantMessages = response?.messages?.filter(
                    (message: CoreMessage) => message.role === 'assistant'
                  ) ?? [];
                  
                  const assistantId = getTrailingMessageId({ messages: assistantMessages });

                  if (!assistantId) {
                    console.error('No assistant message found in final response!');
                    return; 
                  }

                  const finalMessages = appendResponseMessages({
                    messages: [userMessage],
                    responseMessages: response?.messages ?? [],
                  });
                  
                  const assistantMessage = finalMessages.find(m => m.id === assistantId);

                  if (!assistantMessage) {
                    console.error('Assistant message with ID not found after appendResponseMessages!');
                    return;
                  }

                  await saveMessages({
                    messages: [
                      {
                        id: assistantId,
                        chatId: id,
                        role: assistantMessage.role,
                        parts: assistantMessage.parts,
                        attachments:
                          assistantMessage.experimental_attachments ?? [],
                        createdAt: new Date(),
                      },
                    ],
                  });
                } catch (saveError) {
                  console.error('Failed to save chat after stream finish:', saveError);
                }
              }
            },
            experimental_telemetry: {
              isEnabled: isProductionEnvironment,
              functionId: 'stream-text',
            },
          };

          if (selectedChatModelId === 'claude-3-7-sonnet-20250219-thinking') {
            streamTextOptions.providerOptions = {
              anthropic: {
                thinking: { type: 'enabled', budgetTokens: 12000 },
              },
            };
          } else if (selectedModelInfo.isReasoningEnabled) {
            streamTextOptions.experimental_activeTools = Object.keys(tools);
          } else {
            streamTextOptions.experimental_activeTools = [];
          }

          const result = streamText(streamTextOptions);

          // Remove the raw stream logging loop to fix linter error and simplify
          // --- Start: Log raw stream parts --- 
          // const [logStream, mainStream] = result.fullStream.tee(); 
          // console.log("--- Logging raw stream parts from Gemini (middleware disabled) ---");
          // (async () => { ... logging logic ... })();
          // --- End: Log raw stream parts --- 
          
          // Consume the stream using the original result object's logic
          result.consumeStream(); 

          // Merge the result into the data stream
          result.mergeIntoDataStream(dataStream, {
            sendReasoning: true, 
          });

        } catch (error) {
          console.error("Error during streamText execution:", error);
        }
      },
      onError: (error) => {
        console.error("DataStreamResponse level error:", error);
        return 'Oops, an error occurred!';
      },
    });
  } catch (error) {
    console.error("Error in POST /api/chat handler:", error);
    return new Response('An internal server error occurred', {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
