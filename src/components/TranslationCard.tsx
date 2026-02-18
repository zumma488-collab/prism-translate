import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TranslationResult, LanguageConfig } from '../types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface TranslationCardProps {
  data: TranslationResult
  config: LanguageConfig
  totalLanguages?: number // Number of languages being translated
}

const COLLAPSE_THRESHOLD = 200 // Characters threshold for collapsing

const TranslationCard: React.FC<TranslationCardProps> = ({
  data,
  config,
  totalLanguages = 1,
}) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Only enable collapsing when multiple languages AND text is long
  const shouldEnableCollapse =
    totalLanguages > 1 && data.text.length > COLLAPSE_THRESHOLD
  const isCollapsed = shouldEnableCollapse && !isExpanded

  const handleCopy = () => {
    navigator.clipboard.writeText(data.text)
  }

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(data.text)
      const voices = window.speechSynthesis.getVoices()
      const langVoice = voices.find((v) => v.lang.startsWith(data.code))
      if (langVoice) utterance.voice = langVoice
      utterance.lang = data.code
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <Card className="group relative flex flex-row overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200 p-0 gap-0">
      {/* Left Color Bar */}
      <div
        className="w-1 sm:w-1.5 shrink-0"
        style={{ backgroundColor: config.color }}
      />
      <div className="flex-1 p-3 sm:p-5">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <div className="flex items-center gap-2">

            <span className="font-semibold text-sm text-foreground">
              {data.language}
            </span>
          </div>

        </div>

        {/* Toolbar: Model Info & Actions */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Left: Model Info */}
          <div className="flex gap-2 items-center flex-wrap">
            {data.modelName && (
              <Badge
                variant="outline"
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium"
                title={
                  data.providerName ? `Provider: ${data.providerName}` : undefined
                }
              >
                {data.modelName}
              </Badge>
            )}
            {data.tone && (
              <Badge variant="outline" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
                {data.tone}
              </Badge>
            )}
            {data.confidence && (
              <Badge variant="outline" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium">
                {data.confidence}%
              </Badge>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={handleCopy}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px' }}
                  >
                    content_copy
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('translation.output.copy')}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={handleSpeak}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px' }}
                  >
                    volume_up
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('translation.output.listen')}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsVisible(!isVisible)}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px' }}
                  >
                    {isVisible ? 'visibility' : 'visibility_off'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isVisible ? t('translation.output.hide') : t('translation.output.show')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Error State */}
        {data.error ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <span className="material-symbols-outlined text-destructive shrink-0" style={{ fontSize: '20px' }}>
              error
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-destructive">{t('translation.output.error', 'Translation Failed')}</p>
              <p className="text-xs text-destructive/80 mt-1 break-all">{data.error}</p>
            </div>
          </div>
        ) : (
          <>
            {isVisible ? (
              <>
                {/* Text Content with Collapse Logic */}
                <div className="relative">
                  <p
                    className={`text-base leading-relaxed text-foreground whitespace-pre-wrap ${isCollapsed ? 'line-clamp-6' : ''
                      }`}
                  >
                    {data.text}
                  </p>

                  {/* Gradient Overlay when collapsed */}
                  {isCollapsed && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Expand/Collapse Button */}
                {shouldEnableCollapse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-primary hover:text-primary/80 h-auto p-0 hover:bg-transparent font-medium flex items-center gap-1 transition-colors"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '16px' }}
                    >
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                    {isExpanded
                      ? t('translation.output.showLess')
                      : t('translation.output.showMore')}
                  </Button>
                )}
              </>
            ) : (
              <div
                className="h-8 flex items-center gap-2 text-muted-foreground/50 text-sm italic select-none cursor-pointer hover:text-muted-foreground transition-colors"
                onClick={() => setIsVisible(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility_off</span>
                <span>{t('translation.output.hidden', 'Translation hidden')}</span>
              </div>
            )}
          </>
        )}


      </div>
    </Card>
  )
}

export default TranslationCard
