import React from 'react'
import { useTranslation } from 'react-i18next'
import { TranslationResult, LanguageConfig } from '../types'
import TranslationCard from './TranslationCard'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface TranslationGroupProps {
    results: TranslationResult[]
    config: LanguageConfig
    totalLanguages: number
    expectedCount?: number // The expected number of translations for this language
}

/**
 * Groups multiple translation results for the same language.
 * - Single result: renders as a normal TranslationCard
 * - Multiple results: renders a vertical list of results
 */
const TranslationGroup: React.FC<TranslationGroupProps> = ({
    results,
    config,
    totalLanguages,
    expectedCount = results.length,
}) => {
    const { t } = useTranslation()

    // Single result: just render TranslationCard directly
    // ONLY downgrade if we EXPECT exactly 1 result, otherwise keep the group UI for consistency 
    // even while waiting for other results
    if (expectedCount === 1 && results.length === 1) {
        return (
            <TranslationCard
                data={results[0]}
                config={config}
                totalLanguages={totalLanguages}
            />
        )
    }

    return (
        <Card className="group relative flex flex-row overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200 p-0 gap-0">
            {/* Left Color Bar */}
            <div
                className="w-1 sm:w-1.5 shrink-0"
                style={{ backgroundColor: config.color }}
            />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Common Header for Language */}
                <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase bg-secondary text-secondary-foreground">
                            {config.code}
                        </span>
                        <span className="font-semibold text-sm text-foreground">
                            {config.name}
                        </span>
                    </div>
                </div>

                {results.map((result, idx) => (
                    <React.Fragment key={`${result.modelName}-${idx}`}>
                        {idx > 0 && <Separator className="bg-border/60" />}
                        <div className="relative p-3 sm:p-5 hover:bg-muted/5 transition-colors">
                            <ResultContent result={result} t={t} totalCount={expectedCount} index={idx} totalLanguages={totalLanguages} />
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </Card>
    )
}

// Internal component for rendering the result content
const COLLAPSE_THRESHOLD = 200

const ResultContent: React.FC<{ result: TranslationResult, t: any, totalCount: number, index: number, totalLanguages: number }> = ({ result, t, totalCount, index, totalLanguages }) => {
    const [isVisible, setIsVisible] = React.useState(true)
    const [isExpanded, setIsExpanded] = React.useState(false)

    // Only enable collapsing when multiple languages OR multiple models are active AND text is long
    const shouldEnableCollapse = (totalLanguages > 1 || totalCount > 1) && result.text.length > COLLAPSE_THRESHOLD
    const isCollapsed = shouldEnableCollapse && !isExpanded

    return (
        <div className="flex flex-col h-full animate-in fade-in-50 duration-200 slide-in-from-left-1">


            {result.error ? (
                <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <span className="material-symbols-outlined text-destructive shrink-0" style={{ fontSize: '20px' }}>
                        error
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-destructive">{t('translation.output.error', 'Translation Failed')}</p>
                        <p className="text-xs text-destructive/80 mt-1 break-all">{result.error}</p>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    {/* Toolbar: Model Info & Actions */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                        {/* Left: Model Info */}
                        <div className="flex items-center gap-2 flex-wrap opacity-80">
                            {/* Model Badge */}
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
                                <span className="text-[10px] font-medium">{result.modelName || 'Unknown'}</span>
                            </div>
                            {result.tone && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border/50">
                                    {result.tone}
                                </span>
                            )}
                            {result.confidence && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/5 text-primary border border-primary/20">
                                    {result.confidence}%
                                </span>
                            )}
                            {result.providerName && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium text-muted-foreground/70">
                                    via {result.providerName}
                                </span>
                            )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                            <button
                                className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                                onClick={() => navigator.clipboard.writeText(result.text)}
                                title={t('translation.output.copy')}
                                type="button"
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: '16px' }}
                                >
                                    content_copy
                                </span>
                            </button>
                            <button
                                className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                                onClick={() => {
                                    if ('speechSynthesis' in window) {
                                        const utterance = new SpeechSynthesisUtterance(result.text)
                                        const voices = window.speechSynthesis.getVoices()
                                        const langVoice = voices.find((v) => v.lang.startsWith(result.code))
                                        if (langVoice) utterance.voice = langVoice
                                        utterance.lang = result.code
                                        window.speechSynthesis.speak(utterance)
                                    }
                                }}
                                title={t('translation.output.listen')}
                                type="button"
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: '16px' }}
                                >
                                    volume_up
                                </span>
                            </button>
                            <button
                                className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                                onClick={() => setIsVisible(!isVisible)}
                                title={isVisible ? t('translation.output.hide') : t('translation.output.show')}
                                type="button"
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: '16px' }}
                                >
                                    {isVisible ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {isVisible ? (
                        <>
                            <div className="relative">
                                <p className={`text-base leading-relaxed text-foreground whitespace-pre-wrap animate-in fade-in zoom-in-95 duration-200 ${isCollapsed ? 'line-clamp-6' : ''}`}>
                                    {result.text}
                                </p>
                                {/* Gradient Overlay when collapsed */}
                                {isCollapsed && (
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                                )}
                            </div>

                            {/* Expand/Collapse Button */}
                            {shouldEnableCollapse && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="mt-2 text-primary hover:text-primary/80 h-auto p-0 bg-transparent font-medium flex items-center gap-1 transition-colors cursor-pointer text-sm"
                                    type="button"
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
                                </button>
                            )}
                        </>
                    ) : (
                        <div
                            className="h-6 flex items-center gap-1.5 text-muted-foreground/50 text-xs italic select-none cursor-pointer hover:text-muted-foreground transition-colors"
                            onClick={() => setIsVisible(true)}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility_off</span>
                            <span>{t('translation.output.hidden', 'Translation hidden')}</span>
                        </div>
                    )}
                </div>
            )}


        </div>
    )
}

export default TranslationGroup
