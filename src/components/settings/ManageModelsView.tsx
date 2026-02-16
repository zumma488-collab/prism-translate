import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettings, ProviderConfig } from '../../types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface ManageModelsViewProps {
    settings: AppSettings;
    onUpdateSettings: (settings: AppSettings) => void;
    onEditProvider: (providerId: string) => void;
    onDeleteProvider: (providerId: string) => void;
    onConnectProvider: () => void;
    onExportConfig: () => void;
    onImportConfig: () => void;
}

const ManageModelsView: React.FC<ManageModelsViewProps> = ({
    settings,
    onUpdateSettings,
    onEditProvider,
    onDeleteProvider,
    onConnectProvider,
    onExportConfig,
    onImportConfig
}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const toggleModel = (providerId: string, modelId: string, enabled: boolean) => {
        const newProviders = settings.providers.map(p => {
            if (p.id !== providerId) return p;
            return {
                ...p,
                models: p.models.map(m => {
                    if (m.id !== modelId) return m;
                    return { ...m, enabled };
                })
            };
        });
        onUpdateSettings({ ...settings, providers: newProviders });
    };

    const filteredProviders = settings.providers.map(provider => {
        const matchesProvider = provider.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchedModels = provider.models.filter(m =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.id.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (matchesProvider) return provider;

        if (matchedModels.length > 0) {
            return { ...provider, models: matchedModels };
        }

        return null;
    }).filter(Boolean) as ProviderConfig[];

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between pl-4 sm:pl-6 pr-10 sm:pr-14 py-3 sm:py-4 border-b border-border">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">{t('settings.manageModels')}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                        {t('settings.description')}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-2 sm:gap-3">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('settings.searchModels')}
                        className="pl-10"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-foreground text-[18px]">search</span>
                </div>
                <Button
                    onClick={onConnectProvider}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    <span className="hidden sm:inline">{t('settings.connectProvider')}</span>
                </Button>
                <Button
                    onClick={onImportConfig}
                    variant="outline"
                    size="icon"
                    className="shrink-0 size-9"
                    title={t('settings.importConfig')}
                >
                    <span className="material-symbols-outlined text-[18px]">upload</span>
                </Button>
                <Button
                    onClick={onExportConfig}
                    variant="outline"
                    size="icon"
                    className="shrink-0 size-9"
                    title={t('settings.exportConfig')}
                >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                </Button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 space-y-6">
                {filteredProviders.map(provider => (
                    <div key={provider.id} className="group">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-foreground">
                                {provider.name}
                            </h3>
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEditProvider(provider.id)}
                                    className="size-7 hover:bg-muted"
                                    title={t('settings.editProvider')}
                                >
                                    <span className="material-symbols-outlined !text-[18px]">edit</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDeleteProvider(provider.id)}
                                    className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    title={t('settings.deleteProvider')}
                                >
                                    <span className="material-symbols-outlined !text-[18px]">delete</span>
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {provider.models.map(model => (
                                <div key={model.id} className="flex items-center justify-between py-2 pl-2 pr-2 hover:bg-accent rounded-lg group/item">
                                    <span className="text-sm text-foreground">{model.name}</span>
                                    <Switch
                                        checked={model.enabled !== false}
                                        onCheckedChange={(checked) => toggleModel(provider.id, model.id, checked)}
                                    />
                                </div>
                            ))}
                            {provider.models.length === 0 && (
                                <div className="text-sm text-muted-foreground italic pl-2">No models configured.</div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredProviders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                        <p>{searchQuery ? t('settings.noModelsFound') : t('settings.noModels')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageModelsView;
