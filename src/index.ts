import './area-card/AreaCard'
import './area-card/AreaCardEditor'
import './history-bars-card'
import './history-bars-card/BarsCardEditor'

import { DEFAULT_HA_COMPONENTS, loadHaComponents } from '@kipk/load-ha-components'

await loadHaComponents([...DEFAULT_HA_COMPONENTS, 'hui-sensor-card'])

declare global {
  interface Window {
    customCards: Array<object>
  }
}

window.customCards = window.customCards || []
window.customCards.push({
  type: 'sc-area-card',
  name: 'Area card',
  description: 'Displays area information with temperature, humidity, and entity status summaries',
  documentationURL: 'https://github.com/sergiocarracedo/sc-custom-cards#sc-area-card',
})

window.customCards.push({
  type: 'sc-bars-card',
  name: 'History bars card',
  description: 'Displays entity values as horizontal bars with color-coded thresholds',
  documentationURL: 'https://github.com/sergiocarracedo/sc-custom-cards#sc-bars-card',
})
