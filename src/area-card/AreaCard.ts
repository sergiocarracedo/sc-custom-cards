import { actionHandler } from '@/action-handler-directive'
import { areaColors } from '@/area-colors'
import type { Area } from '@/types.ts'
import { toArray } from '@/utils'
import {
  type ActionHandlerEvent,
  handleAction,
  hasAction,
  type HomeAssistant,
} from 'custom-card-helpers'
import { css, html, LitElement, nothing, type TemplateResult } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import '../components/Icon.ts'
import './EntityTypeStatus.ts'
import './TempHum.ts'
import './TempHumChart.ts'
import type { EntityTypeSummary, ScAreaCardConfig } from './types.ts'

const VARIANT_SIZES = {
  default: {
    titleFontSize: 20,
    titleFontSizeHeader: 30,
    tempFontSize: 28,
    humFontSize: 15,
    areaIconSize: 100,
    areaIconIconSize: 40,
    summaryIconSize: 36,
    statusGap: 10,
    iconLeft: -10,
    iconBottom: -10,
  },
  compact: {
    titleFontSize: 16,
    titleFontSizeHeader: 24,
    tempFontSize: 22,
    humFontSize: 12,
    areaIconSize: 75,
    areaIconIconSize: 32,
    summaryIconSize: 30,
    statusGap: 7,
    iconLeft: -7,
    iconBottom: -7,
  },
  mini: {
    titleFontSize: 14,
    titleFontSizeHeader: 22,
    tempFontSize: 18,
    humFontSize: 11,
    areaIconSize: 60,
    areaIconIconSize: 26,
    summaryIconSize: 26,
    statusGap: 5,
    iconLeft: -5,
    iconBottom: -5,
  },
}

@customElement('sc-area-card')
export class ScAreaCard extends LitElement {
  // internal reactive states
  @state() private _config?: ScAreaCardConfig
  @state() private area?: Area

  // private property
  @state() private _hass!: HomeAssistant & { areas: Record<string, Area> }

