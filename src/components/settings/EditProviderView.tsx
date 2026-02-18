import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generateId } from '@/lib/utils';
import { ProviderConfig, ModelDefinition, ModelProvider } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

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
        id: initialConfig.id || generateId(),
        type: initialConfig.type,
        name: initialConfig.name || '',
        apiKey: initialConfig.apiKey || '',
        baseUrl: initialConfig.baseUrl || '',
        models: initialConfig.models || [],
        headers: initialConfig.headers || {}
    });

    const [newModelId, setNewModelId] = useState('');
    const [newModelName, setNewModelName] = useState('');

    // Model fetching state
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [fetchedModels, setFetchedModels] = useState<ModelDefinition[]>([]);
    const [selectedFetchedModels, setSelectedFetchedModels] = useState<string[]>([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

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

    const fetchModels = async () => {
        if (!config.baseUrl || !config.apiKey) return;

        setIsFetchingModels(true);
        setFetchError(null);
        setFetchedModels([]);

        try {
            const baseUrl = config.baseUrl.replace(/\/$/, '');
            const response = await fetch(`${baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Assume OpenAI compatible format: { data: [{ id: "model-id", ... }] }
            if (data && Array.isArray(data.data)) {
                const models: ModelDefinition[] = data.data.map((m: any) => ({
                    id: m.id,
                    name: m.id, // API usually only returns ID, use it as name initially
                    enabled: true
                }));

                if (models.length === 0) {
                    setFetchError(t('settings.form.noModelsFoundFromApi'));
                } else {
                    setFetchedModels(models);
                }
            } else {
                setFetchError(t('settings.form.invalidResponse'));
            }
        } catch (err: any) {
            setFetchError(t('settings.form.fetchError', { error: err.message || String(err) }));
        } finally {
            setIsFetchingModels(false);
        }
    };

    const handleOpenModelModal = () => {
        setIsModelModalOpen(true);
        setSelectedFetchedModels([]);
        setFetchedModels([]);
        setFetchError(null);
        fetchModels();
    };

    const toggleSelectedModel = (modelId: string) => {
        setSelectedFetchedModels(prev =>
            prev.includes(modelId)
                ? prev.filter(id => id !== modelId)
                : [...prev, modelId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedFetchedModels.length === fetchedModels.length) {
            setSelectedFetchedModels([]);
        } else {
            setSelectedFetchedModels(fetchedModels.map(m => m.id));
        }
    };

    const handleConfirmSelection = () => {
        const modelsToAdd = fetchedModels.filter(m => selectedFetchedModels.includes(m.id));

        // Filter out duplicates that already exist in config.models
        const newModels = modelsToAdd.filter(
            newModel => !config.models.some(existing => existing.id === newModel.id)
        );

        setConfig(c => ({
            ...c,
            models: [...c.models, ...newModels]
        }));

        setIsModelModalOpen(false);
    };

    const handleSave = () => {
        if (!config.name.trim()) return alert(t('settings.form.nameRequired'));
        onSave(config);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </Button>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                    {config.type === 'custom' ? t('settings.provider.customProvider') : config.type === 'google' ? 'Google Gemini' : 'OpenAI'}
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-6">
                <p className="text-sm text-muted-foreground">
                    {t('settings.form.configureProviderHint')}
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
                    <div className="flex items-center justify-between">
                        <Label>{t('settings.form.models')}</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleOpenModelModal}
                            disabled={!config.baseUrl || !config.apiKey}
                            className="h-8 text-xs text-muted-foreground hover:text-primary"
                        >
                            <span className="material-symbols-outlined text-[16px] mr-1">download</span>
                            {t('settings.form.fetchModels')}
                        </Button>
                    </div>

                    <div className="bg-muted rounded-xl p-4 space-y-3">

                        {/* Add Model Inputs */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
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
                                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-destructive size-7"
                                    >
                                        <span className="material-symbols-outlined !text-[16px]">close</span>
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
            {/* Models Selection Modal */}
            <Dialog open={isModelModalOpen} onOpenChange={setIsModelModalOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{t('settings.form.selectModels')}</DialogTitle>
                        <DialogDescription>
                            {t('settings.form.selectModelsDescription', 'Select models to add to your provider configuration.')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4">
                        {isFetchingModels ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <span className="material-symbols-outlined animate-spin mb-2">progress_activity</span>
                                <p>{t('settings.form.fetching')}</p>
                            </div>
                        ) : fetchError ? (
                            <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-3">
                                <span className="material-symbols-outlined mt-0.5">error</span>
                                <p className="text-sm">{fetchError}</p>
                            </div>
                        ) : fetchedModels.length > 0 ? (
                            <div className="space-y-1">
                                <div
                                    className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer border-b border-border mb-2 pb-2"
                                    onClick={toggleSelectAll}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedFetchedModels.length === fetchedModels.length && fetchedModels.length > 0}
                                        onChange={() => { }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label className="text-sm font-bold leading-none cursor-pointer flex-1">
                                        {t('settings.form.selectAll')}
                                    </label>
                                </div>
                                {fetchedModels.map((model) => (
                                    <div
                                        key={model.id}
                                        className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                                        onClick={() => toggleSelectedModel(model.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedFetchedModels.includes(model.id)}
                                            onChange={() => { }} // Handled by parent div
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                                            {model.id}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                {t('settings.form.noModelsFoundFromApi')}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <div className="flex w-full justify-between items-center sm:justify-end gap-2">
                            <div className="text-xs text-muted-foreground sm:hidden">
                                {selectedFetchedModels.length > 0 && t('settings.form.selectedCount', { count: selectedFetchedModels.length })}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsModelModalOpen(false)}>
                                    {t('settings.import.cancel')}
                                </Button>
                                <Button
                                    onClick={handleConfirmSelection}
                                    disabled={selectedFetchedModels.length === 0}
                                >
                                    {t('settings.form.addSelected')} ({selectedFetchedModels.length})
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditProviderView;
