<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ZUaTT-oiv0_QofPIzWlLgpvnWC-k1FG2

## 技术栈 (Tech Stack)

- **框架**: React 19 + TypeScript + Vite
- **样式**: Tailwind CSS v4
- **UI 组件**: shadcn/ui
- **AI 集成**: Vercel AI SDK + Google Gemini + OpenAI
- **部署**: Vercel (Serverless Functions)

### AI Skills 参考

开发此项目时使用了以下 AI Skills（通用配置，无需随项目同步）：

| Skill                | 用途                              |
| -------------------- | --------------------------------- |
| `shadcn-ui`          | shadcn/ui 组件库安装和使用指南    |
| `tailwind-v4-shadcn` | Tailwind v4 与 shadcn/ui 集成配置 |
| `ai-sdk`             | Vercel AI SDK 使用指南            |
| `ui-ux-pro-max`      | UI/UX 设计规范和最佳实践          |

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. (Optional) Set the `GEMINI_API_KEY` in [.env.local](.env.local) if using cloud providers. For local models (Ollama), this is skipped.
3. Run the app:
   `npm run dev`
