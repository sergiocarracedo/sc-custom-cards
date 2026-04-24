import { getBaseColor } from '@/utils'
import { EChartsOption, graphic } from 'echarts'
import type { TemplateResult } from 'lit'
import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import '../echarts-wrapper'
import { TempHumStats, TempHumStatsResult } from './types'

@customElement('temp-hum-chart')
export class TempHumChart extends LitElement {
  @property({ type: Object }) public stats: Promise<TempHumStatsResult> | null = null

  @property({ type: String }) public temperatureEntityId: string | null = null
  @property({ type: String }) public humidityEntityId: string | null = null
  @property({ type: String }) public color: string = '#666' // Default color
  @property({ type: Number }) public height: number = 90
  @property({ type: Boolean }) public preview: boolean = false

  @state() private tempHumStats: TempHumStats = []
  @state() private chartMessage: string | null = null
  private statsRequestId: number = 0

  private get chartOptions() {
    const baseColor = getBaseColor(this, this.color)

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
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
        {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
          min: 0,
          max: 100,
        },
      ],
      series: [
        {
          name: 'Temperature',
          type: 'line',
          data: (this.tempHumStats || []).map((d) => [+d.time, d.temp]),
          lineStyle: { width: 2, color: baseColor },
          symbol: 'none',
          smooth: false,
          emphasis: { disabled: true },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${baseColor}70` },
              { offset: 1, color: `${baseColor}20` },
            ]),
          },
        },
        {
          name: 'Humidity',
          type: 'line',
          yAxisIndex: 1,
          data: (this.tempHumStats || []).map((d) => [+d.time, d.humidity]),
          lineStyle: { width: 1, color: baseColor, type: 'dashed', dashArray: [2, 6] },
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

  protected updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (!changedProperties.has('stats')) {
      return
    }

    void this.resolveStats()
  }

  private async resolveStats() {
    const requestId = ++this.statsRequestId
    const statsPromise = this.stats

    if (!statsPromise) {
      this.tempHumStats = []
      this.chartMessage = null
      return
    }

    try {
      const { tempHumStats, chartMessage } = await statsPromise
      if (requestId !== this.statsRequestId) {
        return
      }

      this.tempHumStats = tempHumStats
      this.chartMessage = chartMessage
    } catch {
      if (requestId !== this.statsRequestId) {
        return
      }

      this.tempHumStats = []
      this.chartMessage = 'Error retrieving historical data.'
    }
  }

  render(): TemplateResult | typeof nothing {
    if (this.tempHumStats.length > 0) {
      return html`<echarts-wrapper
        .options=${this.chartOptions as EChartsOption}
        height=${this.height}
      ></echarts-wrapper>`
    }

    if (this.preview && this.chartMessage) {
      return html`<div class="preview-message">${this.chartMessage}</div>`
    }

    return nothing
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .preview-message {
      align-items: flex-end;
      color: var(--secondary-text-color);
      display: flex;
      font-size: 0.75rem;
      height: 100%;
      justify-content: flex-end;
      line-height: 1.3;
      padding: 0 0.75rem 0.5rem 4.5rem;
      text-align: right;
    }
  `
}
