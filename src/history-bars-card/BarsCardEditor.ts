import { LitElement, html, css, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { type HomeAssistant, fireEvent } from 'custom-card-helpers'
import type { ScBarsCardConfig, EntityBarConfig } from './types'

// Material Design Icons paths
const mdiPencil =
  'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z'
const mdiClose =
  'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'
const mdiDrag =
  'M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z'

@customElement('sc-bars-card-editor')
export class ScBarsCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant
  @state() private _config?: ScBarsCardConfig
  @state() private _editingEntityIndex: number | null = null
  @state() private _editingThresholdIndex: number | null = null

  public setConfig(config: ScBarsCardConfig): void {
    this._config = config
  }

  private _valueChanged(ev: CustomEvent): void {
    const config = { ...this._config, ...ev.detail.value }
    fireEvent(this, 'config-changed', { config })
  }

  private _editEntity(index: number): void {
    this._editingEntityIndex = index
    this._editingThresholdIndex = null
  }

  private _editThreshold(index: number): void {
    this._editingThresholdIndex = index
    this._editingEntityIndex = null
  }

  private _goBack(): void {
    this._editingEntityIndex = null
    this._editingThresholdIndex = null
  }

  private _entityChanged(ev: CustomEvent): void {
    if (this._editingEntityIndex === null) return
    const entities = [...(this._config?.entities || [])]
    entities[this._editingEntityIndex] = ev.detail.value
    const config = { ...this._config, entities }
    fireEvent(this, 'config-changed', { config })
  }

  private _thresholdChanged(ev: CustomEvent): void {
    if (this._editingThresholdIndex === null) return
    const thresholds = [...(this._config?.thresholds || [])]
    thresholds[this._editingThresholdIndex] = ev.detail.value
    const config = { ...this._config, thresholds }
    fireEvent(this, 'config-changed', { config })
  }

  private async _deleteEntity(index: number): Promise<void> {
    const entity = this._config?.entities?.[index]
    const name = entity?.name || entity?.entity || 'this entity'

    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const entities = [...(this._config?.entities || [])]
      entities.splice(index, 1)
      const config = { ...this._config, entities }
      fireEvent(this, 'config-changed', { config })
    }
  }

  private async _deleteThreshold(index: number): Promise<void> {
    const threshold = this._config?.thresholds?.[index]
    const value = threshold?.value ?? 'this threshold'

    if (confirm(`Are you sure you want to delete threshold "${value}"?`)) {
      const thresholds = [...(this._config?.thresholds || [])]
      thresholds.splice(index, 1)
      const config = { ...this._config, thresholds }
      fireEvent(this, 'config-changed', { config })
    }
  }

  private _addEntity(ev: CustomEvent): void {
    const entityId = ev.detail.value
    if (!entityId) return
    const entities = [
      ...(this._config?.entities || []),
      { entity: entityId, name: '', icon: '', color: '' },
    ]
    const config = { ...this._config, entities }
    fireEvent(this, 'config-changed', { config })
    ;(ev.target as any).value = ''
  }

  private _addThreshold(): void {
    const thresholds = [...(this._config?.thresholds || []), { value: 0, color: '#ff0000' }]
    const config = { ...this._config, thresholds }
    fireEvent(this, 'config-changed', { config })
  }

  private _moveEntity(oldIndex: number, newIndex: number): void {
    const entities = [...(this._config?.entities || [])]
    const [moved] = entities.splice(oldIndex, 1)
    entities.splice(newIndex, 0, moved)
    const config = { ...this._config, entities }
    fireEvent(this, 'config-changed', { config })
  }

  private _moveThreshold(oldIndex: number, newIndex: number): void {
    const thresholds = [...(this._config?.thresholds || [])]
    const [moved] = thresholds.splice(oldIndex, 1)
    thresholds.splice(newIndex, 0, moved)
    const config = { ...this._config, thresholds }
    fireEvent(this, 'config-changed', { config })
  }

  render() {
    if (!this.hass || !this._config) return nothing

    // Edit mode for entity
    if (this._editingEntityIndex !== null) {
      const entity = this._config.entities?.[this._editingEntityIndex]
      if (!entity) {
        this._goBack()
        return nothing
      }
      return this._renderEntityEditor(entity)
    }

    // Edit mode for threshold
    if (this._editingThresholdIndex !== null) {
      const threshold = this._config.thresholds?.[this._editingThresholdIndex]
      if (!threshold) {
        this._goBack()
        return nothing
      }
      return this._renderThresholdEditor(threshold)
    }

    // Main editor view
    return html`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${[
            {
              name: 'max',
              required: true,
              default: 100,
              selector: { number: { min: 0, step: 1 } },
            },
          ]}
          @value-changed=${this._valueChanged}
        ></ha-form>

        <div class="section">
          <h3>${this.hass!.localize('ui.panel.lovelace.editor.card.generic.entities')}</h3>
          <div class="items-list">
            ${this._config.entities?.map((entity, index) => {
              const stateObj = this.hass!.states[entity.entity]
              const name = entity.name || stateObj?.attributes.friendly_name || entity.entity
              return html`
                <div
                  class="item"
                  draggable="true"
                  @dragstart=${(e: DragEvent) => this._handleDragStart(e, index, 'entity')}
                  @dragover=${this._handleDragOver}
                  @drop=${(e: DragEvent) => this._handleDrop(e, index, 'entity')}
                >
                  <ha-svg-icon class="drag-handle" .path=${mdiDrag}></ha-svg-icon>
                  <span class="item-name">${name}</span>
                  <ha-icon-button
                    .label=${this.hass!.localize('ui.common.edit')}
                    .path=${mdiPencil}
                    @click=${() => this._editEntity(index)}
                  ></ha-icon-button>
                  <ha-icon-button
                    .label=${this.hass!.localize('ui.common.delete')}
                    .path=${mdiClose}
                    @click=${() => this._deleteEntity(index)}
                  ></ha-icon-button>
                </div>
              `
            })}
          </div>
          <ha-entity-picker
            .hass=${this.hass}
            @value-changed=${this._addEntity}
            label="${this.hass!.localize('ui.panel.lovelace.editor.card.generic.entity')}: "
          ></ha-entity-picker>
        </div>

        <div class="section">
          <h3>${this.hass!.localize('ui.panel.lovelace.editor.card.generic.thresholds')}</h3>
          <div class="items-list">
            ${this._config.thresholds?.map(
              (threshold, index) => html`
                <div
                  class="item"
                  draggable="true"
                  @dragstart=${(e: DragEvent) => this._handleDragStart(e, index, 'threshold')}
                  @dragover=${this._handleDragOver}
                  @drop=${(e: DragEvent) => this._handleDrop(e, index, 'threshold')}
                >
                  <ha-svg-icon class="drag-handle" .path=${mdiDrag}></ha-svg-icon>
                  <div class="threshold-preview" style="background-color: ${threshold.color}"></div>
                  <span class="item-name">Value: ${threshold.value}</span>
                  <ha-icon-button
                    .label=${this.hass!.localize('ui.common.edit')}
                    .path=${mdiPencil}
                    @click=${() => this._editThreshold(index)}
                  ></ha-icon-button>
                  <ha-icon-button
                    .label=${this.hass!.localize('ui.common.delete')}
                    .path=${mdiClose}
                    @click=${() => this._deleteThreshold(index)}
                  ></ha-icon-button>
                </div>
              `,
            )}
          </div>
          <ha-button size="small" @click=${this._addThreshold} variant="brand" appearance="filled"
            >${this.hass!.localize('ui.panel.lovelace.editor.card.generic.add')}</ha-button
          >
        </div>

        <div class="section">
          <ha-form
            .hass=${this.hass}
            .data=${this._config}
            .schema=${[
              {
                type: 'expandable',
                name: 'actions_section',
                title: 'Actions',
                schema: [
                  { name: 'tap_action', label: 'Tap', selector: { ui_action: {} } },
                  { name: 'hold_action', label: 'Hold', selector: { ui_action: {} } },
                  { name: 'double_tap_action', label: 'Double Tap', selector: { ui_action: {} } },
                ],
              },
            ]}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>
      </div>
    `
  }

  private _renderEntityEditor(entity: EntityBarConfig) {
    return html`
      <div class="sub-editor">
        <div class="header">
          <ha-icon-button-prev
            .label=${this.hass!.localize('ui.common.back')}
            @click=${this._goBack}
          ></ha-icon-button-prev>
          <span>${this.hass!.localize('ui.panel.lovelace.editor.card.generic.entity')}</span>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${entity}
          .schema=${[
            { name: 'entity', required: true, selector: { entity: {} } },
            {
              type: 'grid',
              name: '',
              flatten: true,
              schema: [
                { name: 'name', selector: { text: {} } },
                { name: 'hideName', selector: { boolean: {} } },
              ],
            },
            { name: 'icon', selector: { icon: {} } },
            { name: 'color', selector: { text: {} } },
            {
              type: 'grid',
              name: '',
              flatten: true,
              schema: [
                { name: 'min', selector: { number: { step: 1 } } },
                { name: 'max', selector: { number: { min: 0, step: 1 } } },
              ],
            },
            {
              type: 'expandable',
              name: 'actions',
              title: 'Actions',
              schema: [
                { name: 'tap_action', label: 'Tap', selector: { ui_action: {} } },
                { name: 'hold_action', label: 'Hold', selector: { ui_action: {} } },
                { name: 'double_tap_action', label: 'Double Tap', selector: { ui_action: {} } },
              ],
            },
          ]}
          @value-changed=${this._entityChanged}
        ></ha-form>
      </div>
    `
  }

  private _renderThresholdEditor(threshold: { value: number; color: string }) {
    return html`
      <div class="sub-editor">
        <div class="header">
          <ha-icon-button-prev
            .label=${this.hass!.localize('ui.common.back')}
            @click=${this._goBack}
          ></ha-icon-button-prev>
          <span>${this.hass!.localize('ui.panel.lovelace.editor.card.generic.threshold')}</span>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${threshold}
          .schema=${[
            { name: 'value', required: true, selector: { number: { step: 0.1 } } },
            { name: 'color', required: true, selector: { text: {} } },
          ]}
          @value-changed=${this._thresholdChanged}
        ></ha-form>
      </div>
    `
  }

  private _handleDragStart(e: DragEvent, index: number, type: 'entity' | 'threshold') {
    e.dataTransfer!.setData('text/plain', JSON.stringify({ index, type }))
  }

  private _handleDragOver(e: DragEvent) {
    e.preventDefault()
  }

  private _handleDrop(e: DragEvent, targetIndex: number, targetType: 'entity' | 'threshold') {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer!.getData('text/plain'))
    if (data.type !== targetType) return
    if (data.type === 'entity') {
      this._moveEntity(data.index, targetIndex)
    } else {
      this._moveThreshold(data.index, targetIndex)
    }
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
    .threshold-preview {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
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
  `
}
