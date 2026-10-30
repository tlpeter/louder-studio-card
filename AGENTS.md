# Project working rules

- Explain outcomes to Peter in plain Dutch. Do the work already authorized; do not repeatedly ask for the same permission.
- Read git status and fetch main/dev before changes. Preserve other contributors' edits. Never force push or rewrite published history.
- Develop on dev. Main contains reviewed release candidates and releases. Only push/publish with owner authorization (the initial public setup, tests, security and first beta release are authorized).
- Keep version in package.json, package-lock.json, card header, changelog and release notes aligned. Versions on dev are prereleases; stable versions require real hardware evidence for the claimed scope.
- Keep legacy custom:louder-amplifier-card, its JavaScript resource filename and appearance storage keys working. Public branding is Multiroom Audio Dashboard.
- Device support is capability driven through Home Assistant. Do not infer support from a brand name. Never describe mocked tests as physical certification.
- Do not embed credentials, private HA URLs, backups or production state snapshots. Use synthetic fixtures only.
- Never change sound/volume/playback on load. Bound values, validate options and supported_features, and target only configured entities. Speaker lists are not implicit groups.
- Run npm test; GitHub CI runs browser tests, security checks and release gating. UI changes require desktop/mobile coverage. Record untested hardware in docs/SPEAKER_SUPPORT.md and issues.
- Do not introduce a dependency without a concrete need and security/license review. Pin Actions by commit and use minimal permissions. Release only the exact commit whose Tests workflow passed.
