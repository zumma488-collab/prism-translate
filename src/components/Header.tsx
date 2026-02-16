import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProviderConfig } from '../types'
import LanguageSwitcher from './LanguageSwitcher'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface ModelItem {
  provider: ProviderConfig
  modelId: string
  modelName: string
  uniqueId: string
}

interface HeaderProps {
  enabledModels: ModelItem[]
  currentModel?: ModelItem
  activeModelKey: string
  onModelSelect: (uniqueId: string) => void
  onOpenSettings: () => void
}

const Header: React.FC<HeaderProps> = ({
  enabledModels,
  currentModel,
  activeModelKey,
  onModelSelect,
  onOpenSettings,
}) => {
  const { t } = useTranslation()
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)

  const handleModelClick = (uniqueId: string) => {
    onModelSelect(uniqueId)
    setIsModelDropdownOpen(false)
  }

  const handleManageClick = () => {
    onOpenSettings()
    setIsModelDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-3 sm:px-6 py-3 sm:py-4 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center justify-center size-8 sm:size-9 rounded-lg bg-primary text-primary-foreground">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '18px' }}
          >
            translate
          </span>
        </div>
        <h1 className="hidden sm:block text-lg font-semibold tracking-tight">
          {t('header.title')}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-2">
          <DropdownMenu
            open={isModelDropdownOpen}
            onOpenChange={setIsModelDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-xl bg-secondary/50 border-0 hover:bg-secondary/80 transition-colors text-sm font-semibold justify-between min-w-[160px]"
                title={t('header.changeModel')}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="material-symbols-outlined text-primary shrink-0"
                    style={{ fontSize: '20px' }}
                  >
                    neurology
                  </span>
                  <span className="truncate max-w-[120px]">
                    {currentModel
                      ? currentModel.modelName
                      : t('header.selectModel')}
                  </span>
                </div>
                <span
                  className={`material-symbols-outlined text-muted-foreground transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''
                    }`}
                  style={{ fontSize: '20px' }}
                >
                  expand_more
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>{t('header.selectModel')}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {enabledModels.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {t('header.noModels')}
                  </div>
                ) : (
                  <DropdownMenuRadioGroup
                    value={activeModelKey}
                    onValueChange={handleModelClick}
                  >
                    {enabledModels.map((item) => (
                      <DropdownMenuRadioItem
                        key={item.uniqueId}
                        value={item.uniqueId}
                        className="cursor-pointer py-2"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{item.modelName}</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {item.provider.name}
                          </span>
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                )}
              </ScrollArea>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleManageClick}
                className="cursor-pointer text-primary focus:text-primary"
              >
                <span
                  className="material-symbols-outlined mr-2"
                  style={{ fontSize: '16px' }}
                >
                  settings
                </span>
                {t('header.manage')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <LanguageSwitcher />

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="size-10 rounded-xl"
          title={t('header.settings')}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px' }}
          >
            settings
          </span>
        </Button>
      </div>
    </header>
  )
}

export default Header
