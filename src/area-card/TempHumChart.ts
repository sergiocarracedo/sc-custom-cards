import type { PropertyValues, TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { HomeAssistant } from 'custom-card-helpers'
import '../echarts-wrapper'
import { graphic } from 'echarts'
import { getBaseColor } from '@/utils.ts'

@customElement('temp-hum-chart')
export class TempHumChart extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant
  @property({ type: String }) public temperatureEntityId!: string
  @property({ type: String }) public humidityEntityId!: string
  @property({ type: String }) public color: string = '#666' // Default color
  @property({ type: Number }) public height: number = 90

  @state() private tempHumStats: {
    time: Date
    temp: number | undefined
    humidity: number | undefined
  }[] = []

  private getTempHumStats() {
    if (this.tempHumStats.length > 0) {
      return
    }
    // TODO: Needs a cache
    // Issue statistics retrieval call
    const tempEntityId = this.temperatureEntityId
    const humidityEntityId = this.humidityEntityId

    const d = {
      type: 'recorder/statistics_during_period',
      start_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      end_time: new Date().toISOString(),
      period: '5minute',
      statistic_ids: [tempEntityId, humidityEntityId].filter(Boolean),
    }

    type Result = { [x: string]: { start: string; mean: number }[] }
    this.hass.callWS(d).then(
      (result) => {
        this.tempHumStats = (result as Result)[tempEntityId].map((d, index) => {
          return {
            time: new Date(d.start),
            temp: d.mean,
            humidity: (result as Result)[humidityEntityId][index].mean,
          }
        })
      },
      (error) => {
        console.error(error)
      },
    )
  }

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
          max: 200,
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

  public connectedCallback() {
    super.connectedCallback()
    this.getTempHumStats()
  }

  render(): TemplateResult | false {
    return html`
      ${this.tempHumStats.length > 0 &&
      html`<echarts-wrapper .options=${this.chartOptions} height=${this.height}></echarts-wrapper>`}
    `
  }
}
