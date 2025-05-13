import type { TemplateResult } from 'lit'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { HomeAssistant } from 'custom-card-helpers'

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

    return html` <ha-tooltip .content="${title}">
      <div
        class="entities-type-status ${this.activeEntities.length > 0
          ? 'entities-type-status--active'
          : ''}"
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
