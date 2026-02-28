import { HomeAssistant } from 'custom-card-helpers'
import en from './languages/en.json'
import es from './languages/es.json'
import gl from './languages/gl.json'
import fr from './languages/fr.json'
import de from './languages/de.json'
import ca from './languages/ca.json'
import eu from './languages/eu.json'

const languages: Record<string, any> = {
  en,
  es,
  gl,
  fr,
  de,
  ca,
  eu,
}

export function localize(hass: HomeAssistant | undefined, key: string, fallback?: string): string {
  const lang = hass?.language?.split('-')[0] || 'en'

  // Get the language data, fall back to English if not available
  let langData = languages[lang] || languages['en']

  // Handle the case where JSON is wrapped in a default property
  if (langData && 'default' in langData) {
    langData = langData.default
  }

  // Navigate through nested keys (e.g., "config.quick_add")
  const keys = key.split('.')
  let value: any = langData

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      value = undefined
      break
    }
  }

  // If not found in selected language, try English
  if (value === undefined && lang !== 'en') {
    let englishValue: any = languages['en']
    if (englishValue && 'default' in englishValue) {
      englishValue = englishValue.default
    }
    for (const k of keys) {
      if (englishValue && typeof englishValue === 'object' && k in englishValue) {
        englishValue = englishValue[k]
      } else {
        englishValue = undefined
        break
      }
    }
    value = englishValue
  }

  // Return the value, fallback, or key
  if (typeof value === 'string') {
    return value
  }

  return fallback || key
}
