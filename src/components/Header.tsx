import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProviderConfig } from '../types';
import PortalDropdown from './ui/portal-dropdown';
import LanguageSwitcher from './LanguageSwitcher';

interface ModelItem {
  provider: ProviderConfig;
  modelId: string;
  modelName: string;
  uniqueId: string;
}

interface HeaderProps {
  enabledModels: ModelItem[];
  currentModel?: ModelItem;
  activeModelKey: string;
  onModelSelect: (uniqueId: string) => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({
  enabledModels,
  currentModel,
  activeModelKey,
  onModelSelect,
  onOpenSettings,
}) => {
  const { t } = useTranslation();
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const handleModelClick = (uniqueId: string) => {
    onModelSelect(uniqueId);
    setIsModelDropdownOpen(false);
  };

  const handleManageClick = () => {
    onOpenSettings();
    setIsModelDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>translate</span>
        </div>
        <h1 className="text-lg font-semibold tracking-tight">{t('header.title')}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <PortalDropdown
            open={isModelDropdownOpen}
            onOpenChange={setIsModelDropdownOpen}
            placement="bottom-end"
            className="w-72 rounded-xl shadow-xl overflow-hidden py-2"
            trigger={
              <button
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-semibold min-w-[160px] justify-between"
                title={t('header.changeModel')}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>neurology</span>
                  <span className="truncate max-w-[120px]">
                    {currentModel ? currentModel.modelName : t('header.selectModel')}
                  </span>
                </div>
                <span className={`material-symbols-outlined text-gray-500 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} style={{ fontSize: '20px' }}>expand_more</span>
              </button>
            }
          >
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex justify-between items-center">
              <span>{t('header.selectModel')}</span>
              <button
                onClick={handleManageClick}
                className="text-primary hover:underline text-xs"
              >
                {t('header.manage')}
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {enabledModels.map(item => (
                <button
                  key={item.uniqueId}
                  onClick={() => handleModelClick(item.uniqueId)}
                  className={`w-full text-left px-4 py-3 text-sm flex flex-col justify-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0 ${activeModelKey === item.uniqueId ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-medium ${activeModelKey === item.uniqueId ? 'text-primary' : 'text-gray-800 dark:text-gray-200'}`}>
                      {item.modelName}
                    </span>
                    {activeModelKey === item.uniqueId && <span className="material-symbols-outlined text-primary text-[18px]">check</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
                      {item.provider.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {enabledModels.length === 0 && (
              <div className="px-4 py-4 text-center text-sm text-gray-500">
                {t('header.noModels')}
              </div>
            )}
          </PortalDropdown>
        </div>

        <LanguageSwitcher />

        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center size-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
          title={t('header.settings')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
