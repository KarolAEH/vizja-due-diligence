# Wdrożenie — VIZJA Agent Due Diligence

Ścieżka taka sama jak przy VIZJA Grow: **GitHub → Render (testy) → serwer uczelni**.

---

## Etap 1 — Kod na GitHub

Plik `.gitignore` jest już przygotowany (`node_modules/` i `data/` są pomijane).

1. Wejdź na https://github.com/new i utwórz **puste** repozytorium
   (bez README, bez .gitignore, bez licencji), np. `vizja-due-diligence`.

2. Otwórz terminal w tym folderze na swoim komputerze i wykonaj
   (podmień URL na adres swojego repo):

   ```bash
   rm -rf .git data            # usuń artefakty ze środowiska Cowork (jednorazowo)
   git init
   git add -A
   git commit -m "Initial commit — VIZJA Agent Due Diligence"
   git branch -M main
   git remote add origin https://github.com/TWOJ-LOGIN/vizja-due-diligence.git
   git push -u origin main
   ```

   Jeśli GitHub poprosi o hasło — użyj **Personal Access Token** (Settings → Developer
   settings → Tokens), nie hasła do konta.

   > Uwaga: folder dostarczony przez Cowork może zawierać niedokończony katalog `.git`
   > i testowy `data/` z mojego środowiska — komenda `rm -rf .git data` na początku
   > usuwa je i zaczyna repo od czysta.

---

## Etap 2 — Render (środowisko testowe)

Projekt zawiera `render.yaml` (Blueprint), więc Render skonfiguruje usługę i dysk
automatycznie.

1. Zaloguj się na https://render.com i wybierz **New → Blueprint**.
2. Połącz swoje konto GitHub i wskaż repozytorium `vizja-due-diligence`.
3. Render odczyta `render.yaml` i pokaże do utworzenia usługę **vizja-due-diligence**
   (Web Service, plan **Starter**, dysk trwały **1 GB** zamontowany w `/var/data`).
4. Zostaniesz poproszony o uzupełnienie zmiennej **`ADMIN_PASSWORD`** — wpisz mocne hasło
   do panelu recenzenta. (`SESSION_SECRET` Render wygeneruje sam, `DB_PATH` jest już ustawiony.)
5. Kliknij **Apply / Create**. Pierwszy build potrwa 1–3 minuty.

Po wdrożeniu Render nada adres typu `https://vizja-due-diligence.onrender.com`:

- Panel recenzenta: `https://…onrender.com/admin`
- Formularz agencji: `https://…onrender.com/form`

### Test workflow na Render
1. Wejdź na `/admin`, zaloguj się hasłem z `ADMIN_PASSWORD`.
2. Zakładka **Linki zaproszeń** → wygeneruj link i otwórz go w innej karcie.
3. Wypełnij formularz (przetestuj EN/PL), wyślij.
4. Wróć do `/admin` → zgłoszenie powinno się pojawić → otwórz i wypełnij ocenę wewnętrzną.
5. Zrób testowy redeploy (Manual Deploy) i sprawdź, że zgłoszenie **nie zniknęło** —
   to potwierdza, że dysk trwały działa.

> Uwaga: w logach Render zobaczysz ostrzeżenie „SQLite is an experimental feature" —
> to normalne dla wbudowanego modułu Node, nie jest błędem.

---

## Etap 3 — Przeniesienie na serwer uczelni (produkcja)

Gdy testy wypadną dobrze:

1. Na serwerze uczelni zainstaluj **Node.js 22.12+** i sklonuj repozytorium:
   ```bash
   git clone https://github.com/TWOJ-LOGIN/vizja-due-diligence.git
   cd vizja-due-diligence
   npm install
   ```

2. Ustaw zmienne środowiskowe i uruchom (przykład Linux):
   ```bash
   export ADMIN_PASSWORD="mocne-haslo"
   export SESSION_SECRET="długi-losowy-ciąg-znaków"
   export DB_PATH="/opt/vizja/data/vizja.db"     # trwała ścieżka na serwerze
   export PORT=3000
   npm start
   ```

3. Utrzymanie procesu i HTTPS:
   - Proces w tle: `pm2 start server.js --name vizja` (lub usługa `systemd`).
   - Postaw przed aplikacją **reverse proxy** (nginx) z certyfikatem HTTPS
     (Let's Encrypt) i przekieruj na port aplikacji.

4. **Migracja danych z Render (jeśli chcesz zachować zgłoszenia testowe):**
   pobierz plik bazy z dysku Render (przez Shell w panelu usługi: `/var/data/vizja.db`)
   i skopiuj go na serwer uczelni do ścieżki `DB_PATH`. Cała baza to ten jeden plik.

---

## Najważniejsze zmienne środowiskowe

| Zmienna | Znaczenie | Uwaga |
|---|---|---|
| `ADMIN_PASSWORD` | hasło do `/admin` | ustaw zawsze, mocne |
| `SESSION_SECRET` | podpis ciasteczka logowania | stały, długi, losowy |
| `DB_PATH` | ścieżka pliku bazy | wskaż lokalizację trwałą |
| `PORT` | port nasłuchu | Render ustawia sam |

Backup = kopia pliku spod `DB_PATH`. To cały zbiór danych systemu.
