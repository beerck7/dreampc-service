# DreamPC Service

## O projekcie

Strona serwisu komputerowego z ofertą usług, konfiguratorem preferencji PC i formularzem zgłoszenia. Powstała w HTML, SCSS i Vanilla JavaScript, bez frameworka i bundlera. Oferta i zdjęcia są poglądowe, a formularz działa wyłącznie jako demo.

[Otwórz demo](https://beerck7.github.io/dreampc-service/)

## Najważniejsze funkcje

- Filtrowanie usług według rodzaju naprawy.
- Konfigurator zastosowania komputera, budżetu, wyglądu i akcesoriów.
- Przenoszenie wybranych preferencji do formularza.
- Trzy kroki formularza, walidacja pól i podsumowanie.
- Lokalny numer demo i pobieranie potwierdzenia jako pliku TXT.
- Menu mobilne, FAQ oraz obsługa formularza klawiaturą.

**Formularz nie wysyła danych i nie zapisuje ich w przeglądarce.** Użyj przykładowych danych. Podsumowanie powstaje lokalnie; pobrany plik zostaje na Twoim urządzeniu. Konfigurator zbiera preferencje, ale nie dobiera części ani nie składa zamówienia.

## Technologie

HTML5, SCSS, BEM, Vanilla JavaScript, Sass. Testy: Playwright Core i axe-core.

Style bazowe dotyczą telefonów; większe ekrany dodają kolumny i szerszą nawigację. Strona ma widoczny fokus, podpisane pola i obsługę ograniczonych animacji. Obrazy WebP i font Manrope są ładowane lokalnie. Źródła grafik i licencje opisuje [docs/ASSETS.md](docs/ASSETS.md).

## Uruchomienie

Wymagany Node.js 22+.

```sh
npm ci
npm run dev
```

Otwórz `http://127.0.0.1:4175`. Po zmianie SCSS wykonaj `npm run styles` albo włącz `npm run styles:watch` w drugim terminalu.

```sh
npm test
npm run build
```

Build zapisuje stronę w `dist/`. Testy wymagają Google Chrome; inną przeglądarkę Chromium można wskazać przez `CHROME_PATH`.

Pomocnicze szablony grafik są w `tools/materials.html`. Polecenie `npm run export` zapisuje je jako PNG i PDF w pomijanym przez Git katalogu `exports/`. Nie są częścią publicznej strony.

## Zrzuty ekranu

![Strona na komputerze](docs/images/desktop.webp)

<details>
<summary>Widok na telefonie</summary>

![Strona na telefonie](docs/images/mobile.webp)

</details>

## Co było celem projektu

Przygotowanie strony, na której można szybko znaleźć usługę i opisać problem ze sprzętem. Najwięcej uwagi poświęciłem formularzowi, czytelności na telefonie i dostępności bez dokładania frameworka.
