import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ProviderConfig, ModelDefinition, ModelProvider } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface EditProviderViewProps {
    initialConfig: Partial<ProviderConfig> & { type: ModelProvider };
    onSave: (config: ProviderConfig) => void;
    onDelete: (id: string) => void;
    onBack: () => void;
    existingIds: string[];
}

const EditProviderView: React.FC<EditProviderViewProps> = ({ initialConfig, onSave, onDelete, onBack }) => {
    const { t } = useTranslation();
    const [config, setConfig] = useState<ProviderConfig>({
        id: initialConfig.id || crypto.randomUUID(),
        type: initialConfig.type,
        name: initialConfig.name || '',
        apiKey: initialConfig.apiKey || '',
        baseUrl: initialConfig.baseUrl || '',
        models: initialConfig.models || [],
        headers: initialConfig.headers || {}
    });

    const [newModelId, setNewModelId] = useState('');
    const [newModelName, setNewModelName] = useState('');

    useEffect(() => {
        if (!config.name) {
            if (config.type === 'google') setConfig(c => ({ ...c, name: 'Google Gemini' }));
            if (config.type === 'openai') setConfig(c => ({ ...c, name: 'OpenAI' }));
            if (config.type === 'custom') setConfig(c => ({ ...c, name: t('settings.provider.customProvider') }));
        }
        if (!config.baseUrl && config.type === 'openai') {
            setConfig(c => ({ ...c, baseUrl: 'https://api.openai.com/v1' }));
        }
    }, [config.type, t]);

    const handleAddModel = () => {
        if (!newModelId.trim()) return;
        const model: ModelDefinition = {
            id: newModelId,
            name: newModelName || newModelId,
            enabled: true
        };
        setConfig(c => ({ ...c, models: [...c.models, model] }));
        setNewModelId('');
        setNewModelName('');
    };

    const removeModel = (idx: number) => {
        setConfig(c => ({ ...c, models: c.models.filter((_, i) => i !== idx) }));
    };

    const handleSave = () => {
        if (!config.name.trim()) return alert(t('settings.form.nameRequired'));
        onSave(config);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </Button>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                    {config.type === 'custom' ? t('settings.provider.customProvider') : config.type === 'google' ? 'Google Gemini' : 'OpenAI'}
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                <p className="text-sm text-muted-foreground">
                    Configure {config.type} provider settings.
                </p>

                {/* Display Name */}
                <div className="space-y-2">
                    <Label htmlFor="displayName">{t('settings.form.displayName')}</Label>
                    <Input
                        id="displayName"
                        type="text"
                        value={config.name}
                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                        placeholder={t('settings.form.displayNamePlaceholder')}
                    />
                </div>

                {/* Base URL */}
                {(config.type === 'openai' || config.type === 'custom') && (
                    <div className="space-y-2">
                        <Label htmlFor="baseUrl">{t('settings.form.baseUrl')}</Label>
                        <Input
                            id="baseUrl"
                            type="text"
                            value={config.baseUrl || ''}
                            onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                            placeholder={t('settings.form.baseUrlPlaceholder')}
                            className="font-mono"
                        />
                    </div>
                )}

                {/* API Key */}
                <div className="space-y-2">
                    <Label htmlFor="apiKey">{t('settings.form.apiKey')}</Label>
                    <Input
                        id="apiKey"
                        type="password"
                        value={config.apiKey}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                        placeholder={t('settings.form.apiKeyPlaceholder')}
                        className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">{t('settings.form.apiKeyHint')}</p>
                </div>

                <Separator />

                {/* Models List */}
                <div className="space-y-4">
                    <Label>{t('settings.form.models')}</Label>

                    <div className="bg-muted rounded-xl p-4 space-y-3">
                        {/* Add Model Inputs */}
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-muted-foreground">{t('settings.form.modelId')}</Label>
                                <Input
                                    type="text"
                                    value={newModelId}
                                    onChange={(e) => setNewModelId(e.target.value)}
                                    placeholder={t('settings.form.modelIdPlaceholder')}
                                    className="font-mono h-9"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label className="text-xs text-muted-foreground">{t('settings.form.displayName')}</Label>
                                <Input
                                    type="text"
                                    value={newModelName}
                                    onChange={(e) => setNewModelName(e.target.value)}
                                    placeholder={t('settings.form.displayName')}
                                    className="h-9"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddModel}
                                disabled={!newModelId.trim()}
                            >
                                {t('settings.form.addModel')}
                            </Button>
                        </div>

                        {/* List */}
                        <div className="space-y-1 mt-2">
                            {config.models.map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-background border border-border rounded-lg group">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{m.id}</span>
                                        {m.name !== m.id && <span className="text-xs text-muted-foreground">{m.name}</span>}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeModel(i)}
                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive size-8"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </Button>
                                </div>
                            ))}
                            {config.models.length === 0 && (
                                <div className="text-center py-2 text-xs text-muted-foreground">{t('settings.form.noModelsAdded')}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-6">
                    <Button onClick={handleSave} className="w-full">
                        {t('settings.form.updateProvider')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditProviderView;
