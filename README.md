# AI Translator Dashboard

<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<p align="center">
  <em>A collaborative creation, fully developed by <b>AI Agents</b>.</em><br/>
  <em>Co-developed by <b>Google Stitch</b>, <b>Google AI Studio</b>, and <b>Antigravity</b>.</em>
</p>

<p align="center">
  <a href="./README.zh.md">简体中文</a> | <b>English</b>
</p>

A modern AI-powered translation dashboard built with React 19, TypeScript, and the Vercel AI SDK. This project integrates multiple AI providers (Google Gemini, OpenAI, etc.) to deliver high-quality translations in a sleek, responsive interface.

<p align="center">
  <a href="https://zumma488.github.io/prism-translate/"><b>Live Demo</b></a>
</p>

## ✨ Features

- **Multi-Model Translation Comparison**: Select multiple AI models per language and compare translations side-by-side in a clean vertical layout.
- **Per-Language Model Selection**: Customize AI models for each target language independently, optimizing translation quality for different language pairs.
- **Custom Base URL Support**: Configure custom Base URLs for any AI API provider, offering ultimate flexibility for proxy routing and custom enterprise endpoints.
- **Multi-Model Support**: Seamlessly switch between Google Gemini, OpenAI, and other providers via Vercel AI SDK.
- **Modern UI/UX**: Built with `shadcn/ui` and Tailwind CSS v4 for a premium, responsive design.
- **Micro-Animations**: Enhanced user experience with `tw-animate-css`.
- **Type-Safe**: Full TypeScript support for robust development.
- **Global i18n Support**: UI available in 12 languages — Arabic, English, Spanish, Japanese, Korean, Burmese, Portuguese, Russian, Turkish, Vietnamese, Simplified Chinese, and Traditional Chinese.

## 📸 Screenshots

### Dashboard

![Dashboard Desktop](docs/images/dashboard-desktop.png)

### Mobile & Responsive

<p align="center">
  <img src="docs/images/dashboard-mobile.png" width="300" alt="Mobile View" />
</p>

### Model Management

|                  Connection                  |              Custom Provider               |             Model Selection              |
| :------------------------------------------: | :----------------------------------------: | :--------------------------------------: |
| ![Connect](docs/images/connect-provider.png) | ![Custom](docs/images/custom-provider.png) | ![Manage](docs/images/manage-models.png) |

## 🌍 Supported Languages

| Language | Code | Native Name |
|----------|------|-------------|
| Arabic | `ar` | العربية |
| English | `en` | English |
| Spanish | `es` | Español |
| Japanese | `ja` | 日本語 |
| Korean | `ko` | 한국어 |
| Burmese | `my` | မြန်မာ |
| Portuguese | `pt` | Português |
| Russian | `ru` | Русский |
| Turkish | `tr` | Türkçe |
| Vietnamese | `vi` | Tiếng Việt |
| Chinese (Simplified) | `zh` | 简体中文 |
| Chinese (Traditional) | `zh-TW` | 繁體中文 |

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **AI Integration**: Vercel AI SDK + Google Gemini + OpenAI
- **Deployment**: Vercel

### AI Skills Reference

The following AI Skills were used during development (general configuration, no need to sync with project):

| Skill                | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `shadcn-ui`          | shadcn/ui component library installation and usage guide |
| `tailwind-v4-shadcn` | Tailwind v4 and shadcn/ui integration configuration |
| `ai-sdk`             | Vercel AI SDK usage guide                  |
| `ui-ux-pro-max`      | UI/UX design specifications and best practices |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zumma488/prism-translate.git
   cd prism-translate
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables (Optional):
   Copy `.env.example` to `.env.local` if you plan to use cloud providers (Google Gemini, OpenAI, etc.).

   ```bash
   cp .env.example .env.local
   ```

   Add your keys:

   ```env
   GEMINI_API_KEY=your_api_key_here
   # Add other provider keys as needed
   ```

   > **Note**: For local models (like Ollama), API keys are not required.

4. Run the development server:

   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

**zumma488**

- GitHub: [@zumma488](https://github.com/zumma488)
