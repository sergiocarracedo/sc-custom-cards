import { html, css, LitElement, nothing } from 'lit'
import type { TemplateResult } from 'lit'
import { property, customElement } from 'lit/decorators.js'
import type { HomeAssistant } from 'custom-card-helpers'

@customElement('temp-hum')
export class TempHum extends LitElement {
  @property({ type: String }) public temperatureEntityId: string | undefined
  @property({ type: String }) public humidityEntityId: string | undefined
  @property({ type: Object }) public hass!: HomeAssistant

  get tempState(): HomeAssistant['states'] | undefined {
    return this.hass.states[this.temperatureEntityId]
  }

  get temperature(): number | undefined {
    return this.tempState?.state !== undefined
      ? Math.round(parseFloat(this.tempState.state))
      : undefined
  }
  get temperatureUnits(): string | undefined {
    return this.tempState?.attributes.unit_of_measurement
  }

  get humState(): HomeAssistant['states'] | undefined {
    return this.hass.states[this.humidityEntityId]
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
