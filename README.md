# ArchiMate-viewer

Een interactieve viewer voor ArchiMate-modellen die met Archi (coArchi) in een GitHub-repository
worden beheerd. De viewer wordt gepubliceerd op GitHub Pages; het model staat er versleuteld naast
en is alleen met een wachtwoord te openen.

## Gebruiken

Open de website van de viewer en vul het wachtwoord in. De browser kan het onthouden; met
*Vergrendelen* (linksboven) wis je dat weer.

- **Klik op een element**: alleen de relaties van dat element en de elementen aan de andere kant
  blijven zichtbaar. De rest wordt vervaagd of verborgen (knoppen *Vervagen* / *Verbergen*).
- **Shift-klik** voegt een element toe aan de selectie; klik op een lijn om beide uiteinden te kiezen.
- **Stappen** (1–3): ook de relaties van de gevonden elementen meenemen.
- Klik op een groepering om de relaties van alles wat erin zit te tonen.
- Rechts staan documentatie, eigenschappen, alle relaties van het element (ook die niet in deze
  view zijn getekend) en de andere views waarin het voorkomt.
- Relatietypen per view aan- en uitvinken, zoeken op naam of eigenschap (toets `/`), slepen om te
  verschuiven, scrollen om te zoomen.
- De adresbalk bevat de view en de selectie, dus een link is deelbaar (de ontvanger heeft het
  wachtwoord nodig).

## Hoe de beveiliging werkt

Deze repository en de website zijn openbaar, maar bevatten geen leesbare modelgegevens. De
workflow *Viewer publiceren* haalt het model uit de besloten modelrepository, comprimeert het en
versleutelt het met AES-256-GCM. De sleutel wordt met PBKDF2 (600.000 rondes) uit het wachtwoord
afgeleid. De browser ontsleutelt het model lokaal; het wachtwoord wordt nergens naartoe gestuurd.

Houd rekening met het volgende:

- Het is één gedeeld wachtwoord. Wie het kent, kan het model openen; iemand de toegang ontnemen
  kan alleen door het wachtwoord te wijzigen.
- Het versleutelde bestand is voor iedereen te downloaden, dus een aanvaller kan ongestoord
  wachtwoorden proberen. Kies daarom een lang wachtwoord, bijvoorbeeld een zin van vijf
  willekeurige woorden. De bouwstap weigert wachtwoorden korter dan 12 tekens.

## Inrichten (eenmalig)

1. **Deploy key**: maak een SSH-sleutelpaar (`ssh-keygen -t ed25519 -N "" -f modelkey`). Voeg de
   publieke sleutel toe aan de modelrepository onder *Settings > Deploy keys* (zonder schrijfrechten).
2. **Secrets** in deze repository onder *Settings > Secrets and variables > Actions*:
   - `MODEL_DEPLOY_KEY`: de inhoud van de privésleutel;
   - `VIEWER_PASSWORD`: het wachtwoord voor gebruikers.
3. **Pages**: zet onder *Settings > Pages* de bron op *GitHub Actions*.
4. Start de workflow *Viewer publiceren* onder *Actions* met *Run workflow*.

De modelrepository staat in `.github/workflows/publiceren.yml` bij `MODEL_REPO`.

## Bijwerken

- De workflow kijkt op werkdagen elk half uur of het model is gewijzigd en publiceert alleen dan.
- Direct bijwerken of **het wachtwoord wijzigen**: pas zo nodig het secret aan en kies
  *Actions > Viewer publiceren > Run workflow*.
- GitHub schakelt geplande workflows uit als een repository 60 dagen geen commits heeft gehad.
  GitHub stuurt daarover vooraf een e-mail; de planning is onder *Actions* weer aan te zetten.

## Lokaal bouwen

```
VIEWER_PASSWORD='een lang wachtwoord' node build.mjs --model <pad naar modelrepository> --out _site
python3 -m http.server --directory _site 8000     # open daarna http://localhost:8000
```

## Beperkingen

- Ondersteunt ArchiMate-views in het coArchi-formaat (map `model/`); sketch- en canvasviews niet.
- De weergave benadert Archi, maar is niet pixelgelijk (lettertype, pictogrammen, lijnaanhechting).
- Afbeeldingen in views en verbindingen naar andere verbindingen worden niet getekend.
