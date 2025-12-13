import fs from 'fs'

function loadJson(path: string): Record<string, string> {
  const url = new URL(path, import.meta.url)
  const content = fs.readFileSync(url, 'utf8')
  return JSON.parse(content) as Record<string, string>
}

const en = loadJson('./locales/en.json')
const fr = loadJson('./locales/fr.json')
const es = loadJson('./locales/es.json')
const de = loadJson('./locales/de.json')
const ar = loadJson('./locales/ar.json')

interface Translations {
  [key: string]: {
    [lang: string]: string
  }
}

const translations: Translations = {
  passwordResetSubject: {
    en: en.passwordResetSubject,
    fr: fr.passwordResetSubject,
    es: es.passwordResetSubject,
    de: de.passwordResetSubject,
    ar: ar.passwordResetSubject
  },
  passwordResetGreeting: {
    en: en.passwordResetGreeting,
    fr: fr.passwordResetGreeting,
    es: es.passwordResetGreeting,
    de: de.passwordResetGreeting,
    ar: ar.passwordResetGreeting
  },
  passwordResetBody: {
    en: en.passwordResetBody,
    fr: fr.passwordResetBody,
    es: es.passwordResetBody,
    de: de.passwordResetBody,
    ar: ar.passwordResetBody
  },
  passwordResetButton: {
    en: en.passwordResetButton,
    fr: fr.passwordResetButton,
    es: es.passwordResetButton,
    de: de.passwordResetButton,
    ar: ar.passwordResetButton
  },
  passwordResetLinkText: {
    en: en.passwordResetLinkText,
    fr: fr.passwordResetLinkText,
    es: es.passwordResetLinkText,
    de: de.passwordResetLinkText,
    ar: ar.passwordResetLinkText
  },
  passwordResetExpiry: {
    en: en.passwordResetExpiry,
    fr: fr.passwordResetExpiry,
    es: es.passwordResetExpiry,
    de: de.passwordResetExpiry,
    ar: ar.passwordResetExpiry
  },
  passwordResetIgnore: {
    en: en.passwordResetIgnore,
    fr: fr.passwordResetIgnore,
    es: es.passwordResetIgnore,
    de: de.passwordResetIgnore,
    ar: ar.passwordResetIgnore
  },
  passwordChangeSubject: {
    en: en.passwordChangeSubject,
    fr: fr.passwordChangeSubject,
    es: es.passwordChangeSubject,
    de: de.passwordChangeSubject,
    ar: ar.passwordChangeSubject
  },
  passwordChangeGreeting: {
    en: en.passwordChangeGreeting,
    fr: fr.passwordChangeGreeting,
    es: es.passwordChangeGreeting,
    de: de.passwordChangeGreeting,
    ar: ar.passwordChangeGreeting
  },
  passwordChangeBody: {
    en: en.passwordChangeBody,
    fr: fr.passwordChangeBody,
    es: es.passwordChangeBody,
    de: de.passwordChangeBody,
    ar: ar.passwordChangeBody
  },
  passwordChangeLoginText: {
    en: en.passwordChangeLoginText,
    fr: fr.passwordChangeLoginText,
    es: es.passwordChangeLoginText,
    de: de.passwordChangeLoginText,
    ar: ar.passwordChangeLoginText
  },
  passwordChangeSecurity: {
    en: en.passwordChangeSecurity,
    fr: fr.passwordChangeSecurity,
    es: es.passwordChangeSecurity,
    de: de.passwordChangeSecurity,
    ar: ar.passwordChangeSecurity
  },
  footerText: {
    en: en.footerText,
    fr: fr.footerText,
    es: es.footerText,
    de: de.footerText,
    ar: ar.footerText
  }
}

export function t(key: string, lang: string = 'en'): string {
  const translation = translations[key]?.[lang] || translations[key]?.['en'] || key
  return translation
}

export function getSupportedLanguages(): string[] {
  return ['en', 'fr', 'es', 'de', 'ar']
}

export function isSupportedLanguage(lang: string): boolean {
  return getSupportedLanguages().includes(lang)
}