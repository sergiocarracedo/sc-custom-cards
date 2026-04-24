import type { TemplateResult } from 'lit'
import { css, html, LitElement, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('temp-hum')
export class TempHum extends LitElement {
  @property({ type: String }) public temperature: string | undefined | null
  @property({ type: String }) public temperatureUnits: string | undefined | null
  @property({ type: String }) public humidity: string | undefined | null
  @property({ type: String }) public humidityUnits: string | undefined | null

  // @property({ type: String }) public temperatureEntityId: string | undefined | null
  // @property({ type: String }) public humidityEntityId: string | undefined | null
  // @property({ type: Object }) public hass!: HomeAssistant
  @property({ type: Number }) public fontSize: number = 28

  private isEmpty(value: string | undefined | null): boolean {
    return value === undefined || value === null || value === ''
  }

  get _temperature(): number | undefined {
    return !this.isEmpty(this.temperature) ? Math.round(parseFloat(this.temperature!)) : undefined
  }

  get _temperatureUnits(): string {
    return this.temperatureUnits || '°'
  }

  get _humidity(): number | undefined {
    return !this.isEmpty(this.humidity) ? Math.round(parseFloat(this.humidity!)) : undefined
  }

  get _humidityUnits(): string {
    return this.humidityUnits || '%'
  }

  protected render(): TemplateResult {
    return html`<div class="temp-hum" style="--font-size: ${this.fontSize}px;">
      ${this._temperature !== undefined
        ? html`<div class="temp-hum__temperature">
            ${this._temperature}${this._temperatureUnits}
          </div>`
        : nothing}
      ${this._humidity !== undefined
        ? html`<div class="temp-hum__humidity">${this._humidity}${this._humidityUnits}</div>`
        : nothing}
    </div>`
  }

  static styles = css`
    .temp-hum {
      display: flex;
      gap: 10px;
      font-size: var(--font-size, 28px);
      font-weight: 300;
      line-height: 1em;
      align-items: baseline;
      justify-content: flex-end;
    }
    .temp-hum__humidity {
      font-size: 0.55em;
      opacity: 0.7;
    }
  `
}
