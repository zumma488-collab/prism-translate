import { LanguageModel } from 'ai';
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

import { ProviderConfig } from '../../types';
import { safeFetch } from './safeFetch';

export function createModel(provider: ProviderConfig, modelId: string): LanguageModel {
    switch (provider.type) {
        case 'google': {
            const google = createGoogleGenerativeAI({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return google(modelId || 'gemini-2.0-flash');
        }

        case 'anthropic': {
            const anthropic = createAnthropic({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return anthropic(modelId || 'claude-3-5-sonnet-20241022');
        }

        case 'mistral': {
            const mistral = createMistral({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return mistral(modelId || 'mistral-large-latest');
        }

        case 'xai': {
            const xai = createXai({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return xai(modelId || 'grok-2');
        }

        case 'cohere': {
            const cohere = createCohere({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return cohere(modelId || 'command-r-plus');
        }

        case 'groq': {
            const groq = createGroq({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return groq(modelId || 'llama-3.3-70b-versatile');
        }

        case 'deepseek': {
            const deepseek = createDeepSeek({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return deepseek(modelId || 'deepseek-chat');
        }

        case 'together': {
            const together = createTogetherAI({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return together(modelId || 'meta-llama/Llama-3.3-70B-Instruct-Turbo');
        }

        case 'fireworks': {
            const fireworks = createFireworks({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return fireworks(modelId || 'accounts/fireworks/models/llama-v3p3-70b-instruct');
        }

        case 'deepinfra': {
            const deepinfra = createDeepInfra({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return deepinfra(modelId || 'meta-llama/Llama-3.3-70B-Instruct');
        }

        case 'perplexity': {
            const perplexity = createPerplexity({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return perplexity(modelId || 'sonar-pro');
        }

        case 'cerebras': {
            const cerebras = createCerebras({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
            return cerebras(modelId || 'llama-3.3-70b');
        }



        case 'ollama': {
            const ollama = createOllama({ baseURL: provider.baseUrl || 'http://localhost:11434/api', fetch: safeFetch });
            return ollama(modelId || 'llama3.2') as unknown as LanguageModel;
        }

        case 'zhipu': {
            const zhipu = createZhipu({ apiKey: provider.apiKey, baseURL: provider.baseUrl || undefined, fetch: safeFetch });
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
                baseURL: provider.baseUrl || undefined,
                fetch: safeFetch,
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
                fetch: safeFetch,
            });
            // Use .chat() for better compatibility with third-party APIs
            // The default uses OpenAI Responses API which may not be supported
            return openai.chat(modelId);
        }
    }
}
