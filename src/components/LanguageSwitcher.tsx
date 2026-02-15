import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PortalDropdown from './ui/portal-dropdown';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <PortalDropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      className="w-44 rounded-xl shadow-xl overflow-hidden py-1"
      trigger={
        <button
          className="flex items-center justify-center size-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 cursor-pointer"
          title={t('header.language')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>language</span>
        </button>
      }
    >
      <div className="flex flex-col">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${i18n.language === lang.code ? 'bg-primary/5 dark:bg-primary/10' : ''
              }`}
          >
            <span className={`text-sm ${i18n.language === lang.code ? 'font-semibold text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
              {lang.nativeName}
            </span>
            {i18n.language === lang.code && (
              <span className="material-symbols-outlined text-[18px] ml-auto text-primary">
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
