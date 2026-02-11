import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_CONFIGS } from '../constants';
import { AppStatus } from '../types';
import PortalDropdown from './ui/portal-dropdown';

interface TranslationInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  targetLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  onTranslate: () => void;
  status: AppStatus;
  autoFocus?: boolean;
}

const TranslationInput: React.FC<TranslationInputProps> = ({
  inputText,
  onInputChange,
  targetLanguages,
  onLanguagesChange,
  onTranslate,
  status,
  autoFocus = true,
}) => {
  const { t } = useTranslation();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState(400);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate max height based on viewport
  useEffect(() => {
    const calculateMaxHeight = () => {
      const headerHeight = 73; // Header height with border (py-4 = 32px + border)
      const verticalPadding = 48; // 24px top + 24px bottom (p-6)
      const toolbarHeight = 100; // Approximate toolbar height
      const spacing = 20; // Extra spacing for safety
      const viewportHeight = window.innerHeight;
      const calculatedMaxHeight = viewportHeight - headerHeight - verticalPadding - toolbarHeight - spacing;
      setMaxHeight(Math.max(200, calculatedMaxHeight)); // Ensure at least 200px
    };

    calculateMaxHeight();
    window.addEventListener('resize', calculateMaxHeight);
    return () => window.removeEventListener('resize', calculateMaxHeight);
  }, []);

  // Focus input on mount
  useEffect(() => {
    if (autoFocus) {
      textAreaRef.current?.focus();
    }
  }, [autoFocus]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textAreaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight to fit content, with max height limit
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputText, maxHeight]);

  const toggleLanguage = (langName: string) => {
    const newLanguages = targetLanguages.includes(langName)
      ? targetLanguages.filter(l => l !== langName)
      : [...targetLanguages, langName];
    onLanguagesChange(newLanguages);
  };

  const getAvailableLanguages = () => {
    return Object.keys(LANGUAGE_CONFIGS).filter(l => !targetLanguages.includes(l));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to translate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (inputText.trim() && targetLanguages.length > 0 && status !== AppStatus.LOADING) {
        onTranslate();
      }
    }
  };

  return (
    <div className="flex flex-col w-full md:w-1/2 h-full bg-background p-6 md:pr-4 overflow-y-auto">
      <div className="flex flex-col bg-card rounded-xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all duration-200">
        <div className="relative">
          <textarea
            ref={textAreaRef}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-5 md:p-6 resize-none bg-transparent border-none outline-none text-base md:text-lg leading-relaxed placeholder:text-muted-foreground/50 text-foreground overflow-y-auto"
            placeholder={t('translation.input.placeholder')}
            maxLength={5000}
            rows={1}
            style={{ minHeight: '200px', maxHeight: `${maxHeight}px` }}
          />
        </div>

        {/* Toolbar - Optimized Layout */}
        <div className="p-3 bg-muted/50 border-t border-border rounded-b-xl flex flex-col gap-2">
          {/* Row 1: Source + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>language</span>
              <span className="font-medium">{t('translation.input.autoDetect')}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              <span className="text-foreground font-medium">{t('translation.input.languages', { count: targetLanguages.length })}</span>
              <span className="mx-1.5 text-border">|</span>
              <span className="text-xs">{t('translation.input.charCount', { count: inputText.length })}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Add Language Dropdown - Hidden when no languages available */}
              {getAvailableLanguages().length > 0 && (
                <PortalDropdown
                  open={isLanguageDropdownOpen}
                  onOpenChange={setIsLanguageDropdownOpen}
                  placement="top-end"
                  disabled={status === AppStatus.LOADING}
                  className="w-52 rounded-lg py-1"
                  trigger={
                    <button
                      disabled={status === AppStatus.LOADING}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-1.5 ${status === AppStatus.LOADING ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={t('translation.input.addLanguage')}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                      <span>{t('translation.input.add')}</span>
                    </button>
                  }
                >
                  <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
                    {t('translation.input.addLanguage')}
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {getAvailableLanguages().map(lang => {
                      const config = LANGUAGE_CONFIGS[lang];
                      return (
                        <button
                          key={lang}
                          onClick={() => {
                            toggleLanguage(lang);
                            setIsLanguageDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                        >
                          <span
                            className="size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: config?.color }}
                          />
                          <span className="font-medium text-xs">{config?.nativeName || lang}</span>
                          <span className="text-muted-foreground text-[10px] ml-auto">{lang}</span>
                        </button>
                      );
                    })}
                  </div>
                </PortalDropdown>
              )}

              {/* Translate Button */}
              <button
                onClick={onTranslate}
                disabled={status === AppStatus.LOADING || !inputText.trim() || targetLanguages.length === 0}
                className={`flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-sm font-medium transition-all transform active:scale-[0.98] ${(status === AppStatus.LOADING || !inputText.trim() || targetLanguages.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                title={targetLanguages.length === 0 ? t('translation.input.selectLanguageWarning') : t('translation.input.translateHotkey')}
              >
                <span className={`material-symbols-outlined ${status === AppStatus.LOADING ? 'animate-spin' : ''}`} style={{ fontSize: '16px' }}>
                  {status === AppStatus.LOADING ? 'progress_activity' : 'send'}
                </span>
                <span>{status === AppStatus.LOADING ? t('translation.input.translating') : t('translation.input.translate')}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Target Languages */}
          <div className="flex items-center flex-wrap gap-1.5">
            {targetLanguages.map(lang => {
              const config = LANGUAGE_CONFIGS[lang];
              return (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  disabled={status === AppStatus.LOADING}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 hover:opacity-80 ${status === AppStatus.LOADING ? 'cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: config?.color || '#64748b', color: '#fff' }}
                  title={status === AppStatus.LOADING ? t('translation.input.cannotRemoveLanguage') : t('translation.input.removeLanguage', { lang })}
                >
                  <span>{config?.nativeName || lang}</span>
                  <span className="material-symbols-outlined text-[10px] opacity-70">close</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationInput;
