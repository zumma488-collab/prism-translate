export interface TranslationResult {
  language: string;
  code: string;
  text: string;
  tone: string;
  confidence: number;
  modelName?: string;
  providerName?: string;
  error?: string;
}

export type ModelProvider =
  | 'google' | 'openai' | 'anthropic' | 'mistral' | 'xai' | 'cohere'
  | 'groq' | 'deepseek' | 'together' | 'fireworks' | 'deepinfra' | 'perplexity' | 'cerebras'
  | 'azure' | 'vertex' | 'bedrock' | 'ollama' | 'zhipu' | 'workers' | 'openrouter'
  | 'custom';

export interface ModelDefinition {
  id: string;       // The actual model ID sent to API (e.g. 'gpt-4o', 'gemini-1.5-pro')
  name: string;     // Display name (e.g. 'GPT-4o (Project A)')
  enabled?: boolean; // Whether it shows up in the main dropdown
  description?: string;
}

export interface ProviderConfig {
  id: string;           // UUID for this provider instance
  type: ModelProvider;
  name: string;         // Display name for the provider (e.g. "My Company OpenAI")
  apiKey: string;
  baseUrl?: string;     // Only for OpenAI/Custom/Ollama
  headers?: Record<string, string>; // Custom headers
  models: ModelDefinition[];

  // Specific Provider Configs
  resourceName?: string;    // Azure
  projectId?: string;       // Vertex
  location?: string;        // Vertex
  accessKeyId?: string;     // Bedrock
  secretAccessKey?: string; // Bedrock
  region?: string;          // Bedrock
  accountId?: string;       // Cloudflare Workers
}

export interface AppSettings {
  providers: ProviderConfig[];
  activeModelKey: string; // Format: "${providerId}:${modelId}"
  languageModels?: Record<string, string>; // Format: { "es": "${providerId}:${modelId}" }
}

export interface LanguageConfig {
  name: string;
  nativeName?: string;
  code: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export enum AppStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}