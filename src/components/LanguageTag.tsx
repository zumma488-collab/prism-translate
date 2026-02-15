import React from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_CONFIGS } from '../constants'
import { AppStatus, ProviderConfig } from '../types'
import ModelSelectorPopover from './ModelSelectorPopover'
import './LanguageTag.css'

interface ModelOption {
    uniqueId: string
    modelName: string
    providerName: string
    provider: ProviderConfig
}

interface LanguageTagProps {
    language: string
    currentModelId: string | null
    defaultModelId: string
    availableModels: ModelOption[]
    status: AppStatus
    onRemove: () => void
    onModelChange: (modelId: string | null) => void
}

const LanguageTag: React.FC<LanguageTagProps> = ({
    language,
    currentModelId,
    defaultModelId,
    availableModels,
    status,
    onRemove,
    onModelChange,
}) => {
    const { t } = useTranslation()
    const config = LANGUAGE_CONFIGS[language]
    const hasCustomModel = !!currentModelId

    return (
        <div
            className={`language-tag ${hasCustomModel ? 'language-tag--custom-model' : ''}`}
            style={{ backgroundColor: config?.color || '#64748b' }}
        >
            <ModelSelectorPopover
                language={config?.nativeName || language}
                currentModelId={currentModelId}
                defaultModelId={defaultModelId}
                availableModels={availableModels}
                onSelect={(modelId) => onModelChange(modelId)}
                trigger={
                    <button
                        disabled={status === AppStatus.LOADING}
                        className="language-tag__settings-btn"
                        title={t('translation.input.selectModel', { lang: language })}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '16px' }}
                        >
                            {hasCustomModel ? 'settings_suggest' : 'settings'}
                        </span>
                    </button>
                }
            />

            <button
                onClick={onRemove}
                disabled={status === AppStatus.LOADING}
                className="language-tag__remove-btn"
                title={
                    status === AppStatus.LOADING
                        ? t('translation.input.cannotRemoveLanguage')
                        : t('translation.input.removeLanguage', { lang: language })
                }
            >
                <span>{config?.nativeName || language}</span>
                <span
                    className="material-symbols-outlined language-tag__close-icon"
                    style={{ fontSize: '16px' }}
                >
                    close
                </span>
            </button>

            {hasCustomModel && (
                <div className="language-tag__tooltip">
                    <div className="language-tag__tooltip-content">
                        Using:{' '}
                        {availableModels.find((m) => m.uniqueId === currentModelId)
                            ?.modelName || 'Unknown'}
                    </div>
                </div>
            )}
        </div>
    )
}

export default LanguageTag
