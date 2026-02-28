import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import '../../history-bars-card/BarsCardEditor'
import { ScBarsCardEditor } from '../../history-bars-card/BarsCardEditor'
import { createMockHass, createMockBarsCardConfig, createMockEntityBar } from '../mockData'
import { fireEvent } from 'custom-card-helpers'

describe('ScBarsCardEditor', () => {
  let element: ScBarsCardEditor
  const mockHass = createMockHass()

  beforeEach(async () => {
    element = document.createElement('sc-bars-card-editor') as ScBarsCardEditor
    element.hass = mockHass
    document.body.appendChild(element)
    await element.updateComplete
  })

  afterEach(() => {
    document.body.removeChild(element)
    vi.clearAllMocks()
  })

  describe('Configuration', () => {
    it('should set config correctly', () => {
      const config = createMockBarsCardConfig()
      element.setConfig(config)
      expect(element['_config']).toEqual(config)
    })
  })

  describe('Entity Management', () => {
    it('should add entity when entity picker is used', () => {
      vi.mocked(fireEvent).mockClear()
      const config = createMockBarsCardConfig({ entities: [] })
      element.setConfig(config)

      element['_addEntity']({
        detail: { value: 'sensor.new_entity' },
        target: { value: 'sensor.new_entity' },
      } as any)

      expect(fireEvent).toHaveBeenCalledWith(
        element,
        'config-changed',
        expect.objectContaining({
          config: expect.objectContaining({
            entities: expect.arrayContaining([
              expect.objectContaining({
                entity: 'sensor.new_entity',
              }),
            ]),
          }),
        }),
      )
    })

    it('should not add entity when entity picker value is empty', () => {
      vi.mocked(fireEvent).mockClear()
      const config = createMockBarsCardConfig()
      element.setConfig(config)

      element['_addEntity']({
        detail: { value: '' },
      } as any)

      expect(fireEvent).not.toHaveBeenCalled()
    })

    it('should delete entity with confirmation', async () => {
      vi.mocked(fireEvent).mockClear()
      global.confirm = vi.fn(() => true)

      const entity = createMockEntityBar({ name: 'Test Entity' })
      const config = createMockBarsCardConfig({ entities: [entity] })
      element.setConfig(config)

      await element['_deleteEntity'](0)

      expect(global.confirm).toHaveBeenCalledWith(expect.stringContaining('Test Entity'))
      expect(fireEvent).toHaveBeenCalled()
    })

    it('should not delete entity when confirmation is cancelled', async () => {
      vi.mocked(fireEvent).mockClear()
      global.confirm = vi.fn(() => false)

      const config = createMockBarsCardConfig()
      element.setConfig(config)

      await element['_deleteEntity'](0)

      expect(fireEvent).not.toHaveBeenCalled()
    })

    it('should move entity to new position', () => {
      vi.mocked(fireEvent).mockClear()
      const entities = [
        createMockEntityBar({ name: 'First' }),
        createMockEntityBar({ name: 'Second' }),
        createMockEntityBar({ name: 'Third' }),
      ]
      const config = createMockBarsCardConfig({ entities })
      element.setConfig(config)

      element['_moveEntity'](0, 2)

      expect(fireEvent).toHaveBeenCalled()
    })
  })

  describe('Threshold Management', () => {
    it('should add threshold', () => {
      vi.mocked(fireEvent).mockClear()
      const config = createMockBarsCardConfig({ thresholds: [] })
      element.setConfig(config)

      element['_addThreshold']()

      expect(fireEvent).toHaveBeenCalledWith(
        element,
        'config-changed',
        expect.objectContaining({
          config: expect.objectContaining({
            thresholds: expect.arrayContaining([
              expect.objectContaining({
                value: 0,
                color: '#ff0000',
              }),
            ]),
          }),
        }),
      )
    })

    it('should delete threshold with confirmation', async () => {
      vi.mocked(fireEvent).mockClear()
      global.confirm = vi.fn(() => true)

      const config = createMockBarsCardConfig({
        thresholds: [{ value: 50, color: '#ff0000' }],
      })
      element.setConfig(config)

      await element['_deleteThreshold'](0)

      expect(fireEvent).toHaveBeenCalled()
    })

    it('should move threshold to new position', () => {
      vi.mocked(fireEvent).mockClear()
      const thresholds = [
        { value: 0, color: '#00ff00' },
        { value: 50, color: '#ffff00' },
        { value: 75, color: '#ff0000' },
      ]
      const config = createMockBarsCardConfig({ thresholds })
      element.setConfig(config)

      element['_moveThreshold'](0, 2)

      expect(fireEvent).toHaveBeenCalled()
    })
  })

  describe('Editing States', () => {
    it('should enter edit mode for entity', () => {
      const config = createMockBarsCardConfig()
      element.setConfig(config)

      element['_editEntity'](0)
      expect(element['_editingEntityIndex']).toBe(0)
      expect(element['_editingThresholdIndex']).toBeNull()
    })

    it('should enter edit mode for threshold', () => {
      const config = createMockBarsCardConfig({
        thresholds: [{ value: 50, color: '#ff0000' }],
      })
      element.setConfig(config)

      element['_editThreshold'](0)
      expect(element['_editingThresholdIndex']).toBe(0)
      expect(element['_editingEntityIndex']).toBeNull()
    })

    it('should exit edit mode', () => {
      element['_editingEntityIndex'] = 0
      element['_goBack']()
      expect(element['_editingEntityIndex']).toBeNull()
    })
  })

  describe('Value Updates', () => {
    it('should update main config values', () => {
      vi.mocked(fireEvent).mockClear()
      const config = createMockBarsCardConfig()
      element.setConfig(config)

      element['_valueChanged']({
        detail: { value: { max: 200 } },
      } as any)

      expect(fireEvent).toHaveBeenCalledWith(
        element,
        'config-changed',
        expect.objectContaining({
          config: expect.objectContaining({
            max: 200,
          }),
        }),
      )
    })

    it('should update entity when editing', () => {
      vi.mocked(fireEvent).mockClear()
      const entity = createMockEntityBar()
      const config = createMockBarsCardConfig({ entities: [entity] })
      element.setConfig(config)
      element['_editingEntityIndex'] = 0

      const updatedEntity = { ...entity, name: 'Updated' }
      element['_entityChanged']({
        detail: { value: updatedEntity },
      } as any)

      expect(fireEvent).toHaveBeenCalled()
    })

    it('should not update entity if not in editing mode', () => {
      vi.mocked(fireEvent).mockClear()
      element['_editingEntityIndex'] = null

      element['_entityChanged']({
        detail: { value: {} },
      } as any)

      expect(fireEvent).not.toHaveBeenCalled()
    })

    it('should update threshold when editing', () => {
      vi.mocked(fireEvent).mockClear()
      const config = createMockBarsCardConfig({
        thresholds: [{ value: 50, color: '#ff0000' }],
      })
      element.setConfig(config)
      element['_editingThresholdIndex'] = 0

      element['_thresholdChanged']({
        detail: { value: { value: 75, color: '#00ff00' } },
      } as any)

      expect(fireEvent).toHaveBeenCalled()
    })
  })

  describe('Drag and Drop', () => {
    it('should handle drag start', () => {
      const event = {
        dataTransfer: {
          setData: vi.fn(),
        },
      } as any

      element['_handleDragStart'](event, 1, 'entity')

      expect(event.dataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        JSON.stringify({ index: 1, type: 'entity' }),
      )
    })

    it('should handle drag over', () => {
      const event = {
        preventDefault: vi.fn(),
      } as any

      element['_handleDragOver'](event)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should handle drop for entities', () => {
      vi.mocked(fireEvent).mockClear()
      const entities = [createMockEntityBar(), createMockEntityBar()]
      const config = createMockBarsCardConfig({ entities })
      element.setConfig(config)

      const event = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn(() => JSON.stringify({ index: 0, type: 'entity' })),
        },
      } as any

      element['_handleDrop'](event, 1, 'entity')

      expect(event.preventDefault).toHaveBeenCalled()
      expect(fireEvent).toHaveBeenCalled()
    })

    it('should not handle drop for mismatched types', () => {
      vi.mocked(fireEvent).mockClear()
      const config = createMockBarsCardConfig()
      element.setConfig(config)

      const event = {
        preventDefault: vi.fn(),
        dataTransfer: {
          getData: vi.fn(() => JSON.stringify({ index: 0, type: 'threshold' })),
        },
      } as any

      element['_handleDrop'](event, 1, 'entity')

      expect(fireEvent).not.toHaveBeenCalled()
    })
  })

  describe('Rendering', () => {
    it('should render main view by default', async () => {
      const config = createMockBarsCardConfig()
      element.setConfig(config)
      await element.updateComplete

      expect(element['_editingEntityIndex']).toBeNull()
      expect(element['_editingThresholdIndex']).toBeNull()
    })

    it('should render entity editor when editing entity', async () => {
      const config = createMockBarsCardConfig()
      element.setConfig(config)
      element['_editingEntityIndex'] = 0
      await element.updateComplete

      expect(element['_editingEntityIndex']).toBe(0)
    })

    it('should render threshold editor when editing threshold', async () => {
      const config = createMockBarsCardConfig({
        thresholds: [{ value: 50, color: '#ff0000' }],
      })
      element.setConfig(config)
      element['_editingThresholdIndex'] = 0
      await element.updateComplete

      expect(element['_editingThresholdIndex']).toBe(0)
    })

    it('should go back when entity no longer exists', async () => {
      const config = createMockBarsCardConfig({ entities: [] })
      element.setConfig(config)
      element['_editingEntityIndex'] = 5
      await element.updateComplete

      expect(element['_editingEntityIndex']).toBeNull()
    })

    it('should go back when threshold no longer exists', async () => {
      const config = createMockBarsCardConfig({ thresholds: [] })
      element.setConfig(config)
      element['_editingThresholdIndex'] = 5
      await element.updateComplete

      expect(element['_editingThresholdIndex']).toBeNull()
    })
  })
})
