import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_CONFIGS } from '../constants'
import { AppStatus, ProviderConfig } from '../types'
import ModelSelectorPopover from './ModelSelectorPopover'
import LanguageTag from './LanguageTag'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/command'

interface ModelOption {
  uniqueId: string
  modelName: string
  providerName: string
  provider: ProviderConfig
}

interface TranslationInputProps {
  inputText: string
  onInputChange: (text: string) => void
  targetLanguages: string[]
  onLanguagesChange: (languages: string[]) => void
  onTranslate: () => void
  status: AppStatus
  autoFocus?: boolean
  availableModels: ModelOption[]
  languageModels: Record<string, string>
  onLanguageModelChange: (lang: string, modelId: string | null) => void
  defaultModelId: string
}

const TranslationInput: React.FC<TranslationInputProps> = ({
  inputText,
  onInputChange,
  targetLanguages,
  onLanguagesChange,
  onTranslate,
  status,
  autoFocus = true,
  availableModels,
  languageModels,
  onLanguageModelChange,
  defaultModelId,
}) => {
  const { t } = useTranslation()
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [maxHeight, setMaxHeight] = useState(400)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // Calculate max height based on viewport
  useEffect(() => {
    const calculateMaxHeight = () => {
      const headerHeight = 73 // Header height with border (py-4 = 32px + border)
      const toolbarHeight = 100 // Approximate toolbar height
      const spacing = 20 // Extra spacing for safety
      const viewportHeight = window.innerHeight
      const isMobile = window.innerWidth < 768 // md breakpoint

      if (isMobile) {
        // On mobile: cap textarea at ~70% of viewport
        const mobileMax = Math.floor(viewportHeight * 0.7) - toolbarHeight
        setMaxHeight(Math.max(200, mobileMax))
      } else {
        const verticalPadding = 48 // 24px top + 24px bottom (p-6)
        const calculatedMaxHeight =
          viewportHeight - headerHeight - verticalPadding - toolbarHeight - spacing
        setMaxHeight(Math.max(200, calculatedMaxHeight)) // Ensure at least 200px
      }
    }

    calculateMaxHeight()
    window.addEventListener('resize', calculateMaxHeight)
    return () => window.removeEventListener('resize', calculateMaxHeight)
  }, [])

  // Focus input on mount
  useEffect(() => {
    if (autoFocus) {
      textAreaRef.current?.focus()
    }
  }, [autoFocus])

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textAreaRef.current
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'
      // Set height to scrollHeight to fit content, with max height limit
      const newHeight = Math.min(textarea.scrollHeight, maxHeight)
      textarea.style.height = `${newHeight}px`
    }
  }, [inputText, maxHeight])

  const toggleLanguage = (langName: string) => {
    const newLanguages = targetLanguages.includes(langName)
      ? targetLanguages.filter((l) => l !== langName)
      : [...targetLanguages, langName]
    onLanguagesChange(newLanguages)
  }

  const getAvailableLanguages = () => {
    return Object.keys(LANGUAGE_CONFIGS).filter(
      (l) => !targetLanguages.includes(l)
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to translate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      if (
        inputText.trim() &&
        targetLanguages.length > 0 &&
        status !== AppStatus.LOADING
      ) {
        onTranslate()
      }
    }
  }

  return (
    <div className="flex flex-col w-full md:w-1/2 md:h-full bg-background p-3 sm:p-6 md:pr-4 md:overflow-y-auto">
      <div className="flex flex-col bg-card rounded-xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all duration-200">
        <div className="relative">
          <Textarea
            ref={textAreaRef}
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-4 sm:p-5 md:p-6 resize-none bg-transparent border-none outline-none text-base md:text-lg leading-relaxed placeholder:text-muted-foreground/50 text-foreground overflow-y-auto shadow-none focus-visible:ring-0 min-h-[150px]"
            placeholder={t('translation.input.placeholder')}
            maxLength={5000}
            rows={1}
            style={{ maxHeight: `${maxHeight}px` }}
          />
        </div>

        {/* Toolbar - Optimized Layout */}
        <div className="p-2.5 sm:p-3 bg-muted/50 border-t border-border rounded-b-xl flex flex-col gap-2">
          {/* Row 1: Source + Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground min-w-0 flex-wrap">
              <span
                className="material-symbols-outlined shrink-0"
                style={{ fontSize: '16px' }}
              >
                language
              </span>
              <span className="font-medium shrink-0">
                {t('translation.input.autoDetect')}
              </span>
              <span
                className="material-symbols-outlined shrink-0"
                style={{ fontSize: '16px' }}
              >
                arrow_forward
              </span>
              <span className="text-foreground font-medium shrink-0">
                {t('translation.input.languages', {
                  count: targetLanguages.length,
                })}
              </span>
              <span className="hidden sm:inline mx-1.5 text-border">|</span>
              <span className="hidden sm:inline text-xs">
                {t('translation.input.charCount', { count: inputText.length })}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Add Language Dropdown - Hidden when no languages available */}
              {getAvailableLanguages().length > 0 && (
                <Popover
                  open={isLanguageDropdownOpen}
                  onOpenChange={setIsLanguageDropdownOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={status === AppStatus.LOADING}
                      className="gap-1.5 h-8 px-3"
                      title={t('translation.input.addLanguage')}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '16px' }}
                      >
                        add
                      </span>
                      <span className="hidden sm:inline">
                        {t('translation.input.add')}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-52 p-0"
                    align="end"
                    side="top"
                  >
                    <Command>
                      <CommandInput
                        placeholder={t('translation.input.addLanguage') + '...'}
                      />
                      <CommandList>
                        <CommandEmpty>No language found.</CommandEmpty>
                        <CommandGroup>
                          {getAvailableLanguages().map((lang) => {
                            const config = LANGUAGE_CONFIGS[lang]
                            return (
                              <CommandItem
                                key={lang}
                                value={config?.nativeName || lang}
                                onSelect={() => {
                                  toggleLanguage(lang)
                                  setIsLanguageDropdownOpen(false)
                                }}
                                className="cursor-pointer"
                              >
                                <span
                                  className="size-2.5 rounded-full shrink-0 mr-2"
                                  style={{ backgroundColor: config?.color }}
                                />
                                <span className="font-medium text-xs">
                                  {config?.nativeName || lang}
                                </span>
                                <span className="text-muted-foreground text-[10px] ml-auto">
                                  {lang}
                                </span>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}

              {/* Translate Button */}
              <Button
                onClick={onTranslate}
                disabled={
                  status === AppStatus.LOADING ||
                  !inputText.trim() ||
                  targetLanguages.length === 0
                }
                className="gap-1.5 h-8 px-4"
                title={
                  targetLanguages.length === 0
                    ? t('translation.input.selectLanguageWarning')
                    : t('translation.input.translateHotkey')
                }
              >
                <span
                  className={`material-symbols-outlined ${status === AppStatus.LOADING ? 'animate-spin' : ''
                    }`}
                  style={{ fontSize: '16px' }}
                >
                  {status === AppStatus.LOADING
                    ? 'progress_activity'
                    : 'send'}
                </span>
                <span className="hidden sm:inline">
                  {status === AppStatus.LOADING
                    ? t('translation.input.translating')
                    : t('translation.input.translate')}
                </span>
              </Button>
            </div>
          </div>

          {/* Row 2: Target Languages */}
          <div className="flex items-center flex-wrap gap-1.5">
            {targetLanguages.map((lang) => (
              <LanguageTag
                key={lang}
                language={lang}
                currentModelId={languageModels[lang] || null}
                defaultModelId={defaultModelId}
                availableModels={availableModels}
                status={status}
                onRemove={() => toggleLanguage(lang)}
                onModelChange={(modelId) => onLanguageModelChange(lang, modelId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TranslationInput