  private toArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) {
      return []
    }
    return Array.isArray(value) ? value : [value]
  }

  // lifecycle interface
  setConfig(config: ScAreaCardConfig) {
    this._config = config

    // call set hass() to immediately adjust to a changed entity
    // while editing the entity in the card editor
    if (this._hass) {
      this.hass = this._hass
      this.area = this._hass.areas[this._config.area]
    }
  }

  set hass(hass: HomeAssistant & { areas: Record<string, Area> }) {
    this._hass = hass
    const areaId = this._config?.area
    if (areaId) {
      this.area = this._hass.areas[areaId]
    }
  }

  get hass(): HomeAssistant & { areas: Record<string, Area> } {
    return this._hass
  }

  get areaColor() {
    return this._config?.color || (this.area?.area_id && areaColors[this.area.area_id]) || '#999'
  }
  get summaryTypes(): EntityTypeSummary[] {
    // Migrate deprecated preset fields to summaries
    const migratedSummaries: EntityTypeSummary[] = []

    const presetMap: Record<string, { name: string; icon: string; isAlarm?: boolean }> = {
      presence: { name: 'Presence', icon: 'mdi:account-multiple' },
      alarm: { name: 'Alarms', icon: 'mdi:alarm-bell', isAlarm: true },
      door: { name: 'Doors', icon: 'mdi:door' },
      light: { name: 'Lights', icon: 'mdi:lightbulb' },
    }

    for (const [presetKey, presetDef] of Object.entries(presetMap)) {
      const entities = this.toArray(
        this._config?.[presetKey as keyof ScAreaCardConfig] as string | string[] | undefined,
      )
      if (entities.length > 0) {
        migratedSummaries.push({
          name: presetDef.name,
          icon: presetDef.icon,
          entities,
          alarm_entities: presetDef.isAlarm ? entities : [],
        })
      }
    }

    const customSummaries: EntityTypeSummary[] = this.toArray(this._config?.summary).map((type) => {
      return {
        name: type.name,
        icon: type.icon || 'mdi:help-circle',
        entities: this.toArray(type.entities),
        alarm_entities: this.toArray(type.alarm_entities),
        tap_action: type.tap_action,
        hold_action: type.hold_action,
        double_tap_action: type.double_tap_action,
      }
    })

    return [...migratedSummaries, ...customSummaries].filter(
      (type) => type.entities.length > 0 || (type.alarm_entities && type.alarm_entities.length > 0),
    )
  }

  get alarmEntities(): string[] {
    return this.summaryTypes.map((type) => this.toArray(type.alarm_entities)).flat()
  }

  get alarmActive(): boolean {
    return this.alarmEntities.some((entity) => {
      const state = this.hass.states[entity]
      return state && state.state === 'on'
    })
  }

  get variant() {
    return this._config?.variant || 'default'
  }

  get variantSizes() {
    return VARIANT_SIZES[this.variant]
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
    const { area } = this

    if (!area) {
      return html`<p class="error">${this._config.area} is unavailable.</p>`
    }

    const sizes = this.variantSizes

    const header: TemplateResult = html`<header class="area-card__header">
      <h1 class="area-card__name">${area.name}</h1>
      <temp-hum
        .temperatureEntityId=${area.temperature_entity_id}
        .humidityEntityId=${area.humidity_entity_id}
        .hass=${this._hass}
        .fontSize=${sizes.tempFontSize}
      ></temp-hum>
    </header>`

    const classes = {
      'area-card': true,
      'area-card--alarm': this.alarmActive,
      'area-card--with-action': this.hasAction,
      [`area-card--style-${this._config.style || 'full'}`]: true,
      [`area-card--variant-${this.variant}`]: true,
    }
    const summaries = this.summaryTypes.filter((type) => type.entities.length)

    return html`
      <ha-card
        @action=${this.handleAction}
        tabindex="0"
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config.hold_action),
          hasDoubleClick: hasAction(this._config.double_tap_action),
        })}
        class="${classMap(classes)}"
      >
        <div
          class="area-card__content"
          style="
            --area-color: ${this.areaColor};
            --title-font-size: ${sizes.titleFontSize}px;
            --title-font-size-header: ${sizes.titleFontSizeHeader}px;
            --temp-font-size: ${sizes.tempFontSize}px;
            --hum-font-size: ${sizes.humFontSize}px;
            --area-icon-size: ${sizes.areaIconSize}px;
            --area-icon-icon-size: ${sizes.areaIconIconSize}px;
            --summary-icon-size: ${sizes.summaryIconSize}px;
            --status-gap: ${sizes.statusGap}px;
            --icon-left: ${sizes.iconLeft}px;
            --icon-bottom: ${sizes.iconBottom}px;
          "
        >
          ${header}
          ${summaries.length
            ? html`<aside class="area-card__status">
                ${summaries.map(
                  (type) => html`
                    <entities-type-status
                      .entities=${toArray(type.entities)}
                      .hass=${this.hass}
                      .icon=${type.icon}
                      .name=${type.name}
                      .bgColor=${this.areaColor}
                      .color=${'var(--black2)'}
                      .size=${sizes.summaryIconSize}
                      .actions=${{
                        tap_action: type.tap_action,
                        hold_action: type.hold_action,
                        double_tap_action: type.double_tap_action,
                      }}
                    ></entities-type-status>
                  `,
                )}
              </aside>`
            : nothing}

          <sc-icon
            class="area-card__icon"
            .icon=${area.icon}
            .color=${this.areaColor}
            .size=${sizes.areaIconSize}
            .iconSize=${sizes.areaIconIconSize}
          ></sc-icon>
          ${(area.temperature_entity_id || area.humidity_entity_id) &&
          html`<div class="area-card__chart">
            <temp-hum-chart
              .hass=${this.hass}
              .temperatureEntityId=${area.temperature_entity_id}
              .humidityEntityId=${area.humidity_entity_id}
              .color="${this.areaColor}"
            ></temp-hum-chart>
          </div>`}
        </div>
      </ha-card>
    `
  }

  // card configuration
  static getStubConfig() {
    return {
      area: 'living_room',
    }
  }

  static getConfigElement() {
    return document.createElement('sc-area-card-editor')
  }

  static styles = css`
    .area-card {
      position: relative;
      overflow: hidden;
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 12px 16px;
    }

    .area-card--alarm {
      animation:
        pulse 1s infinite,
        bg-pulse 2s infinite;
    }
    .area-card--with-action {
      cursor: pointer;
    }

    .area-card__chart {
      position: absolute;
      left: 0;
      top: 30px;
      bottom: 0;
      right: 0;
      z-index: 1;
      mask-image: linear-gradient(to right, transparent, transparent 60px, black 50%);
      -webkit-mask-image: linear-gradient(to right, transparent, transparent 60px, black 50%);
      pointer-events: none;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      temp-hum-chart {
        max-height: 100px;
      }
    }
    .area-card--style-header .area-card__chart {
      opacity: 0.7;
    }
    .area-card--variant-compact .area-card__chart {
      top: 20px;
    }
    .area-card--variant-compact .area-card__chart temp-hum-chart {
      max-height: 60px;
    }
    .area-card--variant-mini .area-card__chart {
      top: 15px;
    }
    .area-card--variant-mini .area-card__chart temp-hum-chart {
      max-height: 40px;
    }

    .area-card__content {
      min-height: 120px;
      display: flex;
      flex-direction: column;
    }

    .area-card--style-header .area-card__content {
      min-height: 50px;
      padding-left: 90px;
      justify-content: center;
    }

    .area-card--variant-compact .area-card__content {
      min-height: 90px;
    }
    .area-card--variant-mini .area-card__content {
      min-height: 70px;
    }
    .area-card--variant-compact.area-card--style-header .area-card__content,
    .area-card--variant-mini.area-card--style-header .area-card__content {
      padding-left: 70px;
    }

    .area-card__header {
      display: flex;
      gap: 0 10px;
      justify-content: space-between;
      align-items: baseline;
      height: auto;
      flex-wrap: wrap;
    }
    .area-card--style-header .area-card__header {
    }

    .area-card__name {
      font-size: var(--title-font-size, 20px);
      margin: 0;
      font-weight: 300;
    }

    .area-card--style-header .area-card__name {
      font-size: var(--title-font-size-header, 30px);
      font-weight: 200;
    }

    .area-card__status {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: flex-end;
      padding-top: 40px;
      gap: var(--status-gap, 10px);
      z-index: 2;
      flex: 1;
      margin-left: 80px;
    }
    .area-card--style-header .area-card__status {
      padding-top: 10px;
    }

    .area-card--variant-compact .area-card__status,
    .area-card--variant-mini .area-card__status {
      margin-left: 0;
    }

    .area-card__icon {
      position: absolute;
      left: var(--icon-left, -10px);
      bottom: var(--icon-bottom, -10px);
      z-index: 2;
      pointer-events: none;
      display: flex;
      align-items: center;
    }

    .area-card--style-header .area-card__icon {
      top: 0;
      bottom: 0;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
      }
      100% {
        box-shadow: 0 0 0 30px rgba(255, 0, 0, 0);
      }
    }

    @keyframes bg-pulse {
      0%,
      25% {
        background-color: var(--ha-card-background, white);
      }
      25%,
      75% {
        background-color: red;
      }
      75%,
      100% {
        background-color: var(--ha-card-background, white);
      }
    }
  `
}
