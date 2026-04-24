import { beforeEach, describe, expect, it } from 'vitest'
import '../../area-card/TempHumChart'
import { TempHumChart } from '../../area-card/TempHumChart'

describe('TempHumChart', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders a preview-only message when no statistics are available', async () => {
    const element = document.createElement('temp-hum-chart') as TempHumChart
    element.preview = true
    element.stats = Promise.resolve({
      tempHumStats: [],
      chartMessage: 'No historical data available for preview.',
    })
    document.body.appendChild(element)

    await (globalThis as any).flushPromises()
    await element.updateComplete

    const message = element.shadowRoot?.querySelector('.preview-message')

    expect(message).not.toBeNull()
    expect(message?.textContent).toContain('No historical data available for preview.')
  })

  it('does not render the preview message outside config preview', async () => {
    const element = document.createElement('temp-hum-chart') as TempHumChart
    element.preview = false
    element.stats = Promise.resolve({
      tempHumStats: [],
      chartMessage: 'No historical data available for preview.',
    })
    document.body.appendChild(element)

    await (globalThis as any).flushPromises()
    await element.updateComplete

    expect(element.shadowRoot?.querySelector('.preview-message')).toBeNull()
  })

  it('renders the chart when statistics are available', async () => {
    const element = document.createElement('temp-hum-chart') as TempHumChart
    element.preview = true
    element.stats = Promise.resolve({
      tempHumStats: [{ time: new Date('2024-01-01T00:00:00.000Z'), temp: 22.5, humidity: 45 }],
      chartMessage: null,
    })
    document.body.appendChild(element)

    await (globalThis as any).flushPromises()
    await element.updateComplete

    expect((element as any).tempHumStats.length).toBeGreaterThan(0)
    expect(element.shadowRoot?.querySelector('.preview-message')).toBeNull()
  })
})
