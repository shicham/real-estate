import fs from 'fs'
import path from 'path'

function loadJsonFile(filename: string): Record<string, string> {
  const candidates = [
    // compiled output (common case when running built code / in Docker)
    path.join(process.cwd(), 'dist', 'lib', 'locales', filename),
    // monorepo layout where dist may be in package subdir
    path.join(process.cwd(), 'backend', 'api-auth', 'dist', 'lib', 'locales', filename),
    // source layout (when running with ts-jest / tsx / node directly from src)
    path.join(process.cwd(), 'src', 'lib', 'locales', filename),
    path.join(process.cwd(), 'backend', 'api-auth', 'src', 'lib', 'locales', filename)
  ]

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8')
      return JSON.parse(content) as Record<string, string>
    }
  }

  // Last-resort: try relative to this file (may work in some runtimes)
  try {
    const relative = path.join(__dirname, 'locales', filename)
    if (fs.existsSync(relative)) {
      const content = fs.readFileSync(relative, 'utf8')
      return JSON.parse(content) as Record<string, string>
    }
  } catch {
    // ignore
  }

  throw new Error(`Locale file not found: ${filename}. Tried: ${candidates.join(', ')}`)
}

const en = loadJsonFile('en.json')
const fr = loadJsonFile('fr.json')
const es = loadJsonFile('es.json')
const de = loadJsonFile('de.json')
const ar = loadJsonFile('ar.json')

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