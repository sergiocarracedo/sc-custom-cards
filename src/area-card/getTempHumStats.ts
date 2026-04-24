import { cache } from '@/cache'
import { logger } from '@/logger'
import { HomeAssistant } from 'custom-card-helpers/dist/types'
import { TempHumStats, TempHumStatsResult } from './types'

export function getTempHumStats(
  cacheKey: string,
  hass: HomeAssistant,
  tempEntityId: string | null,
  humidityEntityId: string | null,
): Promise<TempHumStatsResult> {
  // Check if we have already retrieved the statistics
  const cachedStats = cache.get<TempHumStats>(cacheKey)
  if (cachedStats) {
    return Promise.resolve({
      tempHumStats: cachedStats,
      chartMessage: cachedStats.length > 0 ? null : 'No historical data available for preview.',
    })
  }

  const d = {
    type: 'recorder/statistics_during_period',
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    end_time: new Date().toISOString(),
    period: '5minute',
    statistic_ids: [tempEntityId, humidityEntityId].filter(Boolean),
  }

  return new Promise((resolve) => {
    type Result = { [x: string]: { start: string; mean: number }[] }
    hass.callWS(d).then(
      (result) => {
        const id = tempEntityId || humidityEntityId
        if (id) {
          const entityStats = (result as Result)[id]
          if (!entityStats) {
            logger.warn(`No statistics found for entity ${id}`)
            const tempHumStats = cache.set(cacheKey, [])
            resolve({
              tempHumStats,
              chartMessage: 'No historical data available for preview.',
            })
            return
          }

          const stats = entityStats.map((d, index) => {
            return {
              time: new Date(d.start),
              temp: tempEntityId ? (result as Result)[tempEntityId][index].mean : undefined,
              humidity: humidityEntityId
                ? (result as Result)[humidityEntityId][index].mean
                : undefined,
            }
          })

          const tempHumStats = cache.set(cacheKey, stats)
          resolve({ tempHumStats, chartMessage: null })
        } else {
          const tempHumStats = cache.set(cacheKey, [])
          resolve({ tempHumStats, chartMessage: null })
        }
      },
      (error) => {
        logger.error(error)
        const tempHumStats = cache.set(cacheKey, [])
        resolve({ tempHumStats, chartMessage: 'Error retrieving historical data.' })
      },
    )
  })
}
