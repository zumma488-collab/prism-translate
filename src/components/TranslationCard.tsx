import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TranslationResult, LanguageConfig } from '../types';

interface TranslationCardProps {
  data: TranslationResult;
  config: LanguageConfig;
  totalLanguages?: number; // Number of languages being translated
}

const COLLAPSE_THRESHOLD = 200; // Characters threshold for collapsing

const TranslationCard: React.FC<TranslationCardProps> = ({ data, config, totalLanguages = 1 }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only enable collapsing when multiple languages AND text is long
  const shouldEnableCollapse = totalLanguages > 1 && data.text.length > COLLAPSE_THRESHOLD;
  const isCollapsed = shouldEnableCollapse && !isExpanded;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.text);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(data.text);
      const voices = window.speechSynthesis.getVoices();
      const langVoice = voices.find(v => v.lang.startsWith(data.code));
      if (langVoice) utterance.voice = langVoice;
      utterance.lang = data.code;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="group relative flex bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden">
      {/* Left Color Bar */}
      <div
        className="w-1 sm:w-1.5 shrink-0 rounded-l-xl"
        style={{ backgroundColor: config.color }}
      />
      <div className="flex-1 p-3 sm:p-5">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground uppercase">
              {data.code}
            </span>
            <span className="font-semibold text-sm text-foreground">
              {data.language}
            </span>
          </div>
          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={t('translation.output.copy')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>content_copy</span>
            </button>
            <button
              onClick={handleSpeak}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={t('translation.output.listen')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>volume_up</span>
            </button>
          </div>
        </div>

        {/* Text Content with Collapse Logic */}
        <div className="relative">
          <p
            className={`text-base leading-relaxed text-foreground whitespace-pre-wrap ${isCollapsed ? 'line-clamp-6' : ''
              }`}
          >
            {data.text}
          </p>

          {/* Gradient Overlay when collapsed */}
          {isCollapsed && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          )}
        </div>

        {/* Expand/Collapse Button */}
        {shouldEnableCollapse && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
            {isExpanded ? t('translation.output.showLess') : t('translation.output.showMore')}
          </button>
        )}

        {(data.tone || data.confidence) && (
          <div className="mt-3 flex gap-2">
            {data.tone && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                {data.tone}
              </span>
            )}
            {data.confidence && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                {data.confidence}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationCard;