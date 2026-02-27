import { describe, it, expect, beforeEach, vi } from 'vitest'
import '../../area-card/AreaCard'
import { ScAreaCard } from '../../area-card/AreaCard'
import {
  createMockHassWithAreas,
  createMockAreaCardConfig,
  createMockEntitySummary,
  createMockArea,
} from '../mockData'
import { handleAction } from 'custom-card-helpers'

describe('ScAreaCard', () => {
  let element: ScAreaCard
  const mockHass = createMockHassWithAreas()

  beforeEach(async () => {
    element = document.createElement('sc-area-card') as ScAreaCard
    document.body.appendChild(element)
    await element.updateComplete
  })

  describe('Configuration', () => {
    it('should set config correctly', () => {
      const config = createMockAreaCardConfig()
      element.setConfig(config)
      expect(element['_config']).toEqual(config)
    })

    it('should load area when hass is set', () => {
      const config = createMockAreaCardConfig({ area: 'office' })
      element.setConfig(config)
      element.hass = mockHass
      expect(element['area']).toBeDefined()
      expect(element['area']?.name).toBe('Office')
    })

    it('should migrate deprecated preset fields to summaries', () => {
      const config = createMockAreaCardConfig({
        presence: ['binary_sensor.office_motion'],
        light: ['light.office_light'],
        door: ['binary_sensor.office_door'],
        alarm: ['binary_sensor.office_alarm'],
      } as any)

      element.setConfig(config)
      element.hass = mockHass

      const summaries = element['summaryTypes']
      expect(summaries.length).toBeGreaterThan(0)

      const presenceSummary = summaries.find((s) => s.name === 'Presence')
      expect(presenceSummary).toBeDefined()
      expect(presenceSummary?.entities).toContain('binary_sensor.office_motion')

      const alarmSummary = summaries.find((s) => s.name === 'Alarms')
      expect(alarmSummary).toBeDefined()
      expect(alarmSummary?.alarm_entities).toContain('binary_sensor.office_alarm')
    })

    it('should handle single summary as object', () => {
      const singleSummary = createMockEntitySummary()
      const config = createMockAreaCardConfig({ summary: singleSummary })
      element.setConfig(config)
      element.hass = mockHass

      const summaries = element['summaryTypes']
      expect(summaries.length).toBe(1)
      expect(summaries[0]).toMatchObject(singleSummary)
    })

    it('should handle multiple summaries as array', () => {
      const summaries = [
        createMockEntitySummary({ name: 'Summary 1' }),
        createMockEntitySummary({ name: 'Summary 2' }),
      ]
      const config = createMockAreaCardConfig({ summary: summaries })
      element.setConfig(config)
      element.hass = mockHass

      const result = element['summaryTypes']
      expect(result.length).toBe(2)
    })
  })

  describe('Area Color', () => {
    it('should use custom color if provided', () => {
      const config = createMockAreaCardConfig({ color: '#ff0000' })
      element.setConfig(config)
      element.hass = mockHass
      expect(element['areaColor']).toBe('#ff0000')
    })

    it('should use default color if no custom color', () => {
      const config = createMockAreaCardConfig({ color: undefined })
      element.setConfig(config)
      element.hass = mockHass
      const color = element['areaColor']
      expect(color).toBeDefined()
    })
  })

  describe('Alarm Detection', () => {
    it('should detect active alarms', () => {
      const config = createMockAreaCardConfig({
        summary: [
          createMockEntitySummary({
            alarm_entities: ['binary_sensor.office_motion'],
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      const isAlarmActive = element['alarmActive']
      expect(isAlarmActive).toBe(true)
    })

    it('should return false when no alarms are active', () => {
      const config = createMockAreaCardConfig({
        summary: [
          createMockEntitySummary({
            alarm_entities: ['binary_sensor.office_door'],
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      const isAlarmActive = element['alarmActive']
      expect(isAlarmActive).toBe(false)
    })

    it('should handle empty alarm entities', () => {
      const config = createMockAreaCardConfig({
        summary: [createMockEntitySummary({ alarm_entities: [] })],
      })
      element.setConfig(config)
      element.hass = mockHass

      const isAlarmActive = element['alarmActive']
      expect(isAlarmActive).toBe(false)
    })
  })

  describe('Action Handling', () => {
    it('should detect if card has actions', () => {
      const config = createMockAreaCardConfig({
        tap_action: { action: 'more-info' },
      })
      element.setConfig(config)
      element.hass = mockHass

      expect(element['hasAction']).toBe(true)
    })

    it('should return false when no actions are configured', () => {
      const config = createMockAreaCardConfig({
        tap_action: undefined,
        hold_action: undefined,
        double_tap_action: undefined,
      })
      element.setConfig(config)
      element.hass = mockHass

      expect(element['hasAction']).toBe(false)
    })

    it('should handle tap action', () => {
      vi.mocked(handleAction).mockClear()
      const config = createMockAreaCardConfig({
        tap_action: { action: 'more-info' },
      })
      element.setConfig(config)
      element.hass = mockHass

      element['handleAction']({
        detail: { action: 'tap' },
      } as any)

      expect(handleAction).toHaveBeenCalled()
    })
  })

  describe('Rendering', () => {
    it('should render nothing when no config is set', async () => {
      await element.updateComplete
      const shadow = element.shadowRoot
      expect(shadow?.textContent?.trim()).toBe('')
    })

    it('should render error when area is not found', async () => {
      const config = createMockAreaCardConfig({ area: 'nonexistent' })
      element.setConfig(config)
      element.hass = mockHass
      await element.updateComplete

      const error = element.shadowRoot?.querySelector('.error')
      expect(error).toBeDefined()
      expect(error?.textContent).toContain('unavailable')
    })

    it('should render card with area name', async () => {
      const config = createMockAreaCardConfig({ area: 'office' })
      element.setConfig(config)
      element.hass = mockHass
      await element.updateComplete

      const shadow = element.shadowRoot
      expect(shadow?.textContent).toContain('Office')
    })

    it('should render full style by default', async () => {
      const config = createMockAreaCardConfig({ style: 'full' })
      element.setConfig(config)
      element.hass = mockHass
      await element.updateComplete

      const card = element.shadowRoot?.querySelector('ha-card')
      expect(card).toBeDefined()
    })

    it('should render header style', async () => {
      const config = createMockAreaCardConfig({ style: 'header' })
      element.setConfig(config)
      element.hass = mockHass
      await element.updateComplete

      const card = element.shadowRoot?.querySelector('ha-card')
      expect(card).toBeDefined()
    })
  })

  describe('Summary Filtering', () => {
    it('should filter out summaries with no entities', () => {
      const config = createMockAreaCardConfig({
        summary: [
          createMockEntitySummary({ entities: [], alarm_entities: [] }),
          createMockEntitySummary({ entities: ['sensor.test'] }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      const summaries = element['summaryTypes']
      expect(summaries.length).toBe(1)
      expect(summaries[0].entities).toContain('sensor.test')
    })

    it('should include summaries with only alarm entities', () => {
      const config = createMockAreaCardConfig({
        summary: [
          createMockEntitySummary({
            entities: [],
            alarm_entities: ['binary_sensor.alarm'],
          }),
        ],
      })
      element.setConfig(config)
      element.hass = mockHass

      const summaries = element['summaryTypes']
      expect(summaries.length).toBe(1)
    })
  })

  describe('Array Conversion', () => {
    it('should convert single value to array', () => {
      const result = element['toArray']('single-value')
      expect(result).toEqual(['single-value'])
    })

    it('should keep array as is', () => {
      const input = ['value1', 'value2']
      const result = element['toArray'](input)
      expect(result).toEqual(input)
    })

    it('should return empty array for undefined', () => {
      const result = element['toArray'](undefined)
      expect(result).toEqual([])
    })
  })

  describe('Static Methods', () => {
    it('should provide stub config', () => {
      const stubConfig = (ScAreaCard as any).getStubConfig()
      expect(stubConfig).toBeDefined()
      expect(stubConfig.type).toBe('custom:sc-area-card')
      expect(stubConfig.area).toBeDefined()
    })

    it('should provide config element', () => {
      const configElement = (ScAreaCard as any).getConfigElement()
      expect(configElement).toBeDefined()
    })
  })
})
