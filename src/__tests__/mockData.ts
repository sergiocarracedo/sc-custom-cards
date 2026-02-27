import { vi } from 'vitest'
import type { HomeAssistant } from 'custom-card-helpers'
import type { Area } from '../types'
import type { ScAreaCardConfig, EntityTypeSummary } from '../area-card/types'
import type { ScBarsCardConfig, EntityBarConfig } from '../history-bars-card/types'

export const createMockHass = (overrides?: Partial<HomeAssistant>): HomeAssistant => {
  return {
    config: {
      latitude: 0,
      longitude: 0,
      elevation: 0,
      unit_system: {
        length: 'km',
        mass: 'kg',
        temperature: 'C',
        volume: 'L',
      },
      location_name: 'Home',
      time_zone: 'UTC',
      components: [],
      config_dir: '',
      whitelist_external_dirs: [],
      allowlist_external_dirs: [],
      allowlist_external_urls: [],
      version: '2024.1.0',
      config_source: 'storage',
      safe_mode: false,
      state: 'RUNNING',
      external_url: null,
      internal_url: null,
      currency: 'USD',
      country: null,
      language: 'en',
    },
    connection: {
      connected: true,
      socket: {} as any,
      haVersion: '2024.1.0',
      subscribeEvents: vi.fn(),
      subscribeMessage: vi.fn(),
      sendMessage: vi.fn(),
      sendMessagePromise: vi.fn(),
      closeConnection: vi.fn(),
    },
    states: {
      'sensor.office_temperature': {
        entity_id: 'sensor.office_temperature',
        state: '22.5',
        attributes: {
          friendly_name: 'Office Temperature',
          unit_of_measurement: '°C',
        },
        last_changed: '2024-01-01T00:00:00',
        last_updated: '2024-01-01T00:00:00',
        context: { id: '', parent_id: null, user_id: null },
      },
      'sensor.office_humidity': {
        entity_id: 'sensor.office_humidity',
        state: '45',
        attributes: {
          friendly_name: 'Office Humidity',
          unit_of_measurement: '%',
        },
        last_changed: '2024-01-01T00:00:00',
        last_updated: '2024-01-01T00:00:00',
        context: { id: '', parent_id: null, user_id: null },
      },
      'binary_sensor.office_motion': {
        entity_id: 'binary_sensor.office_motion',
        state: 'on',
        attributes: {
          friendly_name: 'Office Motion',
          device_class: 'motion',
        },
        last_changed: '2024-01-01T00:00:00',
        last_updated: '2024-01-01T00:00:00',
        context: { id: '', parent_id: null, user_id: null },
      },
      'light.office_light': {
        entity_id: 'light.office_light',
        state: 'on',
        attributes: {
          friendly_name: 'Office Light',
        },
        last_changed: '2024-01-01T00:00:00',
        last_updated: '2024-01-01T00:00:00',
        context: { id: '', parent_id: null, user_id: null },
      },
      'binary_sensor.office_door': {
        entity_id: 'binary_sensor.office_door',
        state: 'off',
        attributes: {
          friendly_name: 'Office Door',
          device_class: 'door',
        },
        last_changed: '2024-01-01T00:00:00',
        last_updated: '2024-01-01T00:00:00',
        context: { id: '', parent_id: null, user_id: null },
      },
    },
    callService: vi.fn(),
    callWS: vi.fn(),
    fetchWithAuth: vi.fn(),
    sendWS: vi.fn(),
    callApi: vi.fn(),
    hassUrl: vi.fn(),
    auth: {
      data: {
        hassUrl: 'http://localhost:8123',
        access_token: 'mock-token',
        expires: Date.now() + 3600000,
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      },
      wsUrl: 'ws://localhost:8123',
      accessToken: 'mock-token',
      expired: false,
      refreshAccessToken: vi.fn(),
      revoke: vi.fn(),
    },
    user: {
      id: 'mock-user-id',
      name: 'Test User',
      is_owner: true,
      is_admin: true,
      credentials: [],
      mfa_modules: [],
    },
    panels: {},
    panelUrl: '',
    language: 'en',
    selectedLanguage: 'en',
    selectedTheme: {},
    themes: {},
    resources: {},
    localize: vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'ui.common.edit': 'Edit',
        'ui.common.delete': 'Delete',
        'ui.common.back': 'Back',
        'ui.panel.lovelace.editor.card.generic.summary': 'Summary',
        'ui.panel.lovelace.editor.card.generic.entities': 'Entities',
        'ui.panel.lovelace.editor.card.generic.entity': 'Entity',
        'ui.panel.lovelace.editor.card.generic.thresholds': 'Thresholds',
        'ui.panel.lovelace.editor.card.generic.threshold': 'Threshold',
        'ui.panel.lovelace.editor.card.generic.add': 'Add',
      }
      return translations[key] || key
    }),
    translationMetadata: {
      fragments: [],
      translations: {},
    },
    suspendWhenHidden: true,
    enableShortcuts: true,
    vibrate: true,
    debugConnection: false,
    dockedSidebar: 'docked',
    defaultPanel: 'lovelace',
    moreInfoEntityId: null,
    ...overrides,
  } as any
}

export const createMockArea = (overrides?: Partial<Area>): Area => ({
  area_id: 'office',
  name: 'Office',
  picture: null,
  icon: null,
  aliases: [],
  created_at: Date.now(),
  floor_id: null,
  humidity_entity_id: null,
  labels: [],
  modified_at: Date.now(),
  temperature_entity_id: null,
  ...overrides,
})

export const createMockAreaCardConfig = (
  overrides?: Partial<ScAreaCardConfig>,
): ScAreaCardConfig => ({
  type: 'custom:sc-area-card',
  area: 'office',
  style: 'full',
  summary: [
    {
      name: 'Presence',
      icon: 'mdi:account-multiple',
      entities: ['binary_sensor.office_motion'],
      alarm_entities: [],
    },
    {
      name: 'Lights',
      icon: 'mdi:lightbulb',
      entities: ['light.office_light'],
      alarm_entities: [],
    },
  ],
  ...overrides,
})

export const createMockEntitySummary = (
  overrides?: Partial<EntityTypeSummary>,
): EntityTypeSummary => ({
  name: 'Test Summary',
  icon: 'mdi:help-circle',
  entities: ['sensor.test'],
  alarm_entities: [],
  ...overrides,
})

export const createMockBarsCardConfig = (
  overrides?: Partial<ScBarsCardConfig>,
): ScBarsCardConfig => ({
  type: 'custom:sc-bars-card',
  max: 100,
  entities: [
    {
      entity: 'sensor.office_temperature',
      name: 'Temperature',
      icon: 'mdi:thermometer',
      color: '#ff0000',
    },
  ],
  ...overrides,
})

export const createMockEntityBar = (overrides?: Partial<EntityBarConfig>): EntityBarConfig => ({
  entity: 'sensor.test',
  name: 'Test Entity',
  icon: 'mdi:test',
  color: '#ff0000',
  ...overrides,
})

export const createMockHassWithAreas = (areas?: Record<string, Area>) => {
  const hass = createMockHass()
  return {
    ...hass,
    areas: areas || {
      office: createMockArea(),
      bedroom: createMockArea({ area_id: 'bedroom', name: 'Bedroom' }),
    },
  }
}
