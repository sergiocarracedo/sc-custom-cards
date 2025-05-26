import type { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers'

export interface Threshold {
  value: number
  color: string
}

export interface EntityBarConfig {
  entity: string
  name: string
  icon: string
  color: string
  max?: number
  min?: number
  tap_action?: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
  thresholds?: Threshold[]
}

export interface ScBarsCardConfig extends LovelaceCardConfig {
  entities: EntityBarConfig[]
  max: number
  thresholds?: Threshold[]
  tap_action?: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
}
