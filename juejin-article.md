# 🚀 10天0手写代码！我用React 19 + Vercel AI SDK搞出了一个支持17+模型的翻译神器

> **TL;DR** - 这是一个完全由AI Agent协作开发的翻译Dashboard，从UI设计到代码实现到Bug修复，人类只负责提需求。项目开源，支持Google Gemini、OpenAI、DeepSeek、Kimi等17+ AI提供商，每种语言可独立选择模型。

## 一、项目展示

**Prism Translate** 是一个现代化的AI翻译Dashboard，核心特色：

- ✨ **17+ AI提供商**：Google Gemini、OpenAI、Anthropic、DeepSeek、智谱AI、Kimi、通义千问...
- 🎯 **按语言选模型**：英语用Claude、日语用Gemini、中文用DeepSeek，自由搭配
- ⚡ **渐进式显示**：不用等所有翻译完成，翻译好一个显示一个
- 🔐 **端到端加密**：API Key本地AES-GCM加密存储
- 🌍 **中英日三语言界面**

**在线体验**：[zumma488.github.io/prism-translate](https://zumma488.github.io/prism-translate)

![Dashboard](docs/images/dashboard-desktop.png)

## 二、AI协作开发全流程

### 2.1 项目背景：为什么要全AI开发？

事情是这样的 - 我想做一个支持多AI模型的翻译工具，但**不想写代码**。于是决定做一个实验：**从设计到开发到部署，全部由AI完成，我只负责提需求和验收**。

使用的AI工具：
- **UI设计**：Google Stitch（生成视觉稿和组件规范）
- **代码开发**：Claude Code + Google AI Studio
- **文档编写**：自动生成架构文档

### 2.2 开发时间线

```
Day 1: 需求 → UI设计稿（Stitch生成）
Day 2-3: 基础架构 → React 19 + Vite + Tailwind v4（Claude实现）
Day 4-5: AI接入 → Vercel AI SDK集成17家提供商
Day 6-7: 进阶功能 → 加密存储、i18n、配置导入导出
Day 8-10: 迭代优化 → v0.2.0按语言选择模型功能
```

**总计**：10天，50+次Git提交，约4000行代码，**零手工编码**。

## 三、技术架构揭秘

### 3.1 核心技术栈

```json
{
  "框架": "React 19.2.4 + TypeScript 5.8.2",
  "构建": "Vite 6.2.0",
  "样式": "Tailwind CSS v4 + shadcn/ui",
  "AI SDK": "Vercel AI SDK 6.0.71",
  "加密": "Web Crypto API (AES-GCM)"
}
```

### 3.2 多Provider系统设计

最大的挑战是如何统一封装17家不同的AI提供商。每家API格式、认证方式、模型命名都不一样。

我的解决方案是**Provider定义中心化**：

```typescript
// src/config/models.ts - 单一数据源
export const PROVIDER_DEFINITIONS: ProviderDefinition[] = [
  {
    id: 'google',
    name: 'Google Gemini',
    icon: 'token',
    defaultModel: 'gemini-2.0-flash',
    category: 'popular',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'explore',
    defaultModel: 'deepseek-chat',
    category: 'popular',
  },
  // ... 17+ providers
];
```

然后`llmService.ts`里统一封装：

```typescript
function createModel(provider: ProviderConfig, modelId: string): LanguageModel {
  switch (provider.type) {
    case 'google':
      return createGoogleGenerativeAI({ apiKey: provider.apiKey })(modelId);
    case 'openai':
    case 'custom':
      // OpenAI兼容模式，支持Kimi、通义千问等
      return createOpenAI({ baseURL: provider.baseUrl }).chat(modelId);
    // ...
  }
}
```

### 3.3 按语言选择模型的实现

v0.2.0新增的核心功能 - 每种目标语言可以用不同的AI模型。

数据结构设计：

```typescript
interface AppSettings {
  providers: ProviderConfig[];
  activeModelKey: string;           // 全局默认模型
  languageModels?: Record<string, string>; 
  // ^ { "日语": "google:gemini-2.0-flash", "英语": "anthropic:claude-3-5-sonnet" }
}
```

翻译时动态分组：

```typescript
const handleTranslate = async () => {
  // 按模型分组语言，减少API调用次数
  const modelGroups = new Map<string, string[]>();
  targetLanguages.forEach(lang => {
    const modelKey = settings.languageModels?.[lang] || settings.activeModelKey;
    if (!modelGroups.has(modelKey)) modelGroups.set(modelKey, []);
    modelGroups.get(modelKey)!.push(lang);
  });
  
  // 并行执行翻译
  const tasks = Array.from(modelGroups.entries()).map(async ([modelKey, langs]) => {
    // 调用对应模型...
  });
  
  await Promise.all(tasks);
};
```

### 3.4 渐进式翻译显示

用户反馈说等所有翻译完成太慢了，于是改成了**流式显示**：

```typescript
// 每个语言独立请求，完成一个显示一个
const translationTasks = targetLanguages.map(async (lang) => {
  const result = await translateText({ text, targetLanguages: [lang], ... });
  
  // 渐进更新 - 立即追加结果
  setTranslations(prev => {
    const newResults = [...prev, result];
    return newResults.sort((a, b) => 
      targetLanguages.indexOf(a.language) - targetLanguages.indexOf(b.language)
    );
  });
});
```

配合Skeleton动画，体验丝滑：

```tsx
{status === AppStatus.LOADING && targetLanguages.length > translations.length && (
  Array.from({ length: targetLanguages.length - translations.length }).map((_, i) => (
    <div key={`skeleton-${i}`} className="animate-pulse">
      <div className="h-4 w-20 bg-muted rounded mb-3"></div>
      <div className="h-5 w-3/4 bg-muted rounded"></div>
    </div>
  ))
)}
```

## 四、踩坑与解决实录

### 4.1 🔴 Bug：移动端Dialog不可见

**现象**：在手机上点击设置，Dialog弹不出来。

**排查**：调试发现是CSS问题。移动端浏览器对`position: fixed`子元素的百分比高度解析有问题。

**解决**：

```tsx
// 修改前：h-[90vh] - 在移动端不生效
// 修改后：使用显式定位
<DialogContent className="fixed top-0 left-0 right-0 bottom-0 h-full md:top-auto md:left-auto...">
  {/* 内容 */}
</DialogContent>
```

### 4.2 🔴 Bug：加密数据损坏导致应用崩溃

**现象**：用户反馈页面白屏，控制台显示解密失败。

**原因**：localStorage里的加密数据可能被其他程序篡改或损坏。

**解决**：增加错误处理和自动重置：

```typescript
try {
  const decrypted = await decrypt(v3Data);
  const parsed = JSON.parse(decrypted);
  setSettings(parsed);
} catch (err) {
  console.error('Decryption failed, resetting settings:', err);
  localStorage.removeItem(STORAGE_KEY_V3);  // 清除损坏数据
  setSettings(EMPTY_INITIAL_SETTINGS);      // 重置为默认
}
```

### 4.3 🔴 Bug：Web Crypto在非安全上下文失败

**现象**：用户通过局域网IP访问时，加密功能报错。

**原因**：Web Crypto API只在localhost/https环境下可用。

**解决**：降级方案，使用crypto-js：

```typescript
// 检测环境，自动选择加密方式
const isSecureContext = typeof window !== 'undefined' && 
  (window.isSecureContext || window.location.hostname === 'localhost');

export const encrypt = isSecureContext ? webCryptoEncrypt : cryptoJsEncrypt;
```

### 4.4 🔴 Bug：移动端返回按钮直接退出页面

**现象**：用户在设置页面点手机返回键，直接退出整个应用。

**解决**：拦截`popstate`事件，改为关闭Modal或返回上级：

```typescript
export function useBackButton(handler: () => boolean) {
  useEffect(() => {
    const handlePopState = () => {
      const shouldPreventDefault = handler();
      if (shouldPreventDefault) {
        window.history.pushState(null, '', window.location.href);
      }
    };
    
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handler]);
}
```

## 五、AI编程的经验与反思

### 5.1 AI擅长什么？

✅ **代码生成**：给定清晰的Prompt，生成的代码质量很高  
✅ **架构设计**：能提供合理的模块划分建议  
✅ **Bug修复**：给定错误信息，能快速定位问题  
✅ **文档编写**：自动生成的CLAUDE.md比我自己写的还详细  
✅ **重复劳动**：写17个Provider的配置，AI不会觉得枯燥

### 5.2 AI不擅长什么？

❌ **需求澄清**：需要你反复确认细节  
❌ **复杂调试**：涉及多个文件的问题，AI容易"头疼"  
❌ **审美判断**：UI细节还是需要人把关  
❌ **性能优化**：需要人告诉它"这里要优化"

### 5.3 给AI编程的建议

1. **Prompt要具体**：不要说"做个好看的下拉菜单"，要说"使用shadcn/ui的Select组件，支持搜索，暗黑模式适配"
2. **模块化提需求**：一次给一个功能点，不要一次给整个项目
3. **迭代式开发**：先跑通MVP，再逐步加功能
4. **代码审查**：AI生成的代码一定要review，特别是类型定义

## 六、项目数据

| 指标 | 数值 |
|------|------|
| 开发时间 | 10天 |
| 代码行数 | ~4,000行 |
| Git提交 | 50+ |
| AI提供商 | 17家 |
| shadcn/ui组件 | 17个 |
| 语言支持 | 中英日 |
| 版本迭代 | 3个 (v0.1.0 → v0.1.1 → v0.2.0) |

## 七、开源与贡献

项目已开源，欢迎Star和PR！

```bash
git clone https://github.com/zumma488/prism-translate.git
cd prism-translate
npm install
npm run dev
```

**GitHub**: [github.com/zumma488/prism-translate](https://github.com/zumma488/prism-translate)

---

## 总结

这次全AI开发的实验让我意识到：**AI不是替代程序员，而是超级加速器**。

以前做一个这样的项目可能需要1个月，现在10天就完成了。省下来的时间可以用来做更重要的事情 - 比如写这篇掘金文章 😄

如果你也在尝试AI编程，欢迎交流经验！

---

**如果这篇文章对你有帮助，别忘了点赞收藏~** 👍
