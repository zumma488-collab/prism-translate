# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered translation dashboard built with React 19, TypeScript, and Vercel AI SDK. Integrates 17+ AI providers (Google Gemini, OpenAI, Anthropic, DeepSeek, etc.) for multi-language translation.

## Commands

### Development
```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run build:gh     # GitHub Pages build (includes TypeScript check)
npm run preview      # Preview production build
npm run lint         # Type check with TypeScript
```

## Architecture

### Multi-Provider System

The app uses a flexible provider system defined in `src/config/models.ts`:

- **PROVIDER_DEFINITIONS**: Single source of truth for all provider configurations
- **Categories**: `popular`, `native`, `community`, `compatible`
- **Architecture**: Client-side SPA (Static) deployed on Vercel. No backend/serverless functions.
- Each provider has `id`, `name`, `icon`, `defaultModel`, and `defaultModels` list
- Supports 17+ providers including native SDK providers and OpenAI-compatible APIs

### Settings & Encryption

Settings are stored encrypted in localStorage using Web Crypto API:

- **Storage key**: `ai-translator-settings-v3` (encrypted)
- **Format**: `{ providers: ProviderConfig[], activeModelKey: string }`
- **Active model key format**: `${providerId}:${modelId}` (e.g., `google-uuid:gemini-2.0-flash`)
- **Encryption**: `src/services/crypto.ts` handles encrypt/decrypt using AES-GCM
- **Migration**: Automatic v2→v3 migration (plaintext to encrypted) on first load

### Per-Language Multi-Model Translation (v0.2.1+)

The app supports selecting **multiple AI models** for each target language:

- **Settings Storage**: `AppSettings.languageModels` - `Record<string, string[]>`
  - Key: Language name (e.g., "Spanish", "Japanese")
  - Value: Array of model unique IDs in format `${providerId}:${modelId}`
  - If not set for a language, uses global `activeModelKey`

- **Translation Flow**:
  1. Builds a flat list of `(language, model)` task pairs
  2. Executes independent parallel translation requests for each pair
  3. Results appear progressively as each translation completes
  4. Results sorted by language order, then by model order within same language

- **UI Components**:
  - `ModelSelectorPopover.tsx`: Per-language multi-model selection popover (checkbox-based)
  - `TranslationGroup.tsx`: Groups multiple results per language with shared header
  - Integrated into `TranslationInput.tsx` language chips
  - Model info displayed on `TranslationCard.tsx` and `TranslationGroup.tsx` footer

- **Data Flow**:
  ```typescript
  // In App.tsx handleTranslate()
  const tasks: { lang: string; modelKey: string }[] = [];
  targetLanguages.forEach(lang => {
    const langModelKeys = settings.languageModels?.[lang];
    if (langModelKeys && langModelKeys.length > 0) {
      langModelKeys.forEach(key => tasks.push({ lang, modelKey: key }));
    } else {
      tasks.push({ lang, modelKey: settings.activeModelKey });
    }
  });
  ```

### LLM Service Architecture

`src/services/llmService.ts` handles all AI provider integrations:

1. **Provider Type Detection**:
   - Native SDK providers (Google, Anthropic, Mistral, etc.) use direct SDK calls
   - OpenAI/Custom providers use auto-detection with fallback

2. **OpenAI-Compatible API Auto-Detection**:
   - First tries `.chat()` format (most compatible with third-party APIs)
   - Falls back to default OpenAI Responses API if needed
   - Caches successful format per provider for faster subsequent calls

3. **Translation Flow**:
   - Takes input text and target languages
   - Uses system prompt requesting JSON response format
   - Returns `TranslationResult[]` with language, code, text, tone, confidence

4. **Progressive Display** (v0.2.0+):
   - Each language is translated independently (single-language requests)
   - Results appear incrementally as each translation completes
   - Skeleton loaders dynamically adjust based on remaining translations
   - Individual language failures don't block other translations

### Component Structure

**Main Components:**
- `App.tsx`: Main app component with state management and settings persistence
- `components/Header.tsx`: Top bar with global model selector and settings button
- `components/TranslationInput.tsx`: Left panel for input text and language selection with per-language model chips
- `components/TranslationCard.tsx`: Right panel output cards showing translations with model info
- `components/TranslationGroup.tsx`: **[NEW v0.2.1]** Groups multiple translation results per language with shared header, vertical list layout, and visibility toggle
- `components/SettingsModal.tsx`: Settings dialog with provider management
- `components/LanguageSwitcher.tsx`: Language selection dropdown (shadcn/ui based)
- `components/ModelSelectorPopover.tsx`: **[v0.2.0]** Per-language multi-model selection popover (checkbox-based)

