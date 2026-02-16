import { generateText, LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createXai } from '@ai-sdk/xai';
import { createCohere } from '@ai-sdk/cohere';
import { createGroq } from '@ai-sdk/groq';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { createFireworks } from '@ai-sdk/fireworks';
import { createDeepInfra } from '@ai-sdk/deepinfra';
import { createPerplexity } from '@ai-sdk/perplexity';
import { createCerebras } from '@ai-sdk/cerebras';
import { createOllama } from 'ollama-ai-provider';
import { createZhipu } from 'zhipu-ai-provider';
import { createWorkersAI } from 'workers-ai-provider';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';


import { TranslationResult, ProviderConfig } from '../types';

export interface LLMRequest {
    text: string;
    targetLanguages: string[];
    provider: ProviderConfig;
    modelId: string;
}

const SYSTEM_PROMPT = `
You are a professional translator.
For each language, provide:
1. The translated text.
2. The tone (e.g., Formal, Casual, Neutral).
3. A confidence score between 0 and 100.
4. The standard ISO language code.

Return the response strictly as a JSON array with this schema:
[
  {
    "language": "Target Language Name",
    "code": "ISO Code",
    "text": "Translated Text",
    "tone": "Tone",
    "confidence": 95
  }
]
`;

// Request timeout: default 30 minutes, configurable via VITE_REQUEST_TIMEOUT_MS in .env
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS) || 30 * 60 * 1000;

export const translateText = async (request: LLMRequest): Promise<TranslationResult[]> => {
    const { text, targetLanguages, provider, modelId } = request;

    if (!provider.apiKey && provider.type !== 'ollama') {
        throw new Error("API Key is missing");
    }

    const userPrompt = `Translate this text: "${text}" into these languages: ${targetLanguages.join(", ")}.`;
    const model = createModel(provider, modelId);

    try {
        const { text: responseText } = await generateText({
            model,
            system: SYSTEM_PROMPT,
            prompt: userPrompt,
            abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (!responseText) {
            throw new Error("No response from AI model");
        }

        const cleaned = responseText
            .replace(/<think>[\s\S]*?<\/think>/g, '')
            .trim();

        const startIdx = cleaned.indexOf('[');
        const endIdx = cleaned.lastIndexOf(']');
        if (startIdx === -1 || endIdx === -1) {
            throw new Error("Could not extract JSON from AI response");
        }
        return JSON.parse(cleaned.substring(startIdx, endIdx + 1)) as TranslationResult[];

    } catch (error) {
        console.error("Translation Error:", error);
        throw error;
    }
};

function createModel(provider: ProviderConfig, modelId: string): LanguageModel {
    switch (provider.type) {
        case 'google': {
            const google = createGoogleGenerativeAI({ apiKey: provider.apiKey });
            return google(modelId || 'gemini-2.0-flash');
        }

        case 'anthropic': {
            const anthropic = createAnthropic({ apiKey: provider.apiKey });
            return anthropic(modelId || 'claude-3-5-sonnet-20241022');
        }

        case 'mistral': {
            const mistral = createMistral({ apiKey: provider.apiKey });
            return mistral(modelId || 'mistral-large-latest');
        }

        case 'xai': {
            const xai = createXai({ apiKey: provider.apiKey });
            return xai(modelId || 'grok-2');
        }

        case 'cohere': {
            const cohere = createCohere({ apiKey: provider.apiKey });
            return cohere(modelId || 'command-r-plus');
        }

        case 'groq': {
            const groq = createGroq({ apiKey: provider.apiKey });
            return groq(modelId || 'llama-3.3-70b-versatile');
        }

        case 'deepseek': {
            const deepseek = createDeepSeek({ apiKey: provider.apiKey });
            return deepseek(modelId || 'deepseek-chat');
        }

        case 'together': {
            const together = createTogetherAI({ apiKey: provider.apiKey });
            return together(modelId || 'meta-llama/Llama-3.3-70B-Instruct-Turbo');
        }

        case 'fireworks': {
            const fireworks = createFireworks({ apiKey: provider.apiKey });
            return fireworks(modelId || 'accounts/fireworks/models/llama-v3p3-70b-instruct');
        }

        case 'deepinfra': {
            const deepinfra = createDeepInfra({ apiKey: provider.apiKey });
            return deepinfra(modelId || 'meta-llama/Llama-3.3-70B-Instruct');
        }

        case 'perplexity': {
            const perplexity = createPerplexity({ apiKey: provider.apiKey });
            return perplexity(modelId || 'sonar-pro');
        }

        case 'cerebras': {
            const cerebras = createCerebras({ apiKey: provider.apiKey });
            return cerebras(modelId || 'llama-3.3-70b');
        }



        case 'ollama': {
            const ollama = createOllama({ baseURL: provider.baseUrl || 'http://localhost:11434/api' });
            return ollama(modelId || 'llama3.2') as unknown as LanguageModel;
        }

        case 'zhipu': {
            const zhipu = createZhipu({ apiKey: provider.apiKey });
            return zhipu(modelId || 'glm-4-plus') as unknown as LanguageModel;
        }

        case 'workers': {
            const workersAI = createWorkersAI({
                accountId: provider.accountId,
                apiKey: provider.apiKey,
            });
            return workersAI(modelId || '@cf/meta/llama-3.3-70b-instruct-fp8-fast');
        }

        case 'openrouter': {
            const openrouter = createOpenRouter({
                apiKey: provider.apiKey,
                headers: {
                    'HTTP-Referer': 'https://github.com/vercel/ai', // Optional: for rankings
                    'X-Title': 'Prism Translate', // Optional: for rankings
                }
            });
            return openrouter(modelId || 'openai/gpt-4o');
        }

        case 'openai':
        case 'custom':
        default: {
            // OpenAI and all OpenAI-compatible APIs (Kimi, Qianwen, MiniMax, GLM, Baichuan, Doubao, etc.)
            const openai = createOpenAI({
                apiKey: provider.apiKey,
                baseURL: provider.baseUrl || 'https://api.openai.com/v1',
            });
            // Use .chat() for better compatibility with third-party APIs
            // The default uses OpenAI Responses API which may not be supported
            return openai.chat(modelId);
        }
    }
}

// Re-export SUPPORTED_PROVIDERS from centralized config
export { SUPPORTED_PROVIDERS } from '@/config/models';
