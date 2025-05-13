import type { TemplateResult } from 'lit'
import { css, html, LitElement, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { HomeAssistant } from 'custom-card-helpers'

@customElement('temp-hum')
export class TempHum extends LitElement {
  @property({ type: String }) public temperatureEntityId: string | undefined | null
  @property({ type: String }) public humidityEntityId: string | undefined | null
  @property({ type: Object }) public hass!: HomeAssistant

  get tempState(): HomeAssistant['states'][0] | undefined {
    return (this.temperatureEntityId && this.hass.states[this.temperatureEntityId]) || undefined
  }

  get temperature(): number | undefined {
    return this.tempState?.state !== undefined
      ? Math.round(parseFloat(this.tempState.state))
      : undefined
  }
  get temperatureUnits(): string | undefined {
    return this.tempState?.attributes.unit_of_measurement
  }

  get humState(): HomeAssistant['states'][0] | undefined {
    return (this.humidityEntityId && this.hass.states[this.humidityEntityId]) || undefined
  }

  get humidity(): number | undefined {
    return this.humState?.state !== undefined
      ? Math.round(parseFloat(this.humState.state))
      : undefined
  }

  get humidityUnits(): string | undefined {
    return this.humState?.attributes.unit_of_measurement
  }

  protected render(): TemplateResult {
    return html`<div class="temp-hum">
      ${this.temperature !== undefined
        ? html`<div class="temp-hum__temperature">${this.temperature}${this.temperatureUnits}</div>`
        : nothing}
      ${this.humidity !== undefined
        ? html`<div class="temp-hum__humidity">${this.humidity}${this.humidityUnits}</div>`
        : nothing}
    </div>`
  }

  static styles = css`
    .temp-hum {
      display: flex;
      gap: 10px;
      font-size: 28px;
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
