# Wdrażanie aplikacji (Deployment) na Railway.app

Aplikacja jest w pełni gotowa do uruchomienia na jednym, darmowym hostingu jako zintegrowana aplikacja webowa + serwer Multiplayer (WebSocket).

Najprostszą opcją jest darmowy hosting **Railway.app**.

## Krok po kroku:

1. **Wrzuć kod na GitHub:**
   - Upewnij się, że cały twój kod (folder `VStrategy`) znajduje się w repozytorium na Twoim koncie GitHub.

2. **Zaloguj się na Railway:**
   - Wejdź na stronę [railway.app](https://railway.app) i zaloguj się za pomocą konta GitHub.

3. **Utwórz nowy projekt (New Project):**
   - Na pulpicie kliknij przycisk **"New Project"**.
   - Wybierz opcję **"Deploy from GitHub repo"**.
   - Wybierz swoje repozytorium z aplikacją.

4. **Konfiguracja budowania (Build) na Railway:**
   - Railway automatycznie wykryje, że jest to projekt Node.js.
   - W ustawieniach (Settings) serwisu w Railway, w zakładce "Build", upewnij się, że "Build Command" to `npm run build` (Railway sam uruchomi proces instalacji paczek i kompilacji frontend'u Vite do folderu `dist`).
   - Polecenie startowe ("Start Command") zostaw domyślne lub ustaw na `npm start` (plik `package.json` ma odpowiedni skrypt, który uruchomi nasz połączony serwer Express w pliku `server/index.js`).

5. **Domeny (Networking):**
   - W ustawieniach serwisu na Railway przejdź do zakładki "Networking".
   - Kliknij "Generate Domain", aby otrzymać darmowy adres URL (np. `twoja-nazwa.up.railway.app`).

6. **Gotowe!**
   - Twój serwer uruchomi się, zaserwuje graczom zoptymalizowaną stronę React, a pod tym samym adresem automatycznie obsłuży pokoje Multiplayer.
