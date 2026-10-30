# Louder Studio Card

Home Assistant-audiobediening voor twee Louder ESP32 Pro-boards, met 15-bands EQ-profielen en vier instelbare stijlen.

## Status

Versie 2.1.0 is een prototype. De berekeningen en bediening worden automatisch met fictieve gegevens getest. De echte audioverbinding, timing en werking op de speakers moeten ook in Home Assistant worden gecontroleerd. Er vindt geen automatische installatie in Home Assistant plaats.

## Uiterlijk en bediening

- Modern spectrum, Retro spectrum, Vintage hifi en Midnight studio.
- Spectrum of analoge meters, onafhankelijk van de gekozen stijl.
- Accentkleur, spectrumtop/naald, achtergrond en meterverlichting.
- Iedere stijl onthoudt zijn eigen kleuren; voorkeuren worden per browser bewaard.
- Groepsvolume, aparte speakerbediening, kanaalmix, 15 EQ-banden en negen profielen: Vlak, Bas, Disco, Rock, Pop, Jazz, Klassiek, Zang en Nacht.

De kaart verandert geen volume, EQ of afspeelstatus bij het openen.

## Audio: live en demo

**Live Music Assistant** leest timestamped audiodata via de MilkDrop Visualizer-plugin en de bestaande Home Assistant-ingressverbinding. De kaart bevat geen ingebouwd toegangstoken en opent geen audio-uitgang in de browser.

De meters meten RMS van het gemengde **mono-bronsignaal**, vóór de DSP-instellingen op de boards. Beide naalden tonen dus dezelfde bron; het zijn geen afzonderlijke metingen aan de fysieke speakeruitgangen. De schaal is dBFS, met 300 ms niveaudemping en een gedempte naaldbeweging.

Het spectrum gebruikt een FFT op dezelfde samples. De frequentieaanduiding is relatief, omdat de relay geen samplefrequentie meestuurt. Bij ontbrekende of verouderde data valt de weergave stil; er wordt niet automatisch naar een demo overgeschakeld.

**Demo-animatie** is apart te kiezen. Het lokale voorbeeld gebruikt uitsluitend fictieve gegevens en verstuurt nooit opdrachten naar echte apparaten.

## Installeren in Home Assistant

1. Download het bestand `louder-amplifier-card.js`, of de kaart uit het artifact van een geslaagde Actions-run.
2. Plaats het in `/config/www/louder-studio-card/`.
3. Registreer `/local/louder-studio-card/louder-amplifier-card.js?v=2.1.0` als JavaScript-module bij de dashboardresources. Werk bij een bestaande installatie de bestaande resource bij, zodat de kaart eenmaal geregistreerd is.
4. Gebruik `examples/card.json` als kaartconfiguratie en vervang de entity-ID's door die van jouw installatie.
5. Herlaad de browser volledig.

Live visualisatie verwacht de Music Assistant-app met slug `d5369777_music_assistant`, de ingebouwde MilkDrop Visualizer-plugin, en een `music_assistant`-media-playerentity als groep. De module gebruikt de bestaande HA-aanmelding; er hoeft geen token in de kaartconfiguratie te worden geplakt.

De JSON-kaartconfiguratie is ook geldig in de handmatige YAML-kaarteditor. Het voorbeeld koppelt alleen de 15 EQ-banden die door de boardfirmware worden aangeboden.

## Testen

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

GitHub Actions draait de unit-tests op Node 22 en 24 en de browserproeven in Chromium. Tests gebruiken gegenereerde PCM-samples en fictieve HA-statussen; er zijn geen HA-inloggegevens nodig.

De tests controleren profielen en foutafhandeling, kleur- en stijlvoorkeuren, RMS/FFT, klok- en frametiming, verouderde data, styleswitches en de bewegingsreactie van de meters. Een groene run bewijst geen fysieke speaker- of netwerkintegratie.

## Lokaal voorbeeld

```sh
npm run preview
```

Open vervolgens http://127.0.0.1:18905. De server luistert alleen lokaal. Er zijn geen productiegegevens, dashboardback-ups of toegangstokens in deze repository opgenomen.

## Bronnen

- [Music Assistant MilkDrop Visualizer](https://www.music-assistant.io/plugins/milkdrop-visualizer/)
- [Relayprotocol in Music Assistant 2.10.8](https://github.com/music-assistant/server/blob/2.10.8/music_assistant/providers/milkdrop_visualizer/relay.py)
- [Audioverwerking in Music Assistant](https://github.com/music-assistant/server/blob/2.10.8/music_assistant/providers/milkdrop_visualizer/tap.py)
- [Home Assistant-ingress](https://github.com/home-assistant/frontend/blob/20260930.5/src/data/hassio/ingress.ts)

