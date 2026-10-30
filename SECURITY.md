# Security

Report vulnerabilities with [private vulnerability reporting](https://github.com/tlpeter/multiroom-audio-dashboard/security/advisories/new). Do not post credentials, ingress URLs or personal data in public issues. Include affected version, reproduction steps and impact with synthetic examples.

This project is currently a beta. Security fixes target the newest release and dev. There is no guaranteed response time or independent security certification.

The dashboard executes in your Home Assistant frontend with your existing account permissions. Review custom frontend code before installing. It contains no embedded credentials, no analytics, no third-party runtime libraries, no external fonts and no remote script loading. Music Assistant audio access uses the official same-origin HA ingress route and an ephemeral session; no token belongs in card configuration or local storage.

Device commands are restricted to explicitly configured entities, domains, supported HA capabilities and validated values/options. Only a deliberate user action sends commands. Opening a card or changing colors does not change speakers. A configured player list is never treated as group membership.

CI scans JavaScript with CodeQL, checks npm dependencies and scans the Git history with Gitleaks. GitHub secret scanning, push protection, Dependabot alerts and security updates are enabled. Checks reduce risk; they cannot prove the absence of vulnerabilities or validate physical hardware.
