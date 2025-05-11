import './area-card/AreaCard'

import { loadHaComponents, DEFAULT_HA_COMPONENTS } from '@kipk/load-ha-components'
await loadHaComponents([...DEFAULT_HA_COMPONENTS, 'hui-sensor-card'])

declare global {
  interface Window {
    customCards: Array<Object>
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