**Settings Sub-Views:**
- `components/settings/ConnectProviderView.tsx`: Add new provider wizard
- `components/settings/EditProviderView.tsx`: Edit provider config and API keys
- `components/settings/ManageModelsView.tsx`: Enable/disable models per provider

**UI Components (shadcn/ui):**
- 17 shadcn/ui components in `components/ui/` including:
  - Command, Popover, Dialog, Sheet, Tabs, Select, Dropdown Menu
  - Button, Input, Label, Card, Separator, Skeleton, Switch, Textarea, Tooltip, Scroll Area

### Type System

`src/types.ts` defines core interfaces:

- `ProviderConfig`: Provider instance with id, type, apiKey, baseUrl, models[]
- `ModelDefinition`: Individual model with id, name, enabled flag
- `AppSettings`: Top-level settings with:
  - `providers[]`: Array of ProviderConfig instances
  - `activeModelKey`: Global default model (format: `${providerId}:${modelId}`)
  - `languageModels?`: **[v0.2.1]** Per-language multi-model overrides (`Record<string, string[]>`)
- `TranslationResult`: Translation output with language, code, text, tone, confidence, modelName, providerName
- `ModelProvider`: Union type of all supported provider types

## Important Implementation Notes

### Adding a New Provider

1. Add provider definition to `PROVIDER_DEFINITIONS` in `src/config/models.ts`
2. Add case to `createModel()` function in `src/services/llmService.ts`
3. Import the provider's SDK package (e.g., `@ai-sdk/newprovider`)
4. For OpenAI-compatible APIs, use `custom` type with `baseUrl`

### Settings Persistence

- Settings load asynchronously on mount via `useEffect`
- Settings save automatically when changed (after initial load)
- Use `settingsLoaded` flag to prevent premature saves
- Always encrypt before saving to localStorage

### Model Selection Logic

- `getEnabledModels()`: Returns all enabled models across all providers
- `activeModelMeta()`: Finds currently active model from activeModelKey
- If active model becomes invalid (disabled/deleted), auto-select first enabled model

### Using Per-Language Multi-Model Translation (v0.2.1+)

To assign multiple models to a specific language:

1. User clicks the settings icon on a language chip in `TranslationInput`
2. `ModelSelectorPopover` opens with all enabled models (checkbox-based)
3. User selects one or more models, or clicks "Reset to Global" to use default
4. Selection stored in `settings.languageModels[languageName]` as `string[]`
5. During translation, each (language, model) pair fires an independent request
6. Results displayed in `TranslationGroup` with shared language header

**Implementation Details:**
- Language chips show a badge with the count of selected models
- `TranslationGroup` displays results vertically for easy comparison
- Each result has copy, speak, and visibility toggle buttons
- Visibility toggle collapses/expands individual translations to save space
- Shared language header (code + name) shown once per language group

### Vite Configuration

- Base path: `/prism-translate/` for GitHub Pages, `/` for regular deployment
- Uses `GITHUB_PAGES=true` env var to switch base paths
- Aliases `@` to `src/` directory for cleaner imports
- Dev server runs on port 3000 with host `0.0.0.0`

## File Organization

```
src/
├── App.tsx                    # Main application component
├── main.tsx                   # Entry point
├── types.ts                   # TypeScript type definitions
├── constants.ts               # Language configs and defaults
├── components/
│   ├── Header.tsx             # Top navigation with model selector
│   ├── TranslationInput.tsx   # Left panel input area with language chips
│   ├── TranslationCard.tsx    # Right panel output cards with model info
│   ├── TranslationGroup.tsx   # [NEW v0.2.1] Multi-model result grouping
│   ├── SettingsModal.tsx      # Settings dialog
│   ├── LanguageSwitcher.tsx   # Language selection dropdown
│   ├── ModelSelectorPopover.tsx  # Per-language multi-model selector
│   ├── settings/              # Settings sub-views
│   └── ui/                    # shadcn/ui components (17 components)
├── services/
│   ├── llmService.ts          # AI provider integration
│   ├── crypto.ts              # Encryption utilities
│   └── configIO.ts            # Import/export config
├── config/
│   └── models.ts              # Provider definitions (single source of truth)
├── i18n/
│   ├── index.ts               # i18next configuration
│   └── locales/               # Translation files (en, zh, ja)
├── hooks/                     # Custom React hooks
└── lib/
    └── utils.ts               # Utility functions
```

## Security Notes

- All API keys stored encrypted using Web Crypto API (AES-GCM)
- Encryption key derived from user's device-specific data
- Never commit `.env.local` or expose API keys in code
- Provider configs with API keys only stored in localStorage (encrypted)
