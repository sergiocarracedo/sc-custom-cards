import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import '../../area-card/AreaCardEditor'
import { ScAreaCardEditor } from '../../area-card/AreaCardEditor'
import {
  createMockHassWithAreas,
  createMockAreaCardConfig,
  createMockEntitySummary,
} from '../mockData'
import { fireEvent } from 'custom-card-helpers'

describe('ScAreaCardEditor', () => {
  let element: ScAreaCardEditor
  const mockHass = createMockHassWithAreas()

  beforeEach(async () => {
    element = document.createElement('sc-area-card-editor') as ScAreaCardEditor
    element.hass = mockHass
    document.body.appendChild(element)
    await element.updateComplete
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  describe('Configuration', () => {
    it('should set config correctly', () => {
      const config = createMockAreaCardConfig()
      element.setConfig(config)
      expect(element['_config']).toBeDefined()
    })

    it('should migrate preset fields when setting config', () => {
      const config = createMockAreaCardConfig({
        presence: ['binary_sensor.motion'],
        light: ['light.test'],
      } as any)

      element.setConfig(config)

      const summaries = element['_summaryList']
      expect(summaries.length).toBeGreaterThan(0)

      // Config should not have deprecated fields
      expect(element['_config']?.presence).toBeUndefined()
      expect(element['_config']?.light).toBeUndefined()
    })
  })

  describe('Summary Management', () => {
    it('should add new summary', () => {
      vi.mocked(fireEvent).mockClear()
      const config = createMockAreaCardConfig({ summary: [] })
      element.setConfig(config)

      element['_addSummary']()

      expect(fireEvent).toHaveBeenCalledWith(
        element,
        'config-changed',
        expect.objectContaining({
          config: expect.objectContaining({
            summary: expect.arrayContaining([
              expect.objectContaining({
                name: 'New Summary',
                icon: 'mdi:help-circle',
              }),
            ]),
          }),
        }),
      )
    })

    it('should delete summary with confirmation', async () => {
      vi.mocked(fireEvent).mockClear()
      global.confirm = vi.fn(() => true)

      const summary = createMockEntitySummary({ name: 'Test Summary' })
      const config = createMockAreaCardConfig({ summary: [summary] })
      element.setConfig(config)

      await element['_deleteSummary'](0)

      expect(fireEvent).toHaveBeenCalledWith(
        element,
        'config-changed',
        expect.objectContaining({
          config: expect.objectContaining({
            summary: [],
          }),
        }),
      )
    })

    it('should not delete summary when confirmation is cancelled', async () => {
      vi.mocked(fireEvent).mockClear()
      global.confirm = vi.fn(() => false)

      const summary = createMockEntitySummary()
      const config = createMockAreaCardConfig({ summary: [summary] })
      element.setConfig(config)

      await element['_deleteSummary'](0)

      expect(fireEvent).not.toHaveBeenCalled()
    })

    it('should quick add presence summary', () => {
      vi.mocked(fireEvent).mockClear()
      const config = createMockAreaCardConfig({ summary: [] })
      element.setConfig(config)

      element['_quickAddSummary']('presence')

      expect(fireEvent).toHaveBeenCalledWith(
        element,
        'config-changed',
        expect.objectContaining({
          config: expect.objectContaining({
            summary: expect.arrayContaining([
              expect.objectContaining({
                name: 'Presence',
                icon: 'mdi:account-multiple',
              }),
            ]),
          }),
        }),
      )
    })

    it('should quick add alarm summary with alarm entities', () => {
      vi.mocked(fireEvent).mockClear()
      const config = createMockAreaCardConfig({ summary: [] })
      element.setConfig(config)

      element['_quickAddSummary']('alarm')

      expect(fireEvent).toHaveBeenCalledWith(
        element,
        'config-changed',
        expect.objectContaining({
          config: expect.objectContaining({
            summary: expect.arrayContaining([
              expect.objectContaining({
                name: 'Alarms',
                icon: 'mdi:alarm-bell',
              }),
            ]),
          }),
        }),
      )
    })

    it('should move summary to new position', () => {
      vi.mocked(fireEvent).mockClear()
      const summaries = [
        createMockEntitySummary({ name: 'First' }),
        createMockEntitySummary({ name: 'Second' }),
        createMockEntitySummary({ name: 'Third' }),
      ]
      const config = createMockAreaCardConfig({ summary: summaries })
      element.setConfig(config)

      element['_moveSummary'](0, 2)

      expect(fireEvent).toHaveBeenCalledWith(
        element,
        'config-changed',
        expect.objectContaining({
          config: expect.objectContaining({
            summary: [
              expect.objectContaining({ name: 'Second' }),
              expect.objectContaining({ name: 'Third' }),
              expect.objectContaining({ name: 'First' }),
            ],
          }),
        }),
      )
    })
  })

  describe('Summary Editing', () => {
    it('should enter edit mode for summary', () => {
      const summary = createMockEntitySummary()
      const config = createMockAreaCardConfig({ summary: [summary] })
      element.setConfig(config)

      element['_editSummary'](0)
      expect(element['_editingSummaryIndex']).toBe(0)
    })

    it('should exit edit mode', () => {
      element['_editingSummaryIndex'] = 0
      element['_goBack']()
      expect(element['_editingSummaryIndex']).toBeNull()
    })

    it('should update summary when editing', () => {
      vi.mocked(fireEvent).mockClear()
      const summary = createMockEntitySummary({ name: 'Original' })
      const config = createMockAreaCardConfig({ summary: [summary] })
      element.setConfig(config)
      element['_editingSummaryIndex'] = 0

      const updatedSummary = { ...summary, name: 'Updated' }
      element['_summaryChanged']({
        detail: { value: updatedSummary },
      } as any)

      expect(fireEvent).toHaveBeenCalledWith(
        element,
        'config-changed',
        expect.objectContaining({
          config: expect.objectContaining({
            summary: [expect.objectContaining({ name: 'Updated' })],
          }),
        }),
      )
    })

    it('should not update if not in editing mode', () => {
      vi.mocked(fireEvent).mockClear()
      element['_editingSummaryIndex'] = null

      element['_summaryChanged']({
        detail: { value: {} },
      } as any)

      expect(fireEvent).not.toHaveBeenCalled()
    })
  })

  describe('Value Changes', () => {
    it('should handle main form value changes', () => {
      vi.mocked(fireEvent).mockClear()
      const config = createMockAreaCardConfig()
      element.setConfig(config)

      element['_valueChanged']({
        detail: { value: { color: '#ff0000' } },
      } as any)

      expect(fireEvent).toHaveBeenCalledWith(
        element,
        'config-changed',
        expect.objectContaining({
          config: expect.objectContaining({
            color: '#ff0000',
          }),
        }),
      )
    })
  })

  describe('Drag and Drop', () => {
    it('should handle drag start', () => {
      const event = {
        dataTransfer: {
          setData: vi.fn(),
        },
      } as any

      element['_handleDragStart'](event, 1)

      expect(event.dataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        JSON.stringify({ index: 1 }),
      )
    })

    it('should handle drag over', () => {
      const event = {
        preventDefault: vi.fn(),
      } as any

      element['_handleDragOver'](event)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should handle drop and reorder summaries', () => {
      vi.mocked(fireEvent).mockClear()
      const summaries = [
        createMockEntitySummary({ name: 'First' }),
        createMockEntitySummary({ name: 'Second' }),
      ]
      const config = createMockAreaCardConfig({ summary: summaries })
      element.setConfig(config)

      const event = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn(() => JSON.stringify({ index: 0 })),
        },
      } as any

      element['_handleDrop'](event, 1)

      expect(event.preventDefault).toHaveBeenCalled()
      expect(fireEvent).toHaveBeenCalled()
    })
  })

  describe('Array Utilities', () => {
    it('should convert single value to array', () => {
      const result = element['_toArray']('single')
      expect(result).toEqual(['single'])
    })

    it('should keep array as is', () => {
      const input = ['value1', 'value2']
      const result = element['_toArray'](input)
      expect(result).toEqual(input)
    })

    it('should return empty array for undefined', () => {
      const result = element['_toArray'](undefined)
      expect(result).toEqual([])
    })
  })

  describe('Summary List Getter', () => {
    it('should return array when summary is array', () => {
      const summaries = [createMockEntitySummary(), createMockEntitySummary()]
      const config = createMockAreaCardConfig({ summary: summaries })
      element.setConfig(config)

      const result = element['_summaryList']
      expect(result).toEqual(summaries)
    })

    it('should wrap single summary in array', () => {
      const summary = createMockEntitySummary()
      const config = createMockAreaCardConfig({ summary: summary as any })
      element.setConfig(config)

      const result = element['_summaryList']
      expect(result).toEqual([summary])
    })

    it('should return empty array when no summary', () => {
      const config = createMockAreaCardConfig({ summary: undefined })
      element.setConfig(config)

      const result = element['_summaryList']
      expect(result).toEqual([])
    })
  })

  describe('Rendering', () => {
    it('should render main view by default', async () => {
      const config = createMockAreaCardConfig()
      element.setConfig(config)
      await element.updateComplete

      expect(element['_editingSummaryIndex']).toBeNull()
    })

    it('should render summary editor when editing', async () => {
      const config = createMockAreaCardConfig({
        summary: [createMockEntitySummary()],
      })
      element.setConfig(config)
      element['_editingSummaryIndex'] = 0
      await element.updateComplete

      // Should render summary editor view
      expect(element['_editingSummaryIndex']).toBe(0)
    })

    it('should go back when summary no longer exists', async () => {
      const config = createMockAreaCardConfig({ summary: [] })
      element.setConfig(config)
      element['_editingSummaryIndex'] = 5 // Non-existent index
      await element.updateComplete

      // Should auto-navigate back
      expect(element['_editingSummaryIndex']).toBeNull()
    })
  })

  describe('Migration Logic', () => {
    it('should migrate all preset types', () => {
      const config = createMockAreaCardConfig({
        presence: 'sensor.presence',
        alarm: ['sensor.alarm1', 'sensor.alarm2'],
        door: 'sensor.door',
        light: ['light.1', 'light.2'],
      } as any)

      element.setConfig(config)

      const summaries = element['_summaryList']
      expect(summaries.length).toBe(4)

      expect(summaries.find((s) => s.name === 'Presence')).toBeDefined()
      expect(summaries.find((s) => s.name === 'Alarms')).toBeDefined()
      expect(summaries.find((s) => s.name === 'Doors')).toBeDefined()
      expect(summaries.find((s) => s.name === 'Lights')).toBeDefined()
    })

    it('should not create migration summaries for empty preset fields', () => {
      const config = createMockAreaCardConfig({
        presence: [],
        alarm: undefined,
      } as any)

      element.setConfig(config)

      const summaries = element['_summaryList']
      const presetSummaries = summaries.filter(
        (s) =>
          s.name === 'Presence' || s.name === 'Alarms' || s.name === 'Doors' || s.name === 'Lights',
      )
      expect(presetSummaries.length).toBe(0)
    })
  })
})
