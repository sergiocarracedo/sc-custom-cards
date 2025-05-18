import { css, html, LitElement, nothing } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { customElement, state } from 'lit/decorators.js'
import { type ActionHandlerEvent, handleAction, type HomeAssistant } from 'custom-card-helpers'
import type { ScBarsCardConfig } from './types'
import './EntityBar.ts'

@customElement('sc-bars-card')
export class ScBarsCard extends LitElement {
  // internal reactive states
  @state() private config?: ScBarsCardConfig

  // private property
  @state() private _hass!: HomeAssistant

  // lifecycle interface
  setConfig(config: ScBarsCardConfig) {
    this.config = config

    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass
    }
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass
  }

  get hass(): HomeAssistant {
    return this._hass
  }

  private handleAction(ev: ActionHandlerEvent) {
    if (!this.config || !this._hass) return
    handleAction(
      this,
      this._hass,
      {
        hold_action: this.config.hold_action,
        tap_action: this.config.tap_action,
        double_tap_action: this.config.double_tap_action,
      },
      ev.detail.action,
    )
  }

  render() {
    if (!this.config) {
      return nothing
    }

    const classes = {
      'bars-card': true,
    }

    return html`
      <ha-card class="${classMap(classes)}">
        <div class="bars-card__content">
          ${this.config.entities.map((entity) => {
            return html`
              <entity-bar
                .hass=${this.hass}
                .config=${entity}
                @action=${this.handleAction}
                .max=${this.config?.max}
                .defaultThresholds=${this.config?.thresholds}
              ></entity-bar>
            `
          })}
        </div>
      </ha-card>
    `
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('sc-bars-card-editor')
  }

  static getStubConfig() {
    return {}
  }

  static styles = css`
    .bars-card__content {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `
}
