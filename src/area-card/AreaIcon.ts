import { html, css, LitElement } from 'lit'
import type { TemplateResult } from 'lit'
import { property, customElement } from 'lit/decorators.js'
import { getBaseColor } from '@/utils'

@customElement('area-icon')
export class AreaIcon extends LitElement {
  @property({ type: String }) public icon!: string
  @property({ type: String }) public color!: string

  protected render(): TemplateResult | '' {
    const baseColor = getBaseColor(this, this.color)

    return (
      this.icon &&
      html`<div class="area-icon" style="--color: ${baseColor}; --bg-color: ${baseColor}60">
        <ha-icon icon="${this.icon}"></ha-icon>
      </div>`
    )
  }

  static styles = css`
    .area-icon {
      background-color: var(--bg-color);
      color: var(--color);
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100px;
      height: 100px;
    }

    .area-icon ha-icon {
      opacity: 0.7;
      --mdc-icon-size: 40px;
      width: var(--mdc-icon-size);
    }
  `
}
