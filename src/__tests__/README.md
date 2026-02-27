# Test Suite Documentation

This directory contains comprehensive unit tests for the sc-custom-cards project, targeting >95% code coverage.

## Test Structure

```
__tests__/
├── setup.ts                      # Global test setup and mocks
├── mockData.ts                   # Mock data generators and utilities
├── area-card/
│   ├── AreaCard.test.ts          # Area Card component tests
│   └── AreaCardEditor.test.ts    # Area Card Editor tests
├── history-bars-card/
│   ├── BarsCard.test.ts          # Bars Card component tests
│   └── BarsCardEditor.test.ts    # Bars Card Editor tests
└── localize/
    └── localize.test.ts          # Localization system tests
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## Coverage Goals

The test suite is designed to achieve:

- **Lines**: >95%
- **Functions**: >95%
- **Branches**: >95%
- **Statements**: >95%

## Test Categories

### 1. Component Tests (`AreaCard.test.ts`, `BarsCard.test.ts`)

Tests card rendering, configuration, and user interactions:

- **Configuration**: Setting and validating card config
- **Rendering**: DOM output for different configurations
- **State Management**: Alarm detection, entity states
- **Action Handling**: Tap, hold, double-tap actions
- **Migration Logic**: Deprecated preset field conversion
- **Edge Cases**: Missing entities, invalid states

### 2. Editor Tests (`AreaCardEditor.test.ts`, `BarsCardEditor.test.ts`)

Tests visual configuration editors:

- **Config Management**: Setting, updating, validating configs
- **CRUD Operations**: Add, edit, delete summaries/entities
- **Drag & Drop**: Reordering items via drag and drop
- **Quick Actions**: Quick-add preset summaries
- **Form Validation**: Required fields, data validation
- **Edit Modes**: Navigation between views
- **Confirmation Dialogs**: Delete confirmations

### 3. Localization Tests (`localize.test.ts`)

Tests multi-language support:

- **Language Resolution**: Correct translation for each language
- **Fallback Chains**: Language → English → key
- **Translation Keys**: All config labels and helpers
- **Consistency**: All keys present in all languages

## Mock Infrastructure

### `setup.ts`

Global test configuration:

- Mocks for `custom-card-helpers`
- Mocks for `@kipk/load-ha-components`
- Custom element definitions (ha-card, ha-icon, etc.)
- Global test utilities

### `mockData.ts`

Factory functions for test data:

- `createMockHass()`: Full Home Assistant instance
- `createMockArea()`: Area entity
- `createMockAreaCardConfig()`: Area Card configuration
- `createMockBarsCardConfig()`: Bars Card configuration
- `createMockEntitySummary()`: Entity summary
- `createMockEntityBar()`: Entity bar configuration

## Writing New Tests

### Pattern: Component Test

```typescript
describe('MyComponent', () => {
  let element: MyComponent

  beforeEach(async () => {
    element = document.createElement('my-component') as MyComponent
    element.hass = createMockHass()
    document.body.appendChild(element)
    await element.updateComplete
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  it('should render correctly', async () => {
    element.setConfig(mockConfig)
    await element.updateComplete
    expect(element.shadowRoot).toBeDefined()
  })
})
```

### Pattern: Editor Test

```typescript
it('should update config on change', () => {
  vi.mocked(fireEvent).mockClear()
  element.setConfig(mockConfig)

  element['_valueChanged']({
    detail: { value: { field: 'new value' } },
  } as any)

  expect(fireEvent).toHaveBeenCalledWith(
    element,
    'config-changed',
    expect.objectContaining({
      config: expect.objectContaining({
        field: 'new value',
      }),
    }),
  )
})
```

## Coverage Reports

After running `pnpm test:coverage`, view reports:

- **Terminal**: Summary in console
- **HTML**: `coverage/index.html` - detailed interactive report
- **LCOV**: `coverage/lcov.info` - for CI/CD integration

## Continuous Integration

The test suite is designed to run in CI environments:

```yaml
- name: Run Tests
  run: pnpm test:coverage

- name: Check Coverage
  run: |
    # Coverage thresholds enforced in vitest.config.ts
    # Build will fail if <95% coverage
```

## Best Practices

1. **Isolation**: Each test is independent
2. **Cleanup**: Always cleanup DOM elements
3. **Mocking**: Use vi.mock() for external dependencies
4. **Clarity**: Descriptive test names
5. **Coverage**: Test happy paths AND edge cases
6. **Assertions**: Multiple assertions per test when logical

## Debugging Tests

```bash
# Run single test file
pnpm vitest run src/__tests__/area-card/AreaCard.test.ts

# Run tests matching pattern
pnpm vitest run -t "should render"

# Debug with Chrome DevTools
pnpm vitest --inspect-brk
```

## Troubleshooting

### Custom Elements Not Defined

Ensure custom elements are defined in `setup.ts` before tests run.

### fireEvent Not Called

Clear mocks before testing:

```typescript
vi.mocked(fireEvent).mockClear()
```

### DOM Not Updating

Always await `element.updateComplete` after changes.

### Coverage Not 100%

Some uncovered code may be:

- Error handling paths
- Defensive code
- Framework internals
- Consider if all paths are testable/necessary
