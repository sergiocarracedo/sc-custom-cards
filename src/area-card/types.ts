import type { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers'

export type EntityTypeSummary = {
  name: string
  icon: string
  entities: string | string[]
  alarm_entities?: string | string[]
  actions?: {
    tap_action?: ActionConfig
    hold_action?: ActionConfig
    double_tap_action?: ActionConfig
  }
  tap_action?: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
}

export type AreaCardStyle = 'header' | 'full'
export type AreaCardVariant = 'default' | 'compact' | 'mini'

export interface ScAreaCardConfig extends LovelaceCardConfig {
  area: string
  _stubPreview?: boolean
  style?: AreaCardStyle
  variant?: AreaCardVariant
  color?: string | number[]
  summary?: EntityTypeSummary | EntityTypeSummary[]
  tap_action?: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
  // Deprecated - kept for migration only
  presence?: string | string[]
  alarm?: string | string[]
  door?: string | string[]
  light?: string | string[]
}

export type RenderProps = {
  areaName: string
  temperature: number | null
  temperatureUnits: string | undefined
  humidity: number | null
  humidityUnits: string | undefined
  areaIcon: string | null
  areaColor: string
  summaryTypes: EntityTypeSummary[]
  style: AreaCardStyle
  variant: AreaCardVariant
  alarmActive?: boolean
  hasAction?: boolean
  actions?: {
    tap_action?: ActionConfig
    hold_action?: ActionConfig
    double_tap_action?: ActionConfig
  }
  stats: Promise<TempHumStatsResult> | null
}

export type TempHumStatsResult = {
  tempHumStats: TempHumStats
  chartMessage: string | null
}

export type TempHumStats = Array<{
  time: Date
  temp: number | undefined
  humidity: number | undefined
}>
