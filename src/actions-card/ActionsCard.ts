import {
  type ActionHandlerEvent,
  handleAction,
  hasAction,
  type HomeAssistant,
} from 'custom-card-helpers'
import { css, html, LitElement, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { ScActionsCardConfig } from './types.ts'

@customElement('sc-actions-card')
export class ScActionsCard extends LitElement {
  // internal reactive states
  @state() private _config?: ScActionsCardConfig

  // private property
  @state() private _hass!: HomeAssistant

  // lifecycle interface
  setConfig(config: ScActionsCardConfig) {
    this._config = config

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
    if (!this._config || !this._hass) return
    handleAction(
      this,
      this._hass,
      {
        hold_action: this._config.hold_action,
        tap_action: this._config.tap_action,
        double_tap_action: this._config.double_tap_action,
      },
      ev.detail.action,
    )
  }

  private get hasAction(): boolean {
    return (
      hasAction(this._config?.tap_action) ||
      hasAction(this._config?.hold_action) ||
      hasAction(this._config?.double_tap_action)
    )
  }

  render() {
    if (!this._config) {
      return nothing
    }

    // @action=${this.handleAction}
    //     .actionHandler=${actionHandler({
    //       hasHold: hasAction(this._config.hold_action),
    //       hasDoubleClick: hasAction(this._config.double_tap_action),
    //     })}

    return html`
      <ha-card .title="${this._config.title || ''}" tabindex="0">
        ${(this._config.actions || []).map((action) => {
          return html` <button
            class="action-button"
            style="background-color: ${action.buttonColor || 'var(--primary-color)'}"
            @click="${(ev: MouseEvent) => {
              if (!this._hass) return
              this.handleAction({
                detail: {
                  action: 'tap',
                },
                target: ev.target as HTMLElement,
              })
            }}"
          >
            <ha-icon
              .icon="${action.icon}"
              style="color: ${action.iconColor || 'var(--primary-text-color)'}"
            ></ha-icon>
            ${action.name}
          </button>`
        })}
      </ha-card>
    `
  }

  // card configuration
  static getStubConfig() {
    return {
      title: 'Actions',
      actions: [],
    }
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        {
          name: 'actions',
          type: 'array',
          required: true,
          schema: [
            { name: 'name', required: true, selector: { text: {} } },
            { name: 'icon', selector: { icon: {} } },
            { name: 'iconColor', selector: { color_rgb: {} } },
            { name: 'buttonColor', selector: { color_rgb: {} } },
            { name: 'tap_action', selector: { ui_action: {} } },
            { name: 'hold_action', selector: { ui_action: {} } },
            { name: 'double_tap_action', selector: { ui_action: {} } },
          ],
        },
      ],
    }
  }

  static styles = css`
    .area-card {
    }
  `
}
