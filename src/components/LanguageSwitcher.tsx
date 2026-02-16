import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
]

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-xl"
          title={t('header.language')}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px' }}
          >
            language
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={i18n.language}
          onValueChange={handleLanguageChange}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <DropdownMenuRadioItem
              key={lang.code}
              value={lang.code}
              className="cursor-pointer"
            >
              {lang.nativeName}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher
