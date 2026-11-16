# ArchiMate-viewer

Een interactieve viewer voor ArchiMate-modellen die met Archi (coArchi) in een GitHub-repository
worden beheerd. De viewer is één los bestand, `index.html`. Het bevat zelf geen modelgegevens:
bij het openen haalt het het actuele model rechtstreeks uit de GitHub-repository.

## Gebruiken

1. Download `index.html` (open het bestand op GitHub en kies *Download raw file*).
2. Open het bestand in een browser (Chrome, Edge, Firefox of Safari).
3. Vul bij de eerste keer een persoonlijk toegangstoken in. Het scherm legt uit hoe je dat maakt:
   een *fine-grained token* met alleen **Contents: Read-only** op de repository met het model.

Daarna opent de viewer direct. Het token blijft in de browser staan en wordt alleen naar
`api.github.com` gestuurd; de pagina kan technisch met geen enkele andere server verbinden.

Wie geen leesrechten op de modelrepository heeft, krijgt het model niet te zien. De toegang wordt
dus volledig door GitHub geregeld.

## Wat kun je ermee

- **Klik op een element**: alleen de relaties van dat element en de elementen aan de andere kant
  blijven zichtbaar. De rest wordt vervaagd of verborgen (knoppen *Vervagen* / *Verbergen*).
- **Shift-klik** voegt een element toe aan de selectie; klik op een lijn om beide uiteinden te kiezen.
- **Stappen** (1–3): ook de relaties van de gevonden elementen meenemen.
- Klik op een groepering om de relaties van alles wat erin zit te tonen.
- Rechts staan documentatie, eigenschappen, alle relaties van het element (ook die niet in deze
  view zijn getekend) en de andere views waarin het voorkomt.
- Relatietypen per view aan- en uitvinken, zoeken op naam of eigenschap (toets `/`), slepen om te
  verschuiven, scrollen om te zoomen.
- De adresbalk bevat de view en de selectie.

## Als het niet lukt

De viewer meldt wat er mis is en wat je kunt doen:

| Melding | Betekenis |
|---|---|
| Geen verbinding met GitHub | `api.github.com` is niet bereikbaar. Is het model eerder geladen, dan toont de viewer de laatst bewaarde versie. |
| Het token is ongeldig of verlopen | Maak een nieuw token aan. |
| Geen toegang tot *repository* | De repository bestaat niet of het token mag er niet bij. |
| Het token is niet vrijgegeven voor de organisatie | De organisatie gebruikt single sign-on; autoriseer het token. |
| De limiet van GitHub is bereikt | Te veel aanvragen; de melding noemt het tijdstip waarna het weer kan. |
| Branch niet gevonden / Geen ArchiMate-model gevonden | De repository is bereikbaar, maar bevat niet wat de viewer verwacht. |

## Andere repository of branch

Standaard opent de viewer `Gemeente-Heerlen/Heerlen-Architectuur-Next-Gen`. Een andere repository
of branch kies je via *Instellingen* in de viewer, of in de adresbalk:
`index.html?repo=eigenaar/naam&ref=branch`. De standaard staat in `index.html` in de constante
`DEFAULT_REPO`.

## Beperkingen

- Ondersteunt ArchiMate-views in het coArchi-formaat (map `model/`); sketch- en canvasviews niet.
- De weergave benadert Archi, maar is niet pixelgelijk (lettertype, pictogrammen, lijnaanhechting).
- Afbeeldingen in views en verbindingen naar andere verbindingen worden niet getekend.
- De eerste keer laden duurt enkele seconden; daarna wordt het model per versie in de browser bewaard.
