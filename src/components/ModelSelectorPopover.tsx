import React, { useState } from 'react'
import { ProviderConfig } from '../types'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModelOption {
    uniqueId: string
    modelName: string
    providerName: string
    provider: ProviderConfig
}

interface ModelSelectorPopoverProps {
    language: string
    currentModelId: string | null // null means use default
    defaultModelId: string
    availableModels: ModelOption[]
    onSelect: (modelId: string | null) => void
    trigger: React.ReactNode
}

const ModelSelectorPopover: React.FC<ModelSelectorPopoverProps> = ({
    language,
    currentModelId,
    defaultModelId,
    availableModels,
    onSelect,
    trigger,
}) => {
    const [isOpen, setIsOpen] = useState(false)

    // Group models by provider
    const modelsByProvider = availableModels.reduce((acc, model) => {
        if (!acc[model.providerName]) {
            acc[model.providerName] = []
        }
        acc[model.providerName].push(model)
        return acc
    }, {} as Record<string, ModelOption[]>)

    const sortedProviders = Object.keys(modelsByProvider).sort()

    const getEffectiveModelId = () => currentModelId || defaultModelId

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <div className="p-2 border-b border-border flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                                Model for {language}
                            </span>
                            {currentModelId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-[10px] text-primary hover:text-primary/80 hover:bg-transparent"
                                    onClick={() => {
                                        onSelect(null)
                                        setIsOpen(false)
                                    }}
                                >
                                    Reset to Global
                                </Button>
                            )}
                        </div>
                        <CommandInput
                            placeholder="Search models..."
                            className="h-8 text-xs"
                            wrapperClassName="border rounded-md px-2"
                        />
                    </div>
                    <CommandList className="max-h-[300px]">
                        <CommandEmpty>No models found.</CommandEmpty>
                        {sortedProviders.map((providerName) => (
                            <CommandGroup key={providerName} heading={providerName}>
                                {modelsByProvider[providerName].map((model) => {
                                    const isSelected = model.uniqueId === currentModelId
                                    const isDefault = model.uniqueId === defaultModelId
                                    const isEffective = model.uniqueId === getEffectiveModelId()

                                    return (
                                        <CommandItem
                                            key={model.uniqueId}
                                            value={`${model.modelName} ${model.providerName}`}
                                            onSelect={() => {
                                                onSelect(model.uniqueId)
                                                setIsOpen(false)
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <div
                                                className={cn(
                                                    'mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                                                    isSelected ||
                                                        (isEffective && !currentModelId && isDefault)
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-muted-foreground/30 opacity-50'
                                                )}
                                            >
                                                {(isSelected ||
                                                    (isEffective && !currentModelId && isDefault)) && (
                                                        <div className="h-2 w-2 rounded-full bg-current" />
                                                    )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span>{model.modelName}</span>
                                                {isDefault && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        (Global Default)
                                                    </span>
                                                )}
                                            </div>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default ModelSelectorPopover
