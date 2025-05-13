import './area-card/AreaCard'
import './history-bars-card'

import { DEFAULT_HA_COMPONENTS, loadHaComponents } from '@kipk/load-ha-components'

await loadHaComponents([...DEFAULT_HA_COMPONENTS, 'hui-sensor-card'])

declare global {
  interface Window {
    customCards: Array<object>
  }
}

// customElements.define(
//   "toggle-card-typescript-editor",
//   ToggleCardTypeScriptEditor,
// );

window.customCards = window.customCards || []
window.customCards.push({
  type: 'sc-area-card',
  name: 'Area card',
  description: 'Area card',
})

window.customCards.push({
  type: 'sc-bars-card',
  name: 'History bars card',
  description: 'Bars cards with history graphs',
})
