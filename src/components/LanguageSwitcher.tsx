import React from 'react';
import { useTranslation } from 'react-i18next';
import PortalDropdown from './ui/portal-dropdown';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <PortalDropdown>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
        title={t('header.language')}
      >
        <span className="material-symbols-outlined text-xl">language</span>
        <span className="text-sm font-medium hidden sm:inline">
          {currentLanguage.nativeName}
        </span>
      </button>

      <div className="flex flex-col min-w-[160px]">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors ${
              i18n.language === lang.code ? 'bg-muted/30 font-medium' : ''
            }`}
          >
            <span className="text-sm">{lang.nativeName}</span>
            {i18n.language === lang.code && (
              <span className="material-symbols-outlined text-sm ml-auto text-primary">
                check
              </span>
            )}
          </button>
        ))}
      </div>
    </PortalDropdown>
  );
};

export default LanguageSwitcher;
