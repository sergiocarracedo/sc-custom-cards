import type { TemplateResult } from 'lit'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { actionHandler } from '@/action-handler-directive'
import {
  type ActionHandlerEvent,
  handleAction,
  hasAction,
  type HomeAssistant,
} from 'custom-card-helpers'
import { Actions } from '@/types'

type Status = null | number

@customElement('entities-type-status')
export class EntitiesTypeStatus extends LitElement {
  @property({ type: String }) public name: string = ''
  @property({ type: Array }) public entities: string[] = []
  @property({ type: String }) public icon!: string
  @property({ type: String }) public bgColor!: string
  @property({ type: String }) public color!: string
  @property({ type: Number }) public size: number = 36
  @property({ type: Object }) public hass!: HomeAssistant
  @property({ type: Object }) public actions?: Actions

  /**
   * Get the active entities that are on or null no entities to check
   * @private
   */
  private get activeEntities(): string[] {
    return this.entities.filter((entity) => {
      const state = this.hass.states[entity]
      return state && state.state === 'on'
    })
  }

  /**
   * Get the count of active entities
   * @private
   */
  private activeCount(): Status {
    const activeEntities = this.activeEntities
    if (activeEntities === null) {
      return null
    }
    return activeEntities.length
  }

  private handleAction(ev: ActionHandlerEvent) {
    ev.stopPropagation()
    ev.preventDefault()
    if (!this.hass) return
    this.entities.forEach((entity) => {
      handleAction(
        this,
        this.hass,
        {
          entity,
          hold_action: this.actions?.hold_action,
          tap_action: this.actions?.tap_action || { action: 'none' },
          double_tap_action: this.actions?.double_tap_action,
        },
        ev.detail.action,
      )
    })
  }

  private get hasAction(): boolean {
    return (
      hasAction(this.actions?.tap_action) ||
      hasAction(this.actions?.hold_action) ||
      hasAction(this.actions?.double_tap_action)
    )
  }

  protected render(): TemplateResult {
    const title = html`<h3 class="entities-type-status__header">
        ${this.name} (${this.activeCount()})
      </h3>
      <ha-list>
        ${this.activeEntities.map((entity) => {
          const state = this.hass.states[entity]
          return html`<ha-list-item
            >${state ? `${state.attributes.friendly_name}: ${state.state}` : ''}</ha-list-item
          >`
        })}
      </ha-list>`

    return html`<ha-tooltip .content="${title}">
      <div
        class="entities-type-status ${this.activeEntities.length > 0
          ? 'entities-type-status--active'
          : ''} ${this.hasAction ? 'entities-type-status--has-action' : ''}"
        @action=${this.handleAction}
        tabindex="0"
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.actions?.hold_action),
          hasDoubleClick: hasAction(this.actions?.double_tap_action),
        })}
      >
        <div
          class="entities-type-status__icon"
          style="--bg-color: ${this.bgColor}; --color: ${this.color}; --size: ${this
            .size}px; --icon-size: ${this.size / 1.7}px"
        >
          <ha-icon icon="${this.icon}"></ha-icon>
        </div></div
    ></ha-tooltip>`
  }

  static styles = css`
    .entities-type-status {
      opacity: 0.3;
    }

    .entities-type-status--active {
      opacity: 1;
    }

    .entities-type-status--has-action {
      cursor: pointer;
    }

    .entities-type-status--has-action.entities-type-status--active:hover {
      opacity: 0.9;
    }
    .entities-type-status--has-action:hover {
      opacity: 0.4;
    }

    h3.entities-type-status__header {
      margin: 0 0 10px 0;
      padding: 0 16px;
    }
    .entities-type-status__icon {
      border-radius: 9999px;
      background-color: var(--bg-color);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color);
      width: var(--size);
      height: var(--size);
      --mdc-icon-size: var(--icon-size);
    }
  `
}
