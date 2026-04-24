import { actionHandler } from '@/action-handler-directive'
import { areaColors } from '@/area-colors'
import type { Area } from '@/types.ts'
import { getBaseColor, toArray } from '@/utils'
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
import { getTempHumStats } from './getTempHumStats.js'
import './TempHum.ts'
import './TempHumChart.ts'
import type { EntityTypeSummary, RenderProps, ScAreaCardConfig } from './types.ts'

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
    chartHeight: 100,
    borderRadius: 12,
    padding: '12px 16px',
  },
  compact: {
    titleFontSize: 16,
    titleFontSizeHeader: 24,
    tempFontSize: 22,
    humFontSize: 12,
    areaIconSize: 60,
    areaIconIconSize: 28,
    summaryIconSize: 30,
    statusGap: 7,
    iconLeft: 0,
    iconBottom: -5,
    chartHeight: 60,
    borderRadius: 10,
    padding: '10px 12px',
  },
  mini: {
    titleFontSize: 14,
    titleFontSizeHeader: 22,
    tempFontSize: 18,
    humFontSize: 12,
    areaIconSize: 45,
    areaIconIconSize: 20,
    summaryIconSize: 26,
    statusGap: 5,
    iconLeft: 5,
    iconBottom: -5,
    chartHeight: 40,
    borderRadius: 8,
    padding: '8px 10px',
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
    const color =
      this._config?.color || (this.area?.area_id && areaColors[this.area.area_id]) || '#999'
    return getBaseColor(this, color as string | number[])
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

  private get isPreview(): boolean {
    return this.isStubPreview || this.closest('hui-card-edit-mode') !== null
  }

  private get isStubPreview(): boolean {
    return this._config?._stubPreview === true
  }

  private renderStubPreview(): TemplateResult {
    return html`
      <ha-card class="area-card area-card--preview area-card--variant-default">
        <div class="area-card__content area-card__content--preview">
          <header class="area-card__header">
            <h1 class="area-card__name">Living Room</h1>
            <div class="temp-hum" style="--font-size: 28px;">
              <div class="temp-hum__temperature">22°C</div>
              <div class="temp-hum__humidity">45%</div>
            </div>
          </header>

          <aside class="area-card__status area-card__status--preview">
            <div class="preview-chip">Presence</div>
            <div class="preview-chip">Lights</div>
          </aside>

          <div class="area-card__preview-chart"></div>
          <div class="area-card__preview-icon"></div>
        </div>
      </ha-card>
    `
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

    if (this.isStubPreview) {
      return this.renderStubPreview()
    }

    const { area } = this

    if (!area) {
      return html`<p class="error">${this._config.area} is unavailable.</p>`
    }

    return this.renderCard({
      areaName: area.name,
      temperature: area.temperature_entity_id
        ? parseFloat(this.hass.states[area.temperature_entity_id].state)
        : null,
      humidity: area.humidity_entity_id
        ? parseFloat(this.hass.states[area.humidity_entity_id].state)
        : null,
      temperatureUnits: area.temperature_entity_id
        ? this.hass.states[area.temperature_entity_id].attributes.unit_of_measurement
        : undefined,
      humidityUnits: area.humidity_entity_id
        ? this.hass.states[area.humidity_entity_id].attributes.unit_of_measurement
        : undefined,
      areaIcon: area.icon,
      areaColor: this.areaColor,
      summaryTypes: this.summaryTypes,
      style: this._config.style || 'full',
      variant: this.variant,
      alarmActive: this.alarmActive,
      hasAction: this.hasAction,
      actions: {
        tap_action: this._config.tap_action,
        hold_action: this._config.hold_action,
        double_tap_action: this._config.double_tap_action,
      },
      stats: getTempHumStats(
        this.getStatsCacheKey(area.temperature_entity_id, area.humidity_entity_id),
        this._hass,
        area.temperature_entity_id,
        area.humidity_entity_id,
      ),
    })
  }

  private getStatsCacheKey(
    temperatureEntityId: string | null | undefined,
    humidityEntityId: string | null | undefined,
  ): string {
    return `temp-hum-chart-${this._config?.area ?? 'unknown'}-${temperatureEntityId ?? 'none'}-${humidityEntityId ?? 'none'}`
  }

  private renderCard(props: RenderProps) {
    const sizes = this.variantSizes

    const header: TemplateResult = html`<header class="area-card__header">
      <h1 class="area-card__name">${props.areaName}</h1>
      <temp-hum
        .temperature=${props.temperature}
        .temperatureUnits=${props.temperatureUnits}
        .humidity=${props.humidity}
        .humidityUnits=${props.humidityUnits}
        .fontSize=${sizes.tempFontSize}
      ></temp-hum>
    </header>`

    const classes = {
      'area-card': true,
      'area-card--alarm': !!props.alarmActive,
      'area-card--with-action': !!props.hasAction,
      [`area-card--style-${props.style || 'full'}`]: true,
      [`area-card--variant-${this.variant}`]: true,
    }
    const summaries = this.summaryTypes.filter((type) => type.entities.length)

    return html`
      <ha-card
        @action=${this.handleAction}
        tabindex="0"
        .actionHandler=${actionHandler({
          hasHold: hasAction(props.actions?.hold_action),
          hasDoubleClick: hasAction(props.actions?.double_tap_action),
        })}
        class="${classMap(classes)}"
        style="--border-radius: ${sizes.borderRadius}px; --padding: ${sizes.padding};"
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
            .icon=${props.areaIcon}
            .color=${this.areaColor}
            .size=${sizes.areaIconSize}
            .iconSize=${sizes.areaIconIconSize}
          ></sc-icon>
          ${(props.temperature !== undefined || props.humidity !== undefined) &&
          html`<div class="area-card__chart">
            <temp-hum-chart
              .stats=${props.stats}
              .color="${this.areaColor}"
              .height=${sizes.chartHeight}
            ></temp-hum-chart>
          </div>`}
        </div>
      </ha-card>
    `
  }

  // card configuration
  static getStubConfig() {
    return {
      _stubPreview: true,
      area: 'living_room',
      style: 'full',
      variant: 'default',
    }
  }

  static getConfigElement() {
    return document.createElement('sc-area-card-editor')
  }

  static styles = css`
    .area-card {
      position: relative;
      overflow: hidden;
      border-radius: var(--border-radius, var(--ha-card-border-radius, 12px));
      padding: var(--padding, 12px 16px);
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
      overflow: hidden;
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

    .area-card__content--preview {
      position: relative;
      min-height: 120px;
      overflow: hidden;
    }

    .area-card--style-header .area-card__content {
      min-height: 50px;
      padding-left: 90px;
      justify-content: center;
    }

    .area-card--variant-compact {
      height: 90px;
    }
    .area-card--variant-mini {
      height: 70px;
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

    .area-card--preview {
      padding: 12px 16px;
    }

    .area-card__status--preview {
      padding-top: 18px;
      margin-left: 80px;
    }

    .preview-chip {
      background: color-mix(in srgb, var(--primary-color, #03a9f4) 22%, transparent);
      border: 1px solid color-mix(in srgb, var(--primary-color, #03a9f4) 45%, transparent);
      border-radius: 999px;
      color: var(--primary-text-color);
      font-size: 12px;
      padding: 4px 8px;
    }

    .area-card__preview-chart {
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--primary-color, #03a9f4) 28%, transparent),
          transparent
        ),
        linear-gradient(
          135deg,
          transparent 15%,
          color-mix(in srgb, var(--primary-color, #03a9f4) 60%, transparent) 40%,
          transparent 70%
        ),
        linear-gradient(
          160deg,
          transparent 5%,
          color-mix(in srgb, var(--accent-color, #4caf50) 35%, transparent) 45%,
          transparent 85%
        );
      border-radius: 18px 0 0 0;
      bottom: -20px;
      left: 72px;
      opacity: 0.7;
      position: absolute;
      right: -18px;
      top: 42px;
    }

    .area-card__preview-icon {
      background: radial-gradient(
        circle at 30% 30%,
        color-mix(in srgb, var(--primary-color, #03a9f4) 28%, white),
        color-mix(in srgb, var(--primary-color, #03a9f4) 72%, transparent)
      );
      border-radius: 20px;
      bottom: -10px;
      height: 92px;
      left: -12px;
      opacity: 0.9;
      position: absolute;
      width: 92px;
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

    /* Card editor preview adjustments */
    hui-card-edit-mode .area-card {
      min-height: var(--min-height, 120px);
    }
    hui-card-edit-mode .area-card--style-header {
      min-height: var(--min-height-header, 50px);
    }
    hui-card-edit-mode .area-card--variant-compact {
      min-height: 90px;
    }
    hui-card-edit-mode .area-card--variant-compact.area-card--style-header {
      min-height: 70px;
    }
    hui-card-edit-mode .area-card--variant-mini {
      min-height: 55px;
    }
    hui-card-edit-mode .area-card--variant-mini.area-card--style-header {
      min-height: 45px;
    }
  `
}
