import { defineCustomElement, provide } from "vue"
import type { HomeAssistant } from "custom-card-helpers"

export class VueCustomCard extends HTMLElement {
  private vueElementWrapper:
    | (HTMLElement & { config?: object; hass?: HomeAssistant })
    | null = null
  private config = {}
  protected name = ""
  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }
  private _hass: HomeAssistant | null = null

  set hass(hass) {
    this._hass = hass
    if (this.vueElementWrapper) {
      this.vueElementWrapper.hass = this._hass
    }
  }

  setConfig(config) {
    if (!config) {
      return
    }

    this.config = config
    if (this.vueElementWrapper) {
      this.vueElementWrapper.config = this.config
    }
  }

  createVueApp() {
    this.vueElementWrapper = document.createElement(this.name)
    this.shadowRoot!.appendChild(this.vueElementWrapper)
    this.vueElementWrapper.config = this.config
    this.vueElementWrapper.hass = this._hass
  }

  connectedCallback() {
    if (!this.vueElementWrapper) {
      const app = this.createVueApp()
    }
  }

  disconnectedCallback() {
    if (this.vueElementWrapper) {
      this.shadowRoot!.removeChild(this.vueElementWrapper)
      this.vueElementWrapper = null
    }
  }
}

export const registerVueHassCard = (name: string, vueComponent) => {
  const internalName = `${name}-wrapper`
  const vueCustomElement = defineCustomElement(vueComponent)
  customElements.define(internalName, vueCustomElement)

  ;(window as any).customCards = (window as any).customCards || []
  ;(window as any).customCards.push({
    type: name,
    name,
    description: "Test",
  })

  if (!customElements.get(name)) {
    customElements.define(
      name,
      class VueHassCard extends VueCustomCard {
        name = internalName
      },
    )
  }
}
