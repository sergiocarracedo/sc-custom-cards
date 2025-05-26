import { css, html, LitElement, nothing, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { EntityBarConfig, Threshold } from '@/history-bars-card/types'
import { contrast, getBaseColor } from '@/utils'
import '../echarts-wrapper'
import { EChartsOption, graphic } from 'echarts'
import { cache } from '@/cache'
import '../components/Icon'
import { Actions } from '@/types'
import { actionHandler } from '@/action-handler-directive'
import {
  type ActionHandlerEvent,
  handleAction,
  hasAction,
  type HomeAssistant,
} from 'custom-card-helpers'

type EntityStats = {
  time: Date
  value: number | undefined
}[]
@customElement('entity-bar')
export class EntityBar extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant
  @property({ type: Object }) public config!: EntityBarConfig
  @property({ type: Number }) public height: number = 30
  @property({ type: Number }) public max?: number
  @property({ type: Array }) public defaultThresholds?: Threshold[] = []
  @property({ type: Object }) public actions?: Actions

  @state() private entityStats: EntityStats = []

  private get cacheKey() {
    return `entity-bar-${this.config.entity}`
  }
  private get thresholds(): Threshold[] {
    return (this.config.thresholds || this.defaultThresholds || [])
      .filter((value) => value !== undefined)
      .sort((a, b) => a.value - b.value)
  }

  private get baseColor() {
    return getBaseColor(this, this.config.color || '#666')
  }
  private getEntityStats() {
    const cachedStats = cache.get<EntityStats>(this.cacheKey)
    if (cachedStats) {
      this.entityStats = cachedStats
      return
    }

    if (this.entityStats.length > 0) {
      return
    }
    const entityId = this.config.entity

    const d = {
      type: 'recorder/statistics_during_period',
      start_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      end_time: new Date().toISOString(),
      period: '5minute',
      statistic_ids: [entityId],
    }

    type Result = { [x: string]: { start: string; mean: number }[] }
    this.hass.callWS(d).then(
      (result) => {
        const stats = (result as Result)[this.config.entity].map((d) => {
          return {
            time: new Date(d.start),
            value: d.mean,
          }
        })
        this.entityStats = cache.set(this.cacheKey, stats)
      },
      (error) => {
        console.error(error)
      },
    )
  }

  private get chartOptions() {
    return {
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        containLabel: false,
      },
      chart: {
        type: 'line',
        zoom: {
          enabled: false,
        },
      },
      xAxis: {
        type: 'time',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      series: [
        {
          name: 'entity',
          type: 'line',
          data: (this.entityStats || []).map((d) => [+d.time, d.value]),
          lineStyle: { width: 1, color: this.baseColor },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${this.baseColor}70` },
              { offset: 1, color: `${this.baseColor}20` },
            ]),
          },
          symbol: 'none',
          smooth: false,
          emphasis: { disabled: true },
        },
      ],
      animation: false,
      tooltip: { show: false },
      silent: true,
    }
  }

  private handleAction(ev: ActionHandlerEvent) {
    ev.stopPropagation()
    ev.preventDefault()
    if (!this.hass) return
    handleAction(
      this,
      this.hass,
      {
        entity: this.config.entity,
        hold_action: this.actions?.hold_action,
        tap_action: this.actions?.tap_action,
        double_tap_action: this.actions?.double_tap_action,
      },
      ev.detail.action,
    )
  }

  private get hasAction(): boolean {
    return (
      hasAction(this.actions?.tap_action) ||
      hasAction(this.actions?.hold_action) ||
      hasAction(this.actions?.double_tap_action)
    )
  }

  protected render(): TemplateResult | typeof nothing {
    const icon = this.config.icon || this.hass.states[this.config.entity].attributes.icon
    const name = this.config.name || this.hass.states[this.config.entity].attributes.friendly_name
    const value = parseFloat(this.hass.states[this.config.entity].state)
    const units = this.hass.states[this.config.entity].attributes.unit_of_measurement

    const neutralColor = `var(--primary-text-color)`

    const instantColor = this.thresholds.reduce((acc, threshold) => {
      if (+value > +threshold.value) {
        return threshold.color
      }
      return acc
    }, neutralColor)

    const instantLineStyle = [
      !this.max ? '' : `left: ${((value || 0) / this.max) * 100}%`,
      ` --arrow-color: ${instantColor}`,
    ]
      .filter(Boolean)
      .join(';')

    const lightText = contrast(this, instantColor, '#fff') > 2
    const valueStyle = [
      ...(instantColor !== neutralColor
        ? [
            `background: ${getBaseColor(this, instantColor)}DD`,
            `color: ${lightText ? '#fff' : '#333'}`,
            `--value-text-shadow-color: ${lightText ? '#333' : 'transparent'}`,
          ]
        : []),
    ]
      .filter(Boolean)
      .join(';')

    return this.config.icon
      ? html`<div
          class="entity-bar"
          @action=${this.handleAction}
          tabindex="0"
          .actionHandler=${actionHandler({
            hasHold: hasAction(this.actions?.hold_action),
            hasDoubleClick: hasAction(this.actions?.double_tap_action),
          })}
        >
          <div class="entity-bar__content">
            <div class="entity-bar__icon">
              ${icon
                ? html`<sc-icon
                    .icon=${icon}
                    .color=${this.baseColor}
                    size="30"
                    icon-size="15"
                  ></sc-icon>`
                : nothing}
            </div>

            <div class="entity-bar__chart-titles">
              <h3 class="entity-bar__name">${name}</h3>
              <div class="entity-bar__value" style=${valueStyle}>
                ${isNaN(value) ? '-' : value.toFixed(2)}${units || ''}
              </div>
              <span class="entity-bar__instant" style=${instantLineStyle}></span>
            </div>
          </div>

          <div class="entity-bar__chart-wrapper">
            <echarts-wrapper
              .options=${this.chartOptions as EChartsOption}
              height=${this.height}
            ></echarts-wrapper>
          </div>
        </div> `
      : nothing
  }

  public connectedCallback() {
    super.connectedCallback()
    this.getEntityStats()
  }

  static styles = css`
    .entity-bar {
      position: relative;
      cursor: pointer;
    }

    .entity-bar__content {
      z-index: 1;
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .entity-bar__chart-wrapper {
      position: absolute;
      z-index: 0;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      mask-image: linear-gradient(to right, transparent, transparent 15px, black 40px);
      -webkit-mask-image: linear-gradient(to right, transparent, transparent 15px, black 40px);
      pointer-events: none;
    }

    .entity-bar__chart-wrapper echarts-wrapper {
      mask-image: linear-gradient(to left, transparent, transparent 10px, black 40px);
      -webkit-mask-image: linear-gradient(to left, transparent, transparent 10px, black 40px);
    }

    .entity-bar__chart-titles {
      display: flex;
      align-items: center;
      flex: 1;
      position: relative;
    }

    .entity-bar__name {
      font-weight: 400;
      flex: 1;
      text-shadow: 0 0 2px #000;
      margin: 0;
    }

    .entity-bar__value {
      text-align: right;
      font-weight: 400;
      text-shadow: 0 0 2px var(--value-text-shadow-color);
      padding: 1px 5px;
      border-radius: 50px;
    }

    .entity-bar__instant {
      position: absolute;
      bottom: -3px;
      width: 0;
      height: 0;
      border-left: 3px solid transparent;
      border-right: 3px solid transparent;
      border-bottom: 8px solid var(--primary-text-color);
      transform: translateX(-5px);
    }
  `
}
