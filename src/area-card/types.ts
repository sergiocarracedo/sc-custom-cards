import type { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers'

export type EntityTypeSummary = {
  name: string
  icon: string
  entities: string | string[]
  alarm_entities?: string | string[]
  tap_action?: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
}

export interface ScAreaCardConfig extends LovelaceCardConfig {
  area: string
  style?: 'header' | 'full'
  color?: string
  presence?: string | string[]
  alarm?: string | string[]
  door?: string | string[]
  light?: string | string[]
  summary?: EntityTypeSummary | EntityTypeSummary[]
  tap_action?: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
}
