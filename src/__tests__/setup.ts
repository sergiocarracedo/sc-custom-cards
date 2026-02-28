import { vi } from 'vitest'

// Mock custom-card-helpers
vi.mock('custom-card-helpers', () => ({
  handleAction: vi.fn(),
  hasAction: vi.fn((action) => action !== undefined),
  fireEvent: vi.fn(),
}))

// Mock load-ha-components
vi.mock('@kipk/load-ha-components', () => ({
  DEFAULT_HA_COMPONENTS: [],
  loadHaComponents: vi.fn().mockResolvedValue(undefined),
}))

// Define custom elements if not already defined
if (!customElements.get('ha-card')) {
  customElements.define(
    'ha-card',
    class extends HTMLElement {
      constructor() {
        super()
      }
    },
  )
}

if (!customElements.get('ha-icon')) {
  customElements.define(
    'ha-icon',
    class extends HTMLElement {
      constructor() {
        super()
      }
    },
  )
}

if (!customElements.get('ha-svg-icon')) {
  customElements.define(
    'ha-svg-icon',
    class extends HTMLElement {
      constructor() {
        super()
      }
    },
  )
}

if (!customElements.get('ha-icon-button')) {
  customElements.define(
    'ha-icon-button',
    class extends HTMLElement {
      constructor() {
        super()
      }
    },
  )
}

if (!customElements.get('ha-icon-button-prev')) {
  customElements.define(
    'ha-icon-button-prev',
    class extends HTMLElement {
      constructor() {
        super()
      }
    },
  )
}

if (!customElements.get('ha-form')) {
  customElements.define(
    'ha-form',
    class extends HTMLElement {
      constructor() {
        super()
      }
    },
  )
}

if (!customElements.get('ha-button')) {
  customElements.define(
    'ha-button',
    class extends HTMLElement {
      constructor() {
        super()
      }
    },
  )
}

if (!customElements.get('ha-entity-picker')) {
  customElements.define(
    'ha-entity-picker',
    class extends HTMLElement {
      constructor() {
        super()
      }
    },
  )
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Global test utilities
global.flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))
