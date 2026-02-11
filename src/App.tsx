import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import TranslationCard from './components/TranslationCard';
import TranslationInput from './components/TranslationInput';
import { translateText } from './services/llmService';
import { LANGUAGE_CONFIGS, DEFAULT_LANGUAGES } from './constants';
import { AppSettings, TranslationResult, AppStatus, ProviderConfig } from './types';
import { encrypt, decrypt, isEncrypted } from './services/crypto';

const STORAGE_KEY_V3 = 'ai-translator-settings-v3';
const STORAGE_KEY_V2 = 'ai-translator-settings-v2';

const EMPTY_INITIAL_SETTINGS: AppSettings = {
  activeModelKey: '',
  providers: []
};

const App: React.FC = () => {
  const { t } = useTranslation();

  // Application State
  const [inputText, setInputText] = useState('');
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const settingsInitialized = useRef(false);

  // Target Languages State (Persisted)
  const [targetLanguages, setTargetLanguages] = useState<string[]>(() => {
    const saved = localStorage.getItem('ai-translator-target-languages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse target languages", e);
      }
    }
    return DEFAULT_LANGUAGES;
  });

  // Settings State (async encrypted persistence)
  const [settings, setSettings] = useState<AppSettings>(EMPTY_INITIAL_SETTINGS);

  // Async load encrypted settings on mount (with v2 → v3 migration)
  useEffect(() => {
    async function loadSettings() {
      try {
        // Try v3 (encrypted) first
        const v3Data = localStorage.getItem(STORAGE_KEY_V3);
        if (v3Data) {
          if (isEncrypted(v3Data)) {
            const decrypted = await decrypt(v3Data);
            setSettings(JSON.parse(decrypted));
          } else {
            // Fallback: v3 key exists but not encrypted (shouldn't happen)
            setSettings(JSON.parse(v3Data));
          }
          setSettingsLoaded(true);
          return;
        }

        // Migrate from v2 (plaintext) to v3 (encrypted)
        const v2Data = localStorage.getItem(STORAGE_KEY_V2);
        if (v2Data) {
          try {
            const parsed = JSON.parse(v2Data);
            setSettings(parsed);
            // Encrypt and save to v3
            const encrypted = await encrypt(JSON.stringify(parsed));
            localStorage.setItem(STORAGE_KEY_V3, encrypted);
            // Remove old v2 key
            localStorage.removeItem(STORAGE_KEY_V2);
          } catch (e) {
            console.error('Failed to migrate v2 settings', e);
          }
        }
      } catch (e) {
        console.error('Failed to load encrypted settings', e);
      } finally {
        setSettingsLoaded(true);
      }
    }

    loadSettings();
  }, []);

  // Persist settings (encrypted) whenever they change
  useEffect(() => {
    // Skip the initial render and wait for settings to be loaded
    if (!settingsLoaded) return;
    if (!settingsInitialized.current) {
      settingsInitialized.current = true;
      return;
    }

    async function saveSettings() {
      try {
        const encrypted = await encrypt(JSON.stringify(settings));
        localStorage.setItem(STORAGE_KEY_V3, encrypted);
      } catch (e) {
        console.error('Failed to encrypt and save settings', e);
      }
    }
    saveSettings();
  }, [settings, settingsLoaded]);

  // Persist target languages
  useEffect(() => {
    localStorage.setItem('ai-translator-target-languages', JSON.stringify(targetLanguages));
  }, [targetLanguages]);

  // Use a derived list of enabled models for the dropdown
  const getEnabledModels = () => {
    const allModels: { provider: ProviderConfig, modelId: string, modelName: string, uniqueId: string }[] = [];
    settings.providers.forEach(p => {
      p.models.forEach(m => {
        if (m.enabled !== false) {
          allModels.push({
            provider: p,
            modelId: m.id,
            modelName: m.name,
            uniqueId: `${p.id}:${m.id}`
          });
        }
      });
    });
    return allModels;
  };

  const activeModelMeta = () => {
    const all = getEnabledModels();
    return all.find(m => m.uniqueId === settings.activeModelKey) || all[0];
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    const currentMeta = activeModelMeta();
    if (!currentMeta) {
      setIsSettingsOpen(true);
      return;
    }

    setStatus(AppStatus.LOADING);
    setTranslations([]); // Clear previous

    try {
      const results = await translateText({
        text: inputText,
        targetLanguages,
        provider: currentMeta.provider,
        modelId: currentMeta.modelId
      });
      setTranslations(results);
      setStatus(AppStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      alert(t('errors.translationFailed', { error: error instanceof Error ? error.message : t('errors.unknown') }));
    }
  };

  const getLanguageConfig = (langName: string, langCode: string) => {
    if (LANGUAGE_CONFIGS[langName]) return LANGUAGE_CONFIGS[langName];
    const found = Object.values(LANGUAGE_CONFIGS).find(c => c.code === langCode);
    if (found) return found;
    return {
      name: langName,
      code: langCode,
      color: '#64748b',
      bgColor: '#f1f5f9',
      borderColor: '#e2e8f0',
    };
  };

  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // Don't close setup immediately if no models? No, assume user knows.
    // Ensure active model is valid
    const all = [];
    newSettings.providers.forEach(p => p.models.forEach(m => {
      if (m.enabled !== false) all.push(`${p.id}:${m.id}`);
    }));

    if (!all.includes(newSettings.activeModelKey) && all.length > 0) {
      setSettings(s => ({ ...s, activeModelKey: all[0] }));
    }
  };

  const handleModelSelect = (uniqueId: string) => {
    setSettings(prev => ({ ...prev, activeModelKey: uniqueId }));
  };

  const enabledModels = getEnabledModels();
  const currentModel = activeModelMeta();

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden md:overflow-hidden">
      <Header
        enabledModels={enabledModels}
        currentModel={currentModel}
        activeModelKey={settings.activeModelKey}
        onModelSelect={handleModelSelect}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden md:overflow-hidden overflow-y-auto relative w-full max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row h-auto md:h-full">

          {/* LEFT: Input Area */}
          <TranslationInput
            inputText={inputText}
            onInputChange={setInputText}
            targetLanguages={targetLanguages}
            onLanguagesChange={setTargetLanguages}
            onTranslate={handleTranslate}
            status={status}
          />

          {/* RIGHT: Output Area */}
          <div className="flex flex-col w-full md:w-1/2 md:h-full bg-background p-3 sm:p-6 md:pl-4 md:overflow-y-auto">
            <div className="flex flex-col gap-3 sm:gap-4 pb-6 md:pb-20">

              {status === AppStatus.IDLE && translations.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 sm:h-64 text-muted-foreground">
                  <div className="size-12 sm:size-16 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">translate</span>
                  </div>
                  <p className="text-sm font-medium">{t('translation.output.emptyTitle')}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{t('translation.output.emptySubtitle')}</p>
                </div>
              )}

              {translations.map((result, idx) => (
                <TranslationCard
                  key={idx}
                  data={result}
                  config={getLanguageConfig(result.language, result.code)}
                  totalLanguages={translations.length}
                />
              ))}



              {/* Placeholder skeletons while loading */}
              {status === AppStatus.LOADING && (
                <>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card rounded-xl p-3 sm:p-5 border border-border animate-pulse">
                      <div className="h-4 w-20 bg-muted rounded mb-3"></div>
                      <div className="h-5 w-3/4 bg-muted rounded mb-2"></div>
                      <div className="h-5 w-1/2 bg-muted rounded"></div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSave={handleSettingsSave}
      />
    </div>
  );
};

export default App;