# Changelog

All notable changes to the Prism Translate project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-02-24

### Added

- **Global i18n Support (12 Languages)**: Expanded UI language support from 3 to 12 languages for truly global accessibility:
  - Arabic (ar), Spanish (es), Korean (ko), Burmese (my), Portuguese (pt)
  - Russian (ru), Turkish (tr), Vietnamese (vi), Traditional Chinese (zh-TW)
  - Existing: English (en), Simplified Chinese (zh), Japanese (ja)
- **Enhanced Language Switcher**: Language selection dropdown now displays all 12 supported languages with native script names.

## [0.2.1] - 2026-02-17

### Added

- **Custom Base URL Support**: All AI providers now support adding a custom Base URL in the settings (`EditProviderView`), providing more flexibility for API routing.
- **Multi-Model Translation**: Each target language can now select multiple AI models simultaneously. Results are displayed side-by-side for easy comparison.
- **TranslationGroup Component**: New component for grouping and displaying multiple translation results per language in a vertical list layout.
- **Translation Visibility Toggle**: Added an eye icon button to collapse/expand individual translation results, saving screen space.
- **Shared Language Header**: Language code and name are displayed once at the top of each translation group, eliminating redundancy.

### Changed

- **UI Layout Refactoring**:
  - Relocated the toolbar in `TranslationCard` to the top of the translation content, preventing action buttons (copy, play, settings) from overlaying long translations.
  - Moved the settings button in `Header` to be adjacent to the model selector, and updated its icon to `tune` for better UX grouping.
- **Translation Rendering Mechanics**: Introduced an `expectedCount` prop to `TranslationGroup` for predictive rendering. Layout shifts during the progressive loading phase of multi-model translations are eliminated, offering a smoother reading experience.
- **Multi-Select Model Popover**: `ModelSelectorPopover` now supports checkbox-based multi-selection instead of single radio selection.
- **Data Type Migration**: `AppSettings.languageModels` upgraded from `Record<string, string>` to `Record<string, string[]>` to support multiple models per language. Automatic migration from old format is included.
- **Translation Flow**: `handleTranslate()` now creates independent parallel requests for each `(language, model)` pair with progressive result display.
- **Collapsible Long Translations**: `TranslationCard` now automatically collapses translations longer than 200 characters when multiple languages are being translated, with smooth expand/collapse controls for better readability.

### Improved

- **Provider Connection UX**: Streamlined the connection and editing interface for a better user experience when managing custom provider settings.
- **Result Comparison**: Vertical list layout enables direct comparison of translations from different models without tab switching.
- **Screen Space Efficiency**: Visibility toggle and shared headers reduce visual clutter when comparing multiple translations.

### Fixed

- Added `cursor-pointer` to Dialog close buttons across the app for consistent UX.
- Added missing `autoDetect` translation key in the Chinese locale.

## [0.2.0] - 2026-02-15

### Added

- **Per-Language Model Customization**: Each target language can now use a different AI model for translation, enabling optimal model selection per language pair.
- **Progressive Translation Display**: Translation results now appear incrementally as each language completes, rather than waiting for all translations to finish. Skeleton loaders dynamically adjust based on remaining translations.
- **Model Selector Popover**: Introduced a new interactive UI component for selecting AI models on a per-language basis.
- **Model Info Display**: Translation cards now display the current model being used for each language.
- **Enhanced shadcn/ui Integration**: Added new components for improved UI consistency:
  - Command palette component
  - Dropdown menu component
  - Popover component
  - Scroll area component
  - Select component
  - Sheet component
  - Tabs component
  - Textarea component
  - Tooltip component

### Changed

- **UI Component Migration**: Migrated all major UI components to shadcn/ui for better consistency, accessibility, and maintainability.
  - Refactored `Header` component with shadcn/ui primitives
  - Refactored `LanguageSwitcher` component with improved interactions
  - Completely rebuilt `ModelSelectorPopover` with new per-language model selection
  - Enhanced `TranslationCard` component with model info display
  - Improved `TranslationInput` component with refined language chips
- **Removed Legacy Components**: Deprecated custom `portal-dropdown` component in favor of shadcn/ui alternatives.

### Improved

- **Interaction Design**: Added cursor-pointer styling to all clickable elements for better user experience and accessibility.
- **Language Chips**: Refined visual design and interaction feedback for language selection chips.
- **Type Safety**: Enhanced TypeScript type definitions for better development experience.

## [0.1.1] - 2026-02-11

### CI/CD

- **GitHub Pages**: Added workflow configuration for automated deployment to GitHub Pages.
- **Build**: Configured build settings to support static site generation.

### Documentation

- **i18n**: Fully translated `README.zh.md` to Chinese for better accessibility.
- **Updates**: Updated repository URLs and removed legacy links.
- **Clarification**: Added notes about optional API keys for local models.

### Improved

- **Mobile UX**: Enhanced navigation in Settings Modal. Pressing the back button on mobile now closes the modal or navigates back one level instead of closing the page.
- **Robustness**: Improved error handling for encrypted settings. Corrupted data now triggers an automatic reset instead of crashing the app.
- **UI**: Optimized dropdown positioning algorithm. Menus now automatically adjust to stay within the viewport, fixing overflow issues on small screens.
- **Compatibility**: Improved compatibility for mobile browsers and non-secure contexts (HTTP).

### Fixed

- Fixed an issue where the Settings Modal would flicker or close unexpectedly when switching views on mobile.
- Fixed a potential crash loop caused by decryption failures in `localStorage`.
- Fixed Model Selector dropdown overflowing off-screen on mobile devices.
- Fixed dialog visibility issues on mobile devices.

## [0.1.0] - 2026-02-05

### Added

- Initial release
- Support for multiple AI providers (Google Gemini, OpenAI-compatible APIs, etc.)
- Modern translation interface
- Model configuration and management features
- Built with React 19, TypeScript, and Vercel AI SDK
- Integrated Tailwind CSS v4 and Shadcn UI components
- Support for various AI SDK providers:
  - Anthropic
  - Cerebras
  - Cohere
  - DeepInfra
  - DeepSeek
  - Fireworks
  - Google
  - Groq
  - Mistral
  - OpenAI
  - Perplexity
  - TogetherAI
  - xAI
  - OpenRouter
  - Ollama
  - Workers AI
  - Zhipu AI

### Tech Stack

- React 19.2.4
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS 4.1.18
- Vercel AI SDK 6.0.71

---

[0.2.2]: https://github.com/zumma488/prism-translate/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/zumma488/prism-translate/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/zumma488/prism-translate/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/zumma488/prism-translate/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/zumma488/prism-translate/releases/tag/v0.1.0
