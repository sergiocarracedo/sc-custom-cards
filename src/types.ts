import { ActionConfig } from 'custom-card-helpers'

export interface Area {
  aliases: string[]
  area_id: string
  created_at: number
  floor_id: string | null
  humidity_entity_id: string | null
  icon: string | null
  labels: string[]
  modified_at: number
  name: string
  picture: string | null
  temperature_entity_id: string | null
}

export interface Actions {
  tap_action?: ActionConfig
  hold_action?: ActionConfig
  double_tap_action?: ActionConfig
}
