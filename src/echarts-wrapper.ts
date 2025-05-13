import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import * as echarts from 'echarts'

@customElement('echarts-wrapper')
export class EChartsWrapper extends LitElement {
  @property({ type: Object }) public options: echarts.EChartsOption = {}
  @property({ type: [Number, String] }) public height: number | string = '100%'
  private chartInstance: echarts.ECharts | null = null
  private resizeObserver: ResizeObserver | null = null

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .chart-container {
      width: 100%;
    }
  `

  private init() {
    if (!this.chartInstance || !this.resizeObserver) {
      const container = this.shadowRoot?.querySelector('.chart-container') as HTMLElement | null
      if (container) {
        if (!this.chartInstance) {
          this.chartInstance = echarts.init(container)
          this.updateChart()
        }

        // Use ResizeObserver to observe the chart-container size
        if (!this.resizeObserver) {
          this.resizeObserver = new ResizeObserver(() => {
            this.handleResize()
          })
          this.resizeObserver.observe(container)
        }
      }
    }
  }

  protected firstUpdated() {
    this.init()
  }

  connectedCallback() {
    super.connectedCallback()
    // Check if the container is already initialized
    this.init()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('resize', this.handleResize)
    // Disconnect the ResizeObserver
    this.resizeObserver?.disconnect()
    this.chartInstance?.dispose()
    // Clean up the chart and observer references as litelement
    // does destroy the component if is recreated inmediately
    this.chartInstance = null
    this.resizeObserver = null
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('options')) {
      this.updateChart()
    }
  }

  private updateChart() {
    if (this.chartInstance && this.options) {
      this.chartInstance.setOption(this.options)
    }
  }

  private handleResize = () => {
    this.chartInstance?.resize()
  }

  render() {
    const height = typeof this.height === 'number' ? `${this.height}px` : this.height
    return html`<div class="chart-container" style="height: ${height}"></div>`
  }
}
