import { ModelProvider, ModelDefinition } from '../types';

/**
 * Provider Definition Interface
 * Unified for UI display and SDK configuration
 */
export interface ProviderDefinition {
    id: ModelProvider;              // Type identifier (for SDK selection)
    name: string;                   // Display name
    icon: string;                   // Material Symbol icon name
    description: string;            // Short description
    defaultModel: string;           // Default model ID
    defaultModels: ModelDefinition[]; // Preset model list
    category: 'popular' | 'all';
    baseUrl?: string;               // Custom endpoint (OpenAI compatible)
    requires?: string[];            // Extra required fields (e.g., accountId)
    supportsFetchModels?: boolean;  // Whether GET /models endpoint is supported (default: true)
}

/**
 * All Supported Provider Definitions
 * Single source of truth for UI display and SDK configuration
 */
export const PROVIDER_DEFINITIONS: ProviderDefinition[] = [
    // ==================== Popular ====================
    {
        id: 'google',
        name: 'Google Gemini',
        icon: 'token',
        description: 'Gemini 3 Pro, Flash',
        defaultModel: 'gemini-2.0-flash',
        defaultModels: [
            {
                id: 'gemini-2.0-flash',
                name: 'Gemini 2.0 Flash',
                enabled: true,
                capabilities: { vision: true, audio: true }
            },
            {
                id: 'gemini-3-pro',
                name: 'Gemini 3 Pro',
                enabled: true,
                capabilities: { vision: true, audio: true, video: true },
            },
            {
                id: 'gemini-3-flash',
                name: 'Gemini 3 Flash',
                enabled: true,
                capabilities: { vision: true, audio: true, video: true },
            },
        ],
        category: 'popular',
        supportsFetchModels: true,
    },
    {
        id: 'openai',
        name: 'OpenAI',
        icon: 'smart_toy',
        description: 'GPT-4o, GPT-4o Mini',
        defaultModel: 'gpt-4o',
        defaultModels: [
            { id: 'gpt-4o', name: 'GPT-4o', enabled: true },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', enabled: true },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', enabled: false },
        ],
        category: 'popular',
        supportsFetchModels: true,
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        icon: 'psychology',
        description: 'Claude 3.5 Sonnet, Haiku',
        defaultModel: 'claude-3-5-sonnet-20241022',
        defaultModels: [
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', enabled: true },
            { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', enabled: true },
        ],
        category: 'popular',
        supportsFetchModels: true,
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        icon: 'explore',
        description: 'DeepSeek Chat, Coder',
        defaultModel: 'deepseek-chat',
        defaultModels: [
            { id: 'deepseek-chat', name: 'DeepSeek Chat', enabled: true },
            { id: 'deepseek-coder', name: 'DeepSeek Coder', enabled: true },
        ],
        category: 'popular',
        supportsFetchModels: true,
    },

    // ==================== All Providers ====================
    {
        id: 'mistral',
        name: 'Mistral AI',
        icon: 'air',
        description: 'Mistral Large, Medium',
        defaultModel: 'mistral-large-latest',
        defaultModels: [
            { id: 'mistral-large-latest', name: 'Mistral Large', enabled: true },
            { id: 'mistral-medium-latest', name: 'Mistral Medium', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'xai',
        name: 'xAI Grok',
        icon: 'rocket_launch',
        description: 'Grok-2',
        defaultModel: 'grok-2',
        defaultModels: [
            { id: 'grok-2', name: 'Grok-2', enabled: true },
            { id: 'grok-2-mini', name: 'Grok-2 Mini', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'cohere',
        name: 'Cohere',
        icon: 'hub',
        description: 'Command R+',
        defaultModel: 'command-r-plus',
        defaultModels: [
            { id: 'command-r-plus', name: 'Command R+', enabled: true },
            { id: 'command-r', name: 'Command R', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'groq',
        name: 'Groq',
        icon: 'bolt',
        description: 'Llama 3.3 70B (Fast)',
        defaultModel: 'llama-3.3-70b-versatile',
        defaultModels: [
            { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', enabled: true },
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'together',
        name: 'Together AI',
        icon: 'groups',
        description: 'Llama, Mixtral',
        defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        defaultModels: [
            { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Turbo', enabled: true },
            { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'fireworks',
        name: 'Fireworks AI',
        icon: 'local_fire_department',
        description: 'Llama 3.3',
        defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
        defaultModels: [
            { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', name: 'Llama 3.3 70B', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'deepinfra',
        name: 'DeepInfra',
        icon: 'memory',
        description: 'Llama, Mixtral',
        defaultModel: 'meta-llama/Llama-3.3-70B-Instruct',
        defaultModels: [
            { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'perplexity',
        name: 'Perplexity',
        icon: 'search',
        description: 'Sonar Pro (Web Search)',
        defaultModel: 'sonar-pro',
        defaultModels: [
            { id: 'sonar-pro', name: 'Sonar Pro', enabled: true },
            { id: 'sonar', name: 'Sonar', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'cerebras',
        name: 'Cerebras',
        icon: 'speed',
        description: 'Llama 3.3 70B (Instant)',
        defaultModel: 'llama-3.3-70b',
        defaultModels: [
            { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'ollama',
        name: 'Ollama',
        icon: 'computer',
        description: 'Local Run (Free)',
        defaultModel: 'llama3.2',
        defaultModels: [
            { id: 'llama3.2', name: 'Llama 3.2', enabled: true },
            { id: 'qwen2.5', name: 'Qwen 2.5', enabled: true },
            { id: 'deepseek-r1', name: 'DeepSeek R1', enabled: true },
        ],
        baseUrl: 'http://localhost:11434/api',
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'zhipu',
        name: 'Zhipu AI',
        icon: 'translate',
        description: 'GLM-4 Plus',
        defaultModel: 'glm-4-plus',
        defaultModels: [
            { id: 'glm-4-plus', name: 'GLM-4 Plus', enabled: true },
            { id: 'glm-4-flash', name: 'GLM-4 Flash', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        icon: 'route',
        description: 'Unified access to models',
        defaultModel: 'openai/gpt-4o',
        defaultModels: [
            { id: 'openai/gpt-4o', name: 'GPT-4o (via OpenRouter)', enabled: true },
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', enabled: true },
        ],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'workers',
        name: 'Cloudflare Workers AI',
        icon: 'cloud',
        description: 'Edge Inference',
        defaultModel: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        defaultModels: [
            { id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', name: 'Llama 3.3 70B', enabled: true },
        ],
        requires: ['accountId'],
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'custom',
        name: 'Kimi (Moonshot)',
        icon: 'nightlight',
        description: 'Kimi K2.5',
        defaultModel: 'kimi-k2.5',
        defaultModels: [
            { id: 'kimi-k2.5', name: 'Kimi K2.5', enabled: true },
            { id: 'moonshot-v1-auto', name: 'Moonshot Auto', enabled: true },
        ],
        baseUrl: 'https://api.moonshot.cn/v1',
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'custom',
        name: 'Qwen (Tongyi Qianwen)',
        icon: 'cloud_circle',
        description: 'Qwen3 Max, Qwen3.5 Plus',
        defaultModel: 'qwen-max-2025-01-25',
        defaultModels: [
            {
                id: 'qwen-max-2025-01-25',
                name: 'Qwen3 Max',
                enabled: true,
                capabilities: { reasoning: true, coding: true },
            },
            {
                id: 'qwen3.5-plus',
                name: 'Qwen3.5 Plus',
                enabled: true,
                capabilities: { agentic: true },
            },
            {
                id: 'qwen-vl-max',
                name: 'Qwen3 VL Max',
                enabled: true,
                capabilities: { vision: true, video: true },
            }
        ],
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'custom',
        name: 'MiniMax',
        icon: 'auto_awesome',
        description: 'MiniMax-M2',
        defaultModel: 'MiniMax-M2',
        defaultModels: [
            { id: 'MiniMax-M2', name: 'MiniMax-M2', enabled: true },
        ],
        baseUrl: 'https://api.minimaxi.com/v1',
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'custom',
        name: 'Baichuan',
        icon: 'water_drop',
        description: 'Baichuan4',
        defaultModel: 'Baichuan4',
        defaultModels: [
            { id: 'Baichuan4', name: 'Baichuan4', enabled: true },
        ],
        baseUrl: 'https://api.baichuan-ai.com/v1',
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'custom',
        name: 'Doubao',
        icon: 'smart_toy',
        description: 'ByteDance',
        defaultModel: 'ep-xxxxx-xxxxx',
        defaultModels: [
            { id: 'ep-xxxxx-xxxxx', name: 'Doubao (Endpoint ID Required)', enabled: true },
        ],
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        category: 'all',
        supportsFetchModels: true,
    },
    {
        id: 'custom',
        name: 'Custom Provider',
        icon: 'tune',
        description: 'Any OpenAI Compatible API',
        defaultModel: '',
        defaultModels: [],
        category: 'all',
        supportsFetchModels: true,
    },
];

// ==================== Helper Functions ====================

/**
 * Get provider list by category
 */
export function getProvidersByCategory(category: ProviderDefinition['category']): ProviderDefinition[] {
    return PROVIDER_DEFINITIONS.filter(p => p.category === category);
}

/**
 * Get provider definition by ID (returns first match)
 */
export function getProviderById(id: ModelProvider): ProviderDefinition | undefined {
    return PROVIDER_DEFINITIONS.find(p => p.id === id);
}

/**
 * Get provider definition by name (for OpenAI compatible unique identifier)
 */
export function getProviderByName(name: string): ProviderDefinition | undefined {
    return PROVIDER_DEFINITIONS.find(p => p.name === name);
}

/**
 * Get all providers (flat array)
 */
export function getAllProviders(): ProviderDefinition[] {
    return PROVIDER_DEFINITIONS;
}

/**
 * Get category title
 */
export const CATEGORY_TITLES: Record<ProviderDefinition['category'], string> = {
    popular: 'Popular',
    all: 'All Providers',
};

/**
 * Compatible with old format SUPPORTED_PROVIDERS (for llmService usage)
 */
export const SUPPORTED_PROVIDERS = {
    popular: PROVIDER_DEFINITIONS.filter(p => p.category === 'popular'),
    all: PROVIDER_DEFINITIONS.filter(p => p.category === 'all')
};
