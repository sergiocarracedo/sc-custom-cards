import { LitElement, html, css, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { type HomeAssistant, fireEvent } from 'custom-card-helpers'
import type { ScAreaCardConfig, EntityTypeSummary } from './types'

// Material Design Icons paths
const mdiPencil =
  'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z'
const mdiClose =
  'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'
const mdiDrag =
  'M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z'

@customElement('sc-area-card-editor')
export class ScAreaCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant
  @state() private _config?: ScAreaCardConfig
  @state() private _editingSummaryIndex: number | null = null

  public setConfig(config: ScAreaCardConfig): void {
    this._config = config
  }

  private get _summaryList(): EntityTypeSummary[] {
    if (!this._config?.summary) return []
    return Array.isArray(this._config.summary) ? this._config.summary : [this._config.summary]
  }

  private _valueChanged(ev: CustomEvent): void {
    const config = { ...this._config, ...ev.detail.value }
    fireEvent(this, 'config-changed', { config })
  }

  private _editSummary(index: number): void {
    this._editingSummaryIndex = index
  }

  private _goBack(): void {
    this._editingSummaryIndex = null
  }

  private _summaryChanged(ev: CustomEvent): void {
    if (this._editingSummaryIndex === null) return
    const summary = [...this._summaryList]
    summary[this._editingSummaryIndex] = ev.detail.value
    const config = { ...this._config, summary }
    fireEvent(this, 'config-changed', { config })
  }

  private _deleteSummary(index: number): void {
    const summary = [...this._summaryList]
    summary.splice(index, 1)
    const config = { ...this._config, summary }
    fireEvent(this, 'config-changed', { config })
  }

  private _addSummary(): void {
    const summary = [
      ...this._summaryList,
      { name: 'New Summary', icon: 'mdi:help-circle', entities: [], alarm_entities: [] },
    ]
    const config = { ...this._config, summary }
    fireEvent(this, 'config-changed', { config })
  }

  private _moveSummary(oldIndex: number, newIndex: number): void {
    const summary = [...this._summaryList]
    const [moved] = summary.splice(oldIndex, 1)
    summary.splice(newIndex, 0, moved)
    const config = { ...this._config, summary }
    fireEvent(this, 'config-changed', { config })
  }

  render() {
    if (!this.hass || !this._config) return nothing

    if (this._editingSummaryIndex !== null) {
      const summary = this._summaryList[this._editingSummaryIndex]
      if (!summary) {
        this._goBack()
        return nothing
      }
      return this._renderSummaryEditor(summary)
    }

    const currentArea = this._config?.area

    return html`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[
            { name: 'area', required: true, selector: { area: {} } },
            {
              type: 'grid',
              name: '',
              flatten: true,
              schema: [
                {
                  name: 'style',
                  default: 'full',
                  selector: {
                    select: {
                      mode: 'dropdown',
                      options: [
                        { label: 'Full', value: 'full' },
                        { label: 'Header', value: 'header' },
                      ],
                    },
                  },
                },
                { name: 'color', selector: { color_rgb: {} } },
              ],
            },
            {
              name: 'presence',
              selector: {
                entity: { multiple: true, filter: currentArea ? { area: currentArea } : undefined },
              },
            },
            {
              name: 'alarm',
              selector: {
                entity: { multiple: true, filter: currentArea ? { area: currentArea } : undefined },
              },
            },
            {
              name: 'door',
              selector: {
                entity: { multiple: true, filter: currentArea ? { area: currentArea } : undefined },
              },
            },
            {
              name: 'light',
              selector: {
                entity: { multiple: true, filter: currentArea ? { area: currentArea } : undefined },
              },
            },
          ]}
          @value-changed=${this._valueChanged}
        ></ha-form>

        <div class="section">
          <h3>${this.hass!.localize('ui.panel.lovelace.editor.card.generic.summary')}</h3>
          <div class="items-list">
            ${this._summaryList.map((item, index) => {
              const entityCount = Array.isArray(item.entities)
                ? item.entities.length
                : item.entities
                  ? 1
                  : 0
              return html`
                <div
                  class="item"
                  draggable="true"
                  @dragstart=${(e: DragEvent) => this._handleDragStart(e, index)}
                  @dragover=${this._handleDragOver}
                  @drop=${(e: DragEvent) => this._handleDrop(e, index)}
                >
                  <ha-svg-icon class="drag-handle" .path=${mdiDrag}></ha-svg-icon>
                  <ha-icon .icon=${item.icon || 'mdi:help-circle'}></ha-icon>
                  <span class="item-name">${item.name}</span>
                  <span class="item-count">(${entityCount} entities)</span>
                  <ha-icon-button
                    .label=${this.hass!.localize('ui.common.edit')}
                    .path=${mdiPencil}
                    @click=${() => this._editSummary(index)}
                  ></ha-icon-button>
                  <ha-icon-button
                    .label=${this.hass!.localize('ui.common.delete')}
                    .path=${mdiClose}
                    @click=${() => this._deleteSummary(index)}
                  ></ha-icon-button>
                </div>
              `
            })}
          </div>
          <ha-button @click=${this._addSummary}>
            ${this.hass!.localize('ui.panel.lovelace.editor.card.generic.add')}
          </ha-button>
        </div>

        <div class="section">
          <h3>${this.hass!.localize('ui.panel.lovelace.editor.action-editor.actions')}</h3>
          <ha-form
            .hass=${this.hass}
            .data=${this._config}
            .schema=${[
              { name: 'tap_action', selector: { ui_action: {} } },
              { name: 'hold_action', selector: { ui_action: {} } },
              { name: 'double_tap_action', selector: { ui_action: {} } },
            ]}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>
      </div>
    `
  }

  private _renderSummaryEditor(summary: EntityTypeSummary) {
    const currentArea = this._config?.area

    return html`
      <div class="sub-editor">
        <div class="header">
          <ha-icon-button-prev
            .label=${this.hass!.localize('ui.common.back')}
            @click=${this._goBack}
          ></ha-icon-button-prev>
          <span>Summary Type</span>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${summary}
          .schema=${[
            { name: 'name', required: true, selector: { text: {} } },
            { name: 'icon', selector: { icon: {} } },
            {
              name: 'entities',
              selector: {
                entity: { multiple: true, filter: currentArea ? { area: currentArea } : undefined },
              },
            },
            {
              name: 'alarm_entities',
              selector: {
                entity: { multiple: true, filter: currentArea ? { area: currentArea } : undefined },
              },
            },
            {
              type: 'expandable',
              name: 'actions',
              title: 'Actions',
              schema: [
                { name: 'tap_action', selector: { ui_action: {} } },
                { name: 'hold_action', selector: { ui_action: {} } },
                { name: 'double_tap_action', selector: { ui_action: {} } },
              ],
            },
          ]}
          @value-changed=${this._summaryChanged}
        ></ha-form>
      </div>
    `
  }

  private _handleDragStart(e: DragEvent, index: number) {
    e.dataTransfer!.setData('text/plain', JSON.stringify({ index }))
  }

  private _handleDragOver(e: DragEvent) {
    e.preventDefault()
  }

  private _handleDrop(e: DragEvent, targetIndex: number) {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer!.getData('text/plain'))
    this._moveSummary(data.index, targetIndex)
  }

  static styles = css`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .section {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
    }
    .section h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: var(--card-background-color);
      border-radius: 4px;
      cursor: move;
    }
    .drag-handle {
      cursor: grab;
    }
    .item-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item-count {
      color: var(--secondary-text-color);
      font-size: 12px;
    }
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      font-size: 16px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    .icon-btn:hover {
      background-color: var(--secondary-background-color);
    }
    .edit-btn {
      color: var(--primary-color);
    }
    .delete-btn {
      color: var(--error-color);
    }
    .add-btn {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      width: 100%;
    }
    .add-btn:hover {
      opacity: 0.9;
    }
    .sub-editor {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--divider-color);
    }
    .header span {
      font-size: 18px;
      font-weight: 500;
    }
  `
}
