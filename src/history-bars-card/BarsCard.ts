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

  private get isStubPreview(): boolean {
    return this.config?._stubPreview === true
  }

  private renderStubPreview() {
    return html`
      <ha-card class="bars-card bars-card--preview">
        <div class="bars-card__content">
          ${[
            { name: 'Temperature', value: '22.5°C', width: '42%', color: '#ff7043' },
            { name: 'Humidity', value: '45%', width: '58%', color: '#42a5f5' },
          ].map(
            (item) => html`
              <div class="preview-bar">
                <div class="preview-bar__row">
                  <span class="preview-bar__name">${item.name}</span>
                  <span class="preview-bar__value">${item.value}</span>
                </div>
                <div class="preview-bar__track">
                  <span
                    class="preview-bar__fill"
                    style="width: ${item.width}; --preview-color: ${item.color};"
                  ></span>
                </div>
              </div>
            `,
          )}
        </div>
      </ha-card>
    `
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

    if (this.isStubPreview) {
      return this.renderStubPreview()
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
  static getStubConfig() {
    return {
      _stubPreview: true,
      entities: [
        {
          entity: 'sensor.preview_temperature',
          name: 'Temperature',
          icon: 'mdi:thermometer',
          color: '#ff7043',
        },
        {
          entity: 'sensor.preview_humidity',
          name: 'Humidity',
          icon: 'mdi:water-percent',
          color: '#42a5f5',
        },
      ],
      max: 100,
    }
  }

  static getConfigElement() {
    return document.createElement('sc-bars-card-editor')
  }

  static styles = css`
     .bars-card__content {
       padding: 10px;
       display: flex;
       flex-direction: column;
       gap: 10px;
     }

     .bars-card--preview {
       padding: 4px;
     }

     .preview-bar {
       display: flex;
       flex-direction: column;
       gap: 6px;
     }

     .preview-bar__row {
       align-items: center;
       display: flex;
       font-size: 13px;
       justify-content: space-between;
     }

     .preview-bar__name {
       color: var(--primary-text-color);
     }

     .preview-bar__value {
       color: var(--secondary-text-color);
       font-size: 12px;
     }

     .preview-bar__track {
       background: color-mix(in srgb, var(--secondary-text-color) 16%, transparent);
       border-radius: 999px;
       height: 10px;
       overflow: hidden;
     }

     .preview-bar__fill {
       background: linear-gradient(90deg, var(--preview-color), color-mix(in srgb, var(--preview-color) 60%, white));
       border-radius: inherit;
       display: block;
       height: 100%;
     }
   `
}
