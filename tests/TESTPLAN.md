# Testplan

`npm test` controleert syntax, negen EQ-profielen, selectie van speaker, atomic preflight, stop na fout, kleuren/opslag, RMS/FFT, framedecodering, authenticatieroute, timing en stale-data-afhandeling. Capabilitytests oefenen iedere aangeboden servicebit afzonderlijk, ontbrekende capabilities, ongeldige invoer, domein-/entity-isolatie en mute van uitsluitend de hoofdspeler.

GitHub Actions draait unit-tests op Node 22 en 24, Chromium-tests met desktop- en mobiele schermafbeeldingen, en beveiligingscontroles. Browserproeven controleren alle vier stijlen, kleurbehoud, EQ, live naaldbeweging, generieke speakers zonder EQ en verdwijnen van niet-ondersteunde functies. Testresultaten en screenshots zijn per run als artifacts beschikbaar. Resultaten worden niet als succes teruggeschreven naar bronbestanden.

CodeQL controleert JavaScript, Gitleaks de volledige Git-historie, npm audit afhankelijkheden. Dependabot controleert updates. Iedere release is gekoppeld aan het exacte commit waarvan de Tests-workflow is geslaagd. Fouten blokkeren de automatische publicatie.

Praktijktests zijn apart vastgelegd in docs/SPEAKER_SUPPORT.md en hardware-issues. GitHub heeft geen toegang tot de speakers en kan die tests niet uitvoeren. Een beta blijft een beta totdat de relevante werkelijke routes zijn getest.
