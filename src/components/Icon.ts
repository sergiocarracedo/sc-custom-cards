import { css, html, LitElement, nothing, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { getBaseColor } from '@/utils'

@customElement('sc-icon')
export class Icon extends LitElement {
  @property({ type: String }) public icon: string | undefined | null = undefined
  @property({ type: String }) public color!: string
  @property({ type: Number }) public size: number = 100
  @property({ type: Number }) public iconSize?: number = undefined

  protected render(): TemplateResult | typeof nothing {
    const baseColor = getBaseColor(this, this.color)

    const iconSize = this.iconSize || +this.size * 0.75

    return this.icon
      ? html`<div
          class="sc-icon"
          style="--color: ${baseColor}; --bg-color: ${baseColor}60; --icon-size: ${iconSize}px; --size: ${this
            .size}px"
        >
          <ha-icon icon="${this.icon}"></ha-icon>
        </div> `
      : nothing
  }

  static styles = css`
    .sc-icon {
      background-color: var(--bg-color);
      color: var(--color);
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--size);
      height: var(--size);
    }

    .sc-icon ha-icon {
      opacity: 0.7;
      --mdc-icon-size: var(--icon-size);
      width: var(--icon-size);
    }
  `
}
