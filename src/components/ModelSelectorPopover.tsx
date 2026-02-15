import React, { useState } from 'react';
import PortalDropdown from './ui/portal-dropdown';
import { ProviderConfig } from '../types';

interface ModelOption {
    uniqueId: string;
    modelName: string;
    providerName: string;
    provider: ProviderConfig;
}

interface ModelSelectorPopoverProps {
    language: string;
    currentModelId: string | null; // null means use default
    defaultModelId: string;
    availableModels: ModelOption[];
    onSelect: (modelId: string | null) => void;
    trigger: React.ReactNode;
}

const ModelSelectorPopover: React.FC<ModelSelectorPopoverProps> = ({
    language,
    currentModelId,
    defaultModelId,
    availableModels,
    onSelect,
    trigger
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Group models by provider
    const modelsByProvider = availableModels.reduce((acc, model) => {
        if (!acc[model.providerName]) {
            acc[model.providerName] = [];
        }
        acc[model.providerName].push(model);
        return acc;
    }, {} as Record<string, ModelOption[]>);

    const filteredProviders = Object.keys(modelsByProvider).filter(providerName => {
        if (!searchTerm) return true;
        // Check if provider name matches or any of its models match
        const providerMatch = providerName.toLowerCase().includes(searchTerm.toLowerCase());
        const hasModelMatch = modelsByProvider[providerName].some(m =>
            m.modelName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return providerMatch || hasModelMatch;
    });

    const getEffectiveModelId = () => currentModelId || defaultModelId;

    return (
        <PortalDropdown
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={trigger}
            placement="bottom-start"
            className="w-72 p-0 overflow-hidden"
        >
            <div className="flex flex-col max-h-96">
                <div className="p-3 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Translation Model for {language}
                        </span>
                        {currentModelId && (
                            <button
                                onClick={() => {
                                    onSelect(null);
                                    setIsOpen(false);
                                }}
                                className="text-[10px] text-primary hover:underline"
                            >
                                Reset to Global
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Search models..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/50"
                        autoFocus
                    />
                </div>

                <div className="overflow-y-auto flex-1 p-1">
                    {filteredProviders.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            No models found
                        </div>
                    ) : (
                        filteredProviders.map(providerName => (
                            <div key={providerName} className="mb-2 last:mb-0">
                                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted/20">
                                    {providerName}
                                </div>
                                <div>
                                    {modelsByProvider[providerName]
                                        .filter(m => !searchTerm ||
                                            m.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            providerName.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map(model => {
                                            const isSelected = model.uniqueId === currentModelId;
                                            const isDefault = model.uniqueId === defaultModelId;
                                            const isEffective = model.uniqueId === getEffectiveModelId();

                                            return (
                                                <button
                                                    key={model.uniqueId}
                                                    onClick={() => {
                                                        onSelect(model.uniqueId);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`w-full text-left px-2 py-1.5 flex items-center gap-2 hover:bg-muted/50 rounded-sm transition-colors ${isSelected ? 'bg-primary/10 text-primary' : ''
                                                        }`}
                                                >
                                                    <div className={`size-3 rounded-full border flex items-center justify-center shrink-0 ${isSelected || (isEffective && !currentModelId && isDefault)
                                                            ? 'border-primary bg-primary'
                                                            : 'border-muted-foreground/30'
                                                        }`}>
                                                        {(isSelected || (isEffective && !currentModelId && isDefault)) && (
                                                            <div className="size-1.5 bg-primary-foreground rounded-full" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className={`text-xs truncate ${isEffective ? 'font-medium' : ''}`}>
                                                            {model.modelName}
                                                        </span>
                                                        {isDefault && (
                                                            <span className="text-[9px] text-muted-foreground leading-none">
                                                                (Global Default)
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PortalDropdown>
    );
};

export default ModelSelectorPopover;
