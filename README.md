# Multiroom Audio Dashboard

Home Assistant-audiobediening met vier instelbare stijlen, spectrum of analoge bronmeters, eigen kleuren en optionele equalizerbediening. Voorheen Louder Studio Card.

**Status: 2.2.0-beta.1.** Automatisch getest met fictieve HA-statussen en PCM-audio. Praktijktests per speaker/integratie staan nog open. GitHub kan geen apparaten bij jou thuis testen. Deze repository installeert niets automatisch in Home Assistant.

## Installeren via HACS

1. Open HACS → menu → **Aangepaste repositories**.
2. Voeg `https://github.com/tlpeter/multiroom-audio-dashboard` toe als type **Dashboard**.
3. Download Multiroom Audio Dashboard. Kies bij versie-selectie beta's als je deze prerelease wilt gebruiken.
4. Controleer de dashboardresource: `/hacsfiles/multiroom-audio-dashboard/louder-amplifier-card.js`, type JavaScript-module. Herlaad de browser volledig.
5. Voeg een handmatige kaart toe met je eigen entiteiten:

```yaml
type: custom:multiroom-audio-dashboard
entity: media_player.woonkamer
players:
  - player: media_player.woonkamer
    name: Woonkamer
  - player: media_player.keuken
    name: Keuken
```

`entity` is de expliciete hoofdspeler of bestaande groep. `players` bevat 1–32 individuele spelers. Zonder `players` toont de kaart alleen de hoofdspeler. De kaart maakt zelf geen groep en verandert geen volume of afspeelstatus bij openen.

Bij een bestaande installatie: vervang de oude inline/lokale resource eenmalig door bovenstaande HACS-resource. Laad maar **één versie** van het JavaScript. Je oude `custom:louder-amplifier-card`-type, `boards`-configuratie en stijlvoorkeuren blijven werken. De oude bestandsnaam is behouden voor compatibiliteit. Gebruik voor nieuwe HACS-installaties het nieuwe GitHub-adres.

Zonder HACS: plaats het releasebestand `louder-amplifier-card.js` in `/config/www/multiroom-audio-dashboard/`, registreer `/local/multiroom-audio-dashboard/louder-amplifier-card.js?v=2.2.0-beta.1` als module en herlaad. Een HA-herstart is niet nodig voor deze frontendresource.

## Uiterlijk en bediening

- Modern spectrum, Retro spectrum, Vintage hifi en Midnight studio; analoge meters of spectrum onafhankelijk van de stijl.
- Accent, spectrumtop/naald, achtergrond en meterverlichting. Iedere stijl onthoudt zijn eigen kleurkeuze per browser.
- Afspelen/pauze/stop, vorige/volgende, volume, mute, volumestappen, aan/uit, bron, native geluidsprofiel, positie, shuffle en herhalen, uitsluitend wanneer de HA-speler de functie aanbiedt.
- **Speler ↗** opent de native HA-bediening voor overige functies en groepering, voor zover de integratie die aanbiedt.
- Optionele ESPHome-instellingen: mixer, uitgangstrims, sensoren en 15-bands EQ. Profielen: Vlak, Bas, Disco, Rock, Pop, Jazz, Klassiek, Zang en Nacht. [Voorbeeldconfiguratie](examples/card.json).

Een speaker met een bassregelaar heeft niet automatisch een 15-bands EQ. Zie de [ondersteunings- en testmatrix](docs/SPEAKER_SUPPORT.md) voor alle speakerfamilies en openstaande praktijktests.

## Echte bronmeters en demo

**Live Music Assistant** leest waveformdata via MilkDrop en de bestaande, same-origin HA-ingressverbinding. Er zijn geen ingebouwde toegangstokens. De browser speelt zelf geen audio af.

De meters tonen RMS van het gemengde **mono-bronsignaal**, vóór speaker-DSP. Beide naalden tonen dezelfde bron. Het zijn geen afzonderlijke metingen van fysieke linker/rechter uitgangen. De schaal is dBFS met 300 ms niveaudemping en gedempte naaldbeweging. Het spectrum gebruikt FFT met relatieve frequenties, omdat het relayprotocol geen samplefrequentie meestuurt.

Bij ontbrekende of verouderde data stoppen de meters. Er is geen automatische demo-fallback. **Demo-animatie** is expliciet te kiezen en wordt als demo aangeduid. Een gewone HA-speaker zonder MA-waveformbron heeft wel bediening, maar geen echte bronmeters.

Live verwacht een `music_assistant`-media_player, de Music Assistant-app (`d5369777_music_assistant`) en de MilkDrop Visualizer-plugin. Andere installatieroutes zijn nog niet gevalideerd. Geen token in de configuratie plakken.

## Ontwikkeling, testen en beveiliging

`dev` bevat testversies; `main` de versie voor release. Issues hebben dezelfde labels als Smart Charging Planner, met formulieren voor bugs, functies en echte hardwaretests. Releases verschijnen alleen na een geslaagde Tests-workflow op hetzelfde main-commit. Beta's blijven herkenbaar als prerelease.

```sh
npm ci --ignore-scripts
npm test
npx playwright install chromium
npm run test:browser
```

GitHub Actions controleert Node 22/24, Chromium desktop/mobiel, EQ, kleuren, live bronmeters en generieke capabilities. CodeQL, npm audit en Gitleaks draaien mee als releasevoorwaarde. Dependabot controleert npm en Actions. Geheimmeldingen, pushbeveiliging en automatische beveiligingsupdates zijn op GitHub ingeschakeld. Zie [testplan](tests/TESTPLAN.md), [beveiliging](SECURITY.md) en [changelog](CHANGELOG.md).

Lokaal voorbeeld: `npm run preview`, daarna `http://127.0.0.1:18905`. Het voorbeeld gebruikt fictieve gegevens en stuurt geen opdrachten naar apparaten. De previewserver luistert uitsluitend lokaal.

## Naam en bronnen

De neutrale naam beschrijft het project. Dit is geen officieel product van een speakerfabrikant. [Naamonderzoek en beperkingen](docs/NAME_REVIEW.md): bestaand Louder-gebruik is gevonden; volledige juridische merkenvrijgave is niet uitgevoerd.

- [HA media-playercontract](https://developers.home-assistant.io/docs/core/entity/media-player/)
- [Music Assistant MilkDrop](https://www.music-assistant.io/plugins/milkdrop-visualizer/)
- [Relayprotocol MA 2.10.8](https://github.com/music-assistant/server/blob/2.10.8/music_assistant/providers/milkdrop_visualizer/relay.py)
- [Audioverwerking](https://github.com/music-assistant/server/blob/2.10.8/music_assistant/providers/milkdrop_visualizer/tap.py)
- [HA-ingress](https://github.com/home-assistant/frontend/blob/20260930.5/src/data/hassio/ingress.ts)
- [HACS custom repositories](https://www.hacs.dev/docs/faq/custom_repositories/)
