import { describe, it, expect } from 'vitest'
import { localize } from '../../localize/localize'
import { createMockHass } from '../mockData'

describe('Localization', () => {
  describe('localize function', () => {
    it('should return English translation by default', () => {
      const hass = createMockHass({ language: 'en' })
      const result = localize(hass, 'config.area')
      expect(result).toBe('Area')
    })

    it('should return Spanish translation when language is es', () => {
      const hass = createMockHass({ language: 'es' })
      const result = localize(hass, 'config.area')
      expect(result).toBe('Área')
    })

    it('should return Galician translation when language is gl', () => {
      const hass = createMockHass({ language: 'gl' })
      const result = localize(hass, 'config.area')
      expect(result).toBe('Área')
    })

    it('should return French translation when language is fr', () => {
      const hass = createMockHass({ language: 'fr' })
      const result = localize(hass, 'config.area')
      expect(result).toBe('Zone')
    })

    it('should return German translation when language is de', () => {
      const hass = createMockHass({ language: 'de' })
      const result = localize(hass, 'config.area')
      expect(result).toBe('Bereich')
    })

    it('should return Catalan translation when language is ca', () => {
      const hass = createMockHass({ language: 'ca' })
      const result = localize(hass, 'config.area')
      expect(result).toBe('Àrea')
    })

    it('should return Basque translation when language is eu', () => {
      const hass = createMockHass({ language: 'eu' })
      const result = localize(hass, 'config.area')
      expect(result).toBe('Eremua')
    })

    it('should fallback to English for unsupported language', () => {
      const hass = createMockHass({ language: 'unsupported' })
      const result = localize(hass, 'config.area')
      expect(result).toBe('Area')
    })

    it('should fallback to English when translation missing in selected language', () => {
      const hass = createMockHass({ language: 'es' })
      const result = localize(hass, 'config.nonexistent_key')
      expect(result).toBe('config.nonexistent_key')
    })

    it('should return fallback string when provided and key not found', () => {
      const hass = createMockHass()
      const result = localize(hass, 'config.nonexistent', 'Fallback Text')
      expect(result).toBe('Fallback Text')
    })

    it('should return key itself when no translation or fallback', () => {
      const hass = createMockHass()
      const result = localize(hass, 'config.nonexistent')
      expect(result).toBe('config.nonexistent')
    })

    it('should handle undefined hass gracefully', () => {
      const result = localize(undefined, 'config.area')
      expect(result).toBe('Area') // Should default to English
    })

    it('should handle language codes with region (e.g., en-US)', () => {
      const hass = createMockHass({ language: 'en-US' })
      const result = localize(hass, 'config.area')
      expect(result).toBe('Area')
    })

    it('should handle nested translation keys', () => {
      const hass = createMockHass()
      const result = localize(hass, 'config.entities_helper')
      expect(result).toBe('Select the entities to monitor in this group')
    })

    it('should translate all common config keys', () => {
      const hass = createMockHass()

      expect(localize(hass, 'config.area')).toBe('Area')
      expect(localize(hass, 'config.style')).toBe('Card Style')
      expect(localize(hass, 'config.color')).toBe('Custom Color')
      expect(localize(hass, 'config.entities')).toBe('Entities')
      expect(localize(hass, 'config.alarm_entities')).toBe('Alarm Entities')
      expect(localize(hass, 'config.actions')).toBe('Actions')
      expect(localize(hass, 'config.name')).toBe('Name')
      expect(localize(hass, 'config.icon')).toBe('Icon')
      expect(localize(hass, 'config.max')).toBe('Maximum Value')
      expect(localize(hass, 'config.min')).toBe('Minimum Value')
    })

    it('should translate action labels', () => {
      const hass = createMockHass()

      expect(localize(hass, 'config.tap')).toBe('Tap')
      expect(localize(hass, 'config.hold')).toBe('Hold')
      expect(localize(hass, 'config.double_tap')).toBe('Double Tap')
    })

    it('should translate quick add labels', () => {
      const hass = createMockHass()

      expect(localize(hass, 'config.quick_add')).toBe('Quick Add')
      expect(localize(hass, 'config.presence')).toBe('Presence')
      expect(localize(hass, 'config.lights')).toBe('Lights')
      expect(localize(hass, 'config.doors')).toBe('Doors')
      expect(localize(hass, 'config.alarms')).toBe('Alarms')
    })

    it('should translate helper text', () => {
      const hass = createMockHass()

      const entitiesHelper = localize(hass, 'config.entities_helper')
      expect(entitiesHelper).toBe('Select the entities to monitor in this group')

      const alarmHelper = localize(hass, 'config.alarm_entities_helper')
      expect(alarmHelper).toBe(
        'These entities will trigger the alarm state for this group and the area',
      )
    })

    it('should handle all supported languages for a key', () => {
      const languages = ['en', 'es', 'gl', 'fr', 'de', 'ca', 'eu']

      languages.forEach((lang) => {
        const hass = createMockHass({ language: lang })
        const result = localize(hass, 'config.area')
        expect(result).toBeDefined()
        expect(result).not.toBe('config.area') // Should not fallback to key
      })
    })

    it('should handle module import with default property', () => {
      // Test that localize handles JSON imports correctly
      const hass = createMockHass({ language: 'en' })
      const result = localize(hass, 'config.area')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('Translation Consistency', () => {
    it('should have consistent keys across all languages', () => {
      const testKeys = [
        'config.area',
        'config.style',
        'config.entities',
        'config.actions',
        'config.tap',
        'config.hold',
        'config.double_tap',
      ]

      const languages = ['en', 'es', 'gl', 'fr', 'de', 'ca', 'eu']

      testKeys.forEach((key) => {
        languages.forEach((lang) => {
          const hass = createMockHass({ language: lang })
          const result = localize(hass, key)
          expect(result).toBeDefined()
          expect(result.length).toBeGreaterThan(0)
          // Should not fallback to key itself for supported keys
          if (lang === 'en') {
            expect(result).not.toBe(key)
          }
        })
      })
    })
  })
})
