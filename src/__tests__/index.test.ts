import { beforeAll, describe, expect, it } from 'vitest'

describe('custom card registration metadata', () => {
  beforeAll(async () => {
    ;(globalThis as any).__SC_CUSTOM_CARDS_VERSION__ = 'test'
    ;(globalThis as any).__SC_CUSTOM_CARDS_BUILD_DATE__ = '2026-04-24T00:00:00.000Z'
    window.customCards = []
    await import('../index')
  })

  it('exposes picker preview metadata for the area card', () => {
    expect(window.customCards).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'sc-area-card', preview: true })]),
    )
  })

  it('exposes picker preview metadata for the bars card', () => {
    expect(window.customCards).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'sc-bars-card', preview: true })]),
    )
  })

  it('uses stub preview metadata so the picker can render mock previews', async () => {
    const { ScAreaCard } = await import('../area-card/AreaCard')
    const { ScBarsCard } = await import('../history-bars-card/BarsCard')

    expect((ScAreaCard as any).getStubConfig()._stubPreview).toBe(true)
    expect((ScBarsCard as any).getStubConfig()._stubPreview).toBe(true)
    expect((ScBarsCard as any).getStubConfig().entities.length).toBeGreaterThan(0)
  })
})
