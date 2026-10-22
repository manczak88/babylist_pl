# Lista od Serca

Polski prototyp list prezentowych: Next.js, TypeScript, Tailwind CSS i SQLite. Node.js 22 lub 24. Bez kont, e-maili i płatności.

## Uruchomienie

```sh
npm ci
# Opcjonalnie: skopiuj .env.example do .env i zmień lokalizację bazy.
npm run db:init
npm run build
npm run start
```

Otwórz http://localhost:3000. Lista pokazowa: http://localhost:3000/lista/demo.
Baza powstaje automatycznie także przy pierwszym uruchomieniu serwera. Polecenie `db:init` jest idempotentne. Domyślny plik `data/lista.sqlite` jest ignorowany przez Git. Nie usuwaj go przy restarcie. `DATABASE_PATH` może wskazywać inną trwałą lokalizację; dla CLI ustaw tę zmienną w powłoce (CLI nie wczytuje `.env`, Next.js wczytuje).

Ponowna kompilacja po zmianach:

```sh
npm run build
npm run start
```

Opcjonalny tryb z automatycznym odświeżaniem: `npm run dev`. Wymaga obsługi WebSocket przez połączenie z serwerem. W tym środowisku cloud testy przeglądarkowe wykonano na wersji po kompilacji, ponieważ połączenie WebSocket trybu developerskiego było odrzucane.

## Działanie

- Utworzenie listy przekierowuje do prywatnego panelu. Zapisz jego adres: nie ma odzyskiwania linku przez e-mail. Do rodziny wysyłaj wyłącznie link gościa z panelu.
- Panel umożliwia zmianę szczegółów, ręczne dodawanie, edycję i usuwanie prezentów. Usunięcie wymaga potwierdzenia i usuwa powiązaną rezerwację.
- Goście rezerwują prezent, podając tylko imię. Otrzymują osobny prywatny link do oznaczania zakupu, cofania oznaczenia i anulowania rezerwacji. Imię nie jest widoczne w publicznym API ani na liście.
- Dostępność jest odświeżana co 10 sekund i po powrocie do okna. Konflikt jednoczesnych rezerwacji ma komunikat po polsku. Transakcja SQLite i unikalny klucz rezerwacji zapobiegają podwójnemu zapisowi.
- Lista pokazowa ma sześć ilustracyjnych prezentów i ceny, bez zmyślonych sklepów. Rezerwacje na demo są wyłączone; przetestuj je na własnej liście.

## Sprawdzenie

```sh
npm run typecheck
npm test
npm run build
npm run test:restart
# Wymaga Chromium:
npx playwright install chromium
npm run test:e2e
# Alternatywnie użyj lokalnej przeglądarki:
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
```

Test `test:restart` uruchamia serwer produkcyjny na porcie 3109, zapisuje listę i rezerwację, zatrzymuje proces i sprawdza je po ponownym uruchomieniu. Wymaga wcześniejszej kompilacji.

Cztery testy bazy sprawdzają prywatność, uprawnienia, bezpieczne URL-e i odczyt z nowego procesu po zamknięciu bazy. Testy Playwright sprawdzają pełny przepływ w osobnych kontekstach, równoległe żądania i brak przewijania poziomego na telefonie oraz desktopie. Testy przeglądarkowe tworzą listy w aktualnej bazie; można użyć osobnej bazy, np. `DATABASE_PATH=/tmp/lista-e2e.sqlite CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e` przy zatrzymanym serwerze. Zrzuty są zapisywane w `test-results/`.

## Prywatność i ograniczenia prototypu

Link jest uprawnieniem: każdy z linkiem gościa widzi listę, każdy z prywatnym linkiem zarządza jej danymi. Tokeny mają 256 bitów losowości. Serwer sprawdza uprawnienia niezależnie od UI; publiczne odpowiedzi nie zawierają tokenów właścicieli ani rezerwacji. Strony mają `noindex` i `no-referrer`; nie używają analityki. Zewnętrzne linki otwierają się bez przekazywania referrera; akceptowane są tylko http/https. Zewnętrzne zdjęcia są pobierane przez przeglądarkę z podanego adresu. Nie podawaj danych wrażliwych w tytułach i notatkach. Nie konfiguruj logów serwera/proxy tak, by zapisywały prywatne ścieżki URL.

To lokalny prototyp na jednym serwerze i trwałym dysku. Brak odzyskiwania tokenów, automatycznego wygasania rezerwacji, moderacji, limitowania żądań, kont i kopii zapasowych. Nie jest przygotowany do publicznego uruchomienia. Obsługa bazy znajduje się w `src/lib/db.ts`, oddzielnie od widoków i endpointów, do późniejszej migracji. Dla kopii bazy użyj mechanizmu SQLite backup lub zatrzymaj serwer i skopiuj cały katalog `data` (wraz z plikami WAL). Nie dodawaj bazy ani prywatnych linków do repozytorium.
