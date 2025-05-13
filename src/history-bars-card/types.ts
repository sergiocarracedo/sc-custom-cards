import type { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers'

export interface EntityBarConfig {
  entity: string
  name: string
  icon: string
  color: string
  max?: number
  min?: number

  thresholds?: {
    value: number
    color: string
  }[]
}

export interface ScBarsCardConfig extends LovelaceCardConfig {
  entities: EntityBarConfig[]
  max: number
  tap_action?: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
}
