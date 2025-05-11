import { html, LitElement, type TemplateResult, nothing } from "lit"
import { styles } from "./AreaCard.styles.ts"
import { state } from "lit/decorators.js"

import type { HassEntity } from "home-assistant-js-websocket"
import type { HomeAssistant, LovelaceCardConfig } from "custom-card-helpers"

interface Config extends LovelaceCardConfig {
  header: string
  entity: string
}

export class ToggleCardTypeScript extends LitElement {
  // internal reactive states
  @state() private _header: string | typeof nothing
  @state() private _entity: string
  @state() private _name: string
  @state() private _state: HassEntity
  @state() private _status: string

  // private property
  private _hass

  // lifecycle interface
  setConfig(config: Config) {
    this._header = config.header === "" ? nothing : config.header
    this._entity = config.entity
    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass
    }
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass
    this._state = hass.states[this._entity]
    if (this._state) {
      this._status = this._state.state
      const fn = this._state.attributes.friendly_name
      this._name = fn ? fn : this._entity
    }
  }

  // declarative part
  static styles = styles

  render() {
    let content: TemplateResult
    if (!this._state) {
      content = html` <p class="error">${this._entity} is unavailable.</p> `
    } else {
      content = html`
        <dl class="dl">
          <dt class="dt">${this._name}</dt>
          <dd class="dd" @click="${this.doToggle}">
            <span class="toggle ${this._status}">
              <span class="button"></span>
            </span>
            <span class="value">${this._status}</span>
          </dd>
        </dl>
      `
    }
    return html`
      <ha-card header="${this._header}">
        <div class="card-content">${content}</div>
      </ha-card>
    `
  }

  // event handling
  doToggle() {
    this._hass.callService("input_boolean", "toggle", {
      entity_id: this._entity,
    })
  }

  // card configuration
  static getConfigElement() {
    return document.createElement("toggle-card-typescript-editor")
  }

  static getStubConfig() {
    return {
      entity: "input_boolean.tcts",
      header: "",
    }
  }
}
