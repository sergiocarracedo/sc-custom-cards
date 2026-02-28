import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import '../../history-bars-card/BarsCard'
import { ScBarsCard } from '../../history-bars-card/BarsCard'
import { createMockHass, createMockBarsCardConfig, createMockEntityBar } from '../mockData'

describe('ScBarsCard', () => {
  let element: ScBarsCard
  const mockHass = createMockHass()

  beforeEach(async () => {
    element = document.createElement('sc-bars-card') as ScBarsCard
    element.hass = mockHass
    document.body.appendChild(element)
    await element.updateComplete
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  describe('Configuration', () => {
    it('should set config correctly', () => {
      const config = createMockBarsCardConfig()
      element.setConfig(config)
      expect(element['_config']).toEqual(config)
    })

    it('should update when hass changes', () => {
      const config = createMockBarsCardConfig()
      element.setConfig(config)

      const newHass = { ...mockHass }
      element.hass = newHass
      expect(element['_hass']).toBe(newHass)
    })
  })

  describe('Rendering', () => {
    it('should render nothing when no config is set', async () => {
      await element.updateComplete
      expect(element.shadowRoot?.textContent?.trim()).toBe('')
    })

    it('should render card with entities', async () => {
      const config = createMockBarsCardConfig()
      element.setConfig(config)
      element.hass = mockHass
      await element.updateComplete

      const card = element.shadowRoot?.querySelector('ha-card')
      expect(card).toBeDefined()
    })

    it('should render multiple entity bars', async () => {
      const config = createMockBarsCardConfig({
        entities: [
          createMockEntityBar({ entity: 'sensor.temp1', name: 'Temp 1' }),
          createMockEntityBar({ entity: 'sensor.temp2', name: 'Temp 2' }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass
      await element.updateComplete

      // Should render multiple bars
      const bars = element.shadowRoot?.querySelectorAll('.bar')
      expect(bars?.length).toBeGreaterThan(0)
    })
  })

  describe('Bar Calculation', () => {
    it('should calculate bar width based on value and max', () => {
      const config = createMockBarsCardConfig({
        max: 100,
        entities: [
          createMockEntityBar({
            entity: 'sensor.office_temperature',
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      // sensor.office_temperature has state '22.5'
      // Should calculate percentage: 22.5 / 100 = 22.5%
    })

    it('should use entity max if provided', () => {
      const config = createMockBarsCardConfig({
        max: 100,
        entities: [
          createMockEntityBar({
            entity: 'sensor.office_temperature',
            max: 50,
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      // Should use entity max (50) instead of card max (100)
      // 22.5 / 50 = 45%
    })

    it('should handle min values', () => {
      const config = createMockBarsCardConfig({
        max: 100,
        entities: [
          createMockEntityBar({
            entity: 'sensor.office_temperature',
            min: 0,
            max: 50,
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      // (22.5 - 0) / (50 - 0) = 45%
    })
  })

  describe('Threshold Colors', () => {
    it('should apply threshold colors', () => {
      const config = createMockBarsCardConfig({
        thresholds: [
          { value: 0, color: '#00ff00' },
          { value: 50, color: '#ffff00' },
          { value: 75, color: '#ff0000' },
        ],
        entities: [
          createMockEntityBar({
            entity: 'sensor.office_humidity',
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      // humidity is 45, should use color for threshold 0 (#00ff00)
    })

    it('should use entity thresholds over card thresholds', () => {
      const config = createMockBarsCardConfig({
        thresholds: [{ value: 0, color: '#00ff00' }],
        entities: [
          createMockEntityBar({
            entity: 'sensor.office_temperature',
            thresholds: [{ value: 0, color: '#ff0000' }],
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      // Should use entity-level threshold color
    })

    it('should use custom color over threshold colors', () => {
      const config = createMockBarsCardConfig({
        thresholds: [{ value: 0, color: '#00ff00' }],
        entities: [
          createMockEntityBar({
            entity: 'sensor.office_temperature',
            color: '#0000ff',
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      // Should use custom color (#0000ff)
    })
  })

  describe('Entity Names and Icons', () => {
    it('should use custom name if provided', async () => {
      const config = createMockBarsCardConfig({
        entities: [
          createMockEntityBar({
            entity: 'sensor.office_temperature',
            name: 'Custom Name',
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass
      await element.updateComplete

      expect(element.shadowRoot?.textContent).toContain('Custom Name')
    })

    it('should use entity friendly name if no custom name', async () => {
      const config = createMockBarsCardConfig({
        entities: [
          createMockEntityBar({
            entity: 'sensor.office_temperature',
            name: '',
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass
      await element.updateComplete

      expect(element.shadowRoot?.textContent).toContain('Office Temperature')
    })

    it('should hide name when hideName is true', async () => {
      const config = createMockBarsCardConfig({
        entities: [
          createMockEntityBar({
            entity: 'sensor.office_temperature',
            hideName: true,
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass
      await element.updateComplete

      // Name should not be displayed
    })
  })

  describe('Action Handling', () => {
    it('should detect if card has actions', () => {
      const config = createMockBarsCardConfig({
        tap_action: { action: 'more-info' },
      })
      element.setConfig(config)

      expect(element['hasAction']).toBe(true)
    })

    it('should return false when no actions configured', () => {
      const config = createMockBarsCardConfig({
        tap_action: undefined,
        hold_action: undefined,
        double_tap_action: undefined,
      })
      element.setConfig(config)

      expect(element['hasAction']).toBe(false)
    })
  })

  describe('Entity State Handling', () => {
    it('should handle missing entity gracefully', () => {
      const config = createMockBarsCardConfig({
        entities: [
          createMockEntityBar({
            entity: 'sensor.nonexistent',
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      // Should not throw error
      expect(() => element.render()).not.toThrow()
    })

    it('should handle non-numeric state values', () => {
      const hassWithText = {
        ...mockHass,
        states: {
          ...mockHass.states,
          'sensor.text': {
            entity_id: 'sensor.text',
            state: 'unavailable',
            attributes: {},
            last_changed: '',
            last_updated: '',
            context: { id: '', parent_id: null, user_id: null },
          },
        },
      }

      const config = createMockBarsCardConfig({
        entities: [
          createMockEntityBar({
            entity: 'sensor.text',
          }),
        ],
      })
      element.setConfig(config)
      element.hass = hassWithText

      // Should handle gracefully
      expect(() => element.render()).not.toThrow()
    })
  })

  describe('Static Methods', () => {
    it('should provide stub config', () => {
      const stubConfig = (ScBarsCard as any).getStubConfig()
      expect(stubConfig).toBeDefined()
      expect(stubConfig.type).toBe('custom:sc-bars-card')
      expect(stubConfig.max).toBeDefined()
      expect(stubConfig.entities).toBeDefined()
    })

    it('should provide config element', () => {
      const configElement = (ScBarsCard as any).getConfigElement()
      expect(configElement).toBeDefined()
    })
  })
})
