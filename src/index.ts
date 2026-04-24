import './area-card/AreaCard'
import './area-card/AreaCardEditor'
import './history-bars-card'
import './history-bars-card/BarsCardEditor'

import { loadHaComponents } from '@kipk/load-ha-components'
import { logger } from './logger'

declare const __SC_CUSTOM_CARDS_VERSION__: string
declare const __SC_CUSTOM_CARDS_BUILD_DATE__: string

const REQUIRED_HA_COMPONENTS = [
  'ha-alert',
  'ha-button',
  'ha-dialog',
  'ha-entity-picker',
  'ha-form',
  'ha-icon',
  'ha-icon-button',
  'ha-icon-button-prev',
  'ha-icon-picker',
  'ha-select',
  'ha-selector',
  'ha-sortable',
  'ha-svg-icon',
  'ha-textfield',
  'hui-sensor-card',
]

try {
  await loadHaComponents(REQUIRED_HA_COMPONENTS)
} catch (error) {
  logger.warn('Error loading Home Assistant form components:', error)
}

logger.info(`v${__SC_CUSTOM_CARDS_VERSION__} Build: ${__SC_CUSTOM_CARDS_BUILD_DATE__}`)

declare global {
  interface Window {
    customCards: Array<object>
  }
}

window.customCards = window.customCards || []
window.customCards.push({
  type: 'sc-area-card',
  name: 'SC Custom Cards: Area card',
  preview: true,
  description: 'Displays area information with temperature, humidity, and entity status summaries',
  documentationURL: 'https://github.com/sergiocarracedo/sc-custom-cards#sc-area-card',
})

window.customCards.push({
  type: 'sc-bars-card',
  name: 'SC History bars card',
  preview: true,
  description: 'Displays entity values as horizontal bars with color-coded thresholds',
  documentationURL: 'https://github.com/sergiocarracedo/sc-custom-cards#sc-bars-card',
})
