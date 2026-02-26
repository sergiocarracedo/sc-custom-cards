import type { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers'

export type Action = {
  name: string
  icon: string
  iconColor?: string
  buttonColor?: string
  tap_action?: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
}

export interface ScActionsCardConfig extends LovelaceCardConfig {
  title?: string
  actions?: Action[]
}
