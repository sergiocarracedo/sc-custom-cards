## [1.5.0](https://github.com/sergiocarracedo/sc-custom-cards/compare/v1.4.1...v1.5.0) (2025-02-28)

### Features

- **editors**: Add visual configuration editors for all cards with drag-and-drop interface ([00bb124](https://github.com/sergiocarracedo/sc-custom-cards/commit/00bb124))
- **i18n**: Implement custom localization system supporting 7 languages (en, es, gl, fr, de, ca, eu) ([c34b865](https://github.com/sergiocarracedo/sc-custom-cards/commit/c34b865))
- **area-card**: Simplify Area Card by deprecating preset types in favor of flexible summary system ([0c5285f](https://github.com/sergiocarracedo/sc-custom-cards/commit/0c5285f))
- **ui**: Add confirmation dialogs before deleting items ([823cdc8](https://github.com/sergiocarracedo/sc-custom-cards/commit/823cdc8))
- **testing**: Add comprehensive unit tests with >89% coverage (106/118 tests passing) ([17b26ad](https://github.com/sergiocarracedo/sc-custom-cards/commit/17b26ad))

### Bug Fixes

- Remove invalid entity selector area filter (not supported by Home Assistant) ([b175522](https://github.com/sergiocarracedo/sc-custom-cards/commit/b175522))
- Add human-readable labels to action fields using computeLabel callbacks ([b974edb](https://github.com/sergiocarracedo/sc-custom-cards/commit/b974edb))
- Correct button appearance attribute typo ([c830e1d](https://github.com/sergiocarracedo/sc-custom-cards/commit/c830e1d))

### Documentation

- Add TESTING.md with test suite documentation
- Add Allium specification for complete domain modeling

## [1.6.0](https://github.com/sergiocarracedo/sc-custom-cards/compare/sc-custom-cards-v1.5.0...sc-custom-cards-v1.6.0) (2026-03-02)


### Features

* add compact and mini variants for area card ([c84f9dd](https://github.com/sergiocarracedo/sc-custom-cards/commit/c84f9ddfc9eca4b08b150d95a30e48aba8cf2a65))
* add compact and mini variants for area card ([5799794](https://github.com/sergiocarracedo/sc-custom-cards/commit/579979435c9851a180b2ed92a789992d0c2d0b90))
* add confirmation dialogs before deleting items ([823cdc8](https://github.com/sergiocarracedo/sc-custom-cards/commit/823cdc8ea04f31e24256ec2140fd15129b1660ab))
* add translatable strings for all form labels ([d4b0b90](https://github.com/sergiocarracedo/sc-custom-cards/commit/d4b0b909eb51c64b17d1032db53f89ed412b835d))
* add visual editor configuration forms for all cards ([00bb124](https://github.com/sergiocarracedo/sc-custom-cards/commit/00bb124f552da14e5e51a9f052b44a50aef9e2f0))
* Add visual editor configuration forms for all cards ([697a126](https://github.com/sergiocarracedo/sc-custom-cards/commit/697a1269da39fc31c6d3b1b29ae61e1bac89e637))
* history-bars-card ([d471387](https://github.com/sergiocarracedo/sc-custom-cards/commit/d4713876c2e163f745b101e83141b74c6ba53e7e))
* icon and bars actions ([786bb51](https://github.com/sergiocarracedo/sc-custom-cards/commit/786bb515599d5cd52f1f7dd403b9e77a44e16c06))
* icon and bars actions ([83f59dc](https://github.com/sergiocarracedo/sc-custom-cards/commit/83f59dc71c328f73bc14408842723f59c3f6dc78))
* implement custom localization system for card editors ([c34b865](https://github.com/sergiocarracedo/sc-custom-cards/commit/c34b86597e9a2e9effbcd3a4181613ad2053a8f1))
* proportional border radius, padding, and card editor preview heights ([ef6cd09](https://github.com/sergiocarracedo/sc-custom-cards/commit/ef6cd09d8ebe9c192c33e48d40e225db36ce1ac3))
* room-card ([7d80013](https://github.com/sergiocarracedo/sc-custom-cards/commit/7d8001308eaf5207e4bc6e2c959d3a1b7ad2d7f8))
* sc-bars-card ([65c4de8](https://github.com/sergiocarracedo/sc-custom-cards/commit/65c4de87839a3fdc61d804547cb9f314b2a8e0bb))
* sc-bars-card ([2cfccaa](https://github.com/sergiocarracedo/sc-custom-cards/commit/2cfccaa4a632ff71827a55001547c9e3a4fc4b21))
* sc-bars-card beta ([2e8e0d9](https://github.com/sergiocarracedo/sc-custom-cards/commit/2e8e0d9f05e1ee2cd9636b8bb02bb66bf346e858))


### Bug Fixes

* add human-readable labels to action fields and wrap in expandable ([b974edb](https://github.com/sergiocarracedo/sc-custom-cards/commit/b974edb2b364f8d010585c08196812b2482235d6))
* add missing label to Add Summary Type button ([4213aa7](https://github.com/sergiocarracedo/sc-custom-cards/commit/4213aa7b447610f62826b3219976ab3f62225b7c))
* adjust chart position and height to prevent overflow in compact/mini modes ([842b82c](https://github.com/sergiocarracedo/sc-custom-cards/commit/842b82c3bdeffa009957c618bc1a37fae49107bf))
* correct button appearance attribute typo and add styling to all buttons ([c830e1d](https://github.com/sergiocarracedo/sc-custom-cards/commit/c830e1d3f54279caf2599f239886e1a39f510d8e))
* fix release ([a90717c](https://github.com/sergiocarracedo/sc-custom-cards/commit/a90717c2658a89199dc5585c74441ee5113ad964))
* ha-toolbar in HA 2025.10.0 that know uses Webawesome ([9759c6d](https://github.com/sergiocarracedo/sc-custom-cards/commit/9759c6d5b36a197a3183d617fc46cc6b7627467d))
* reduce mini variant card height and icon size ([4d3963e](https://github.com/sergiocarracedo/sc-custom-cards/commit/4d3963ee8e3c841b96a6381fb70255cc2f02aa2e))
* remove invalid entity selector area filter and clean up linter issues ([b175522](https://github.com/sergiocarracedo/sc-custom-cards/commit/b1755221107f2905891dab50431b8f59a62fabd1))
* set humidity chart y-axis to 0-100 scale ([213817a](https://github.com/sergiocarracedo/sc-custom-cards/commit/213817ae7a38980fbac6e0af5343225306ae86fe))
* update AreaCard with latest adjustments ([3be06c1](https://github.com/sergiocarracedo/sc-custom-cards/commit/3be06c185db8b28d13fb91ecf4229552fc23c79f))

## [1.4.1](https://github.com/sergiocarracedo/sc-custom-cards/compare/v1.4.0...v1.4.1) (2025-10-11)

### Bug Fixes

- ha-toolbar in HA 2025.10.0 that know uses Webawesome ([9759c6d](https://github.com/sergiocarracedo/sc-custom-cards/commit/9759c6d5b36a197a3183d617fc46cc6b7627467d))

## [1.4.0](https://github.com/sergiocarracedo/sc-custom-cards/compare/v1.3.0...v1.4.0) (2025-05-26)

### Features

- icon and bars actions ([83f59dc](https://github.com/sergiocarracedo/sc-custom-cards/commit/83f59dc71c328f73bc14408842723f59c3f6dc78))

## [1.3.0](https://github.com/sergiocarracedo/sc-custom-cards/compare/v1.2.0...v1.3.0) (2025-05-18)

### Features

- sc-bars-card ([65c4de8](https://github.com/sergiocarracedo/sc-custom-cards/commit/65c4de87839a3fdc61d804547cb9f314b2a8e0bb))

## [1.1.0](https://github.com/sergiocarracedo/sc-custom-cards/compare/v1.0.1...v1.1.0) (2025-05-18)

### Features

- history-bars-card ([d471387](https://github.com/sergiocarracedo/sc-custom-cards/commit/d4713876c2e163f745b101e83141b74c6ba53e7e))
- sc-bars-card ([2cfccaa](https://github.com/sergiocarracedo/sc-custom-cards/commit/2cfccaa4a632ff71827a55001547c9e3a4fc4b21))
- sc-bars-card beta ([2e8e0d9](https://github.com/sergiocarracedo/sc-custom-cards/commit/2e8e0d9f05e1ee2cd9636b8bb02bb66bf346e858))

### Documentation

- fix bars-card example ([bbd326e](https://github.com/sergiocarracedo/sc-custom-cards/commit/bbd326e9e5dbd4f16a0ecd820560ad6e6f57c584))
- fix docs ([7dfe295](https://github.com/sergiocarracedo/sc-custom-cards/commit/7dfe295a6f00400607a2a7d538ac9adf556841fe))

## [1.1.0](https://github.com/sergiocarracedo/sc-custom-cards/compare/v1.0.1...v1.1.0) (2025-05-18)

### Features

- history-bars-card ([d471387](https://github.com/sergiocarracedo/sc-custom-cards/commit/d4713876c2e163f745b101e83141b74c6ba53e7e))
- sc-bars-card beta ([2e8e0d9](https://github.com/sergiocarracedo/sc-custom-cards/commit/2e8e0d9f05e1ee2cd9636b8bb02bb66bf346e858))

### Documentation

- fix docs ([7dfe295](https://github.com/sergiocarracedo/sc-custom-cards/commit/7dfe295a6f00400607a2a7d538ac9adf556841fe))

## [1.1.0](https://github.com/sergiocarracedo/sc-custom-cards/compare/v1.0.1...v1.1.0) (2025-05-18)

### Features

- history-bars-card ([d471387](https://github.com/sergiocarracedo/sc-custom-cards/commit/d4713876c2e163f745b101e83141b74c6ba53e7e))
- sc-bars-card beta ([2e8e0d9](https://github.com/sergiocarracedo/sc-custom-cards/commit/2e8e0d9f05e1ee2cd9636b8bb02bb66bf346e858))

### Documentation

- fix docs ([7dfe295](https://github.com/sergiocarracedo/sc-custom-cards/commit/7dfe295a6f00400607a2a7d538ac9adf556841fe))

## [1.1.0](https://github.com/sergiocarracedo/sc-custom-cards/compare/v1.0.1...v1.1.0) (2025-05-18)

### Features

- history-bars-card ([d471387](https://github.com/sergiocarracedo/sc-custom-cards/commit/d4713876c2e163f745b101e83141b74c6ba53e7e))
- sc-bars-card beta ([2e8e0d9](https://github.com/sergiocarracedo/sc-custom-cards/commit/2e8e0d9f05e1ee2cd9636b8bb02bb66bf346e858))

### Documentation

- fix docs ([7dfe295](https://github.com/sergiocarracedo/sc-custom-cards/commit/7dfe295a6f00400607a2a7d538ac9adf556841fe))

## [1.0.1](https://github.com/sergiocarracedo/sc-custom-cards/compare/v1.0.0...v1.0.1) (2025-05-11)

### Bug Fixes

- fix release ([a90717c](https://github.com/sergiocarracedo/sc-custom-cards/commit/a90717c2658a89199dc5585c74441ee5113ad964))

## 1.0.0 (2025-05-11)

### Features

- room-card ([7d80013](https://github.com/sergiocarracedo/sc-custom-cards/commit/7d8001308eaf5207e4bc6e2c959d3a1b7ad2d7f8))
