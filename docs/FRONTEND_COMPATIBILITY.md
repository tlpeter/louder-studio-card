# Native speaker-editor shortcut

The card's top button dispatches HA's native `ll-edit-card` event. It does not import private hashed frontend bundles, call dashboard save APIs, or persist speaker choices itself. Native HA owns the edit dialog and Save/Cancel.

The adapter walks only its own composed ancestors to find its `hui-card` and `hui-view`. It resolves the card against that view's current configuration by identity, with an exact, unique configuration match as a fallback for cloned objects. Ambiguous targets fail visibly. No global DOM search or entity-only matching is used.

HA 2026.10 uses numeric paths: `[view, card]` and `[view, section, card]`. Newer frontends use named paths such as `["views", 0, "cards", 1]`. The adapter uses an existing edit wrapper's exact path when present and the layout's path shape otherwise. Legacy nested container paths, YAML dashboards and strategy-generated views fall back to the standard HA editor. Non-admin users cannot activate the shortcut; HA/backend permissions remain authoritative.

Browser checks simulate both path formats, multiple cards, sections, unavailable targets, permission restrictions and Save/Cancel, with screenshots on desktop/mobile. This is not a full live HA integration test. These frontend internals may change in future HA releases, so incompatibility must fail without writing configuration or device state.

Primary sources:

- [HA 2026.10 view edit-event handler](https://github.com/home-assistant/frontend/blob/20260930.5/src/panels/lovelace/views/hui-view.ts)
- [HA 2026.10 panel card path](https://github.com/home-assistant/frontend/blob/20260930.5/src/panels/lovelace/views/hui-panel-view.ts)
- [Current view edit-event handler](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/views/hui-view.ts)
- [Native card edit button/event](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/components/hui-card-options.ts)
