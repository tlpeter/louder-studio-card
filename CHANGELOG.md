# Changelog

## 2.2.0-beta.1

- Rename public project to Multiroom Audio Dashboard; retain legacy card type, resource filename and preferences.
- Accept one or more generic Home Assistant players. Show controls according to the actual HA capabilities, including native source/sound mode, seek, power, shuffle and repeat.
- Keep explicitly configured ESPHome EQ, mixer, trims and diagnostics optional.
- Mute only the configured main entity; never assume configured speakers are group members.
- Validate service/domain, entity, capability, values, step and choice lists before dispatch; strip unrelated payload fields.
- Add issue templates, charger-style labels, dev branch, beta releases, hardware tracking, CodeQL, dependency audit, secret scanning and Dependabot.
- Document naming research and the distinction between protocol tests and real speaker verification.

## 2.1.0

- Initial four styles, independent colors, EQ presets and Music Assistant waveform source meters with CI unit/browser tests. Prototype; not released to Home Assistant automatically.
