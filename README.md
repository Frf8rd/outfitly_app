# Stilora (outfitly_app)

Aplicație Expo (client) + API Node/Express/Prisma (server, Postgres pe Neon).

## Rulare locală
```bash
cd server && cp .env.example .env   # completează DATABASE_URL, DIRECT_URL, JWT_SECRET
npm install && npx prisma migrate deploy && npm run db:seed && npm run dev

cd client && cp .env.example .env   # EXPO_PUBLIC_API_URL cu IP-ul calculatorului
npm install && npx expo install expo-notifications && npx expo start
```

## API (prefix `/api`, toate cu `Authorization: Bearer`, în afară de `/auth/*`)
| Zonă | Rute |
|---|---|
| Auth | `POST /auth/register, /login, /google, /refresh, /logout, /forgot-password, /reset-password`, `GET /auth/me` |
| Utilizator | `PATCH /users/me`, `DELETE /users/me`, `PUT /users/me/style-quiz { answers: Style[] }` |
| Catalog / garderobă | `GET /catalog`, `GET/POST /wardrobe`, `POST /wardrobe/bulk`, `DELETE /wardrobe/:id` |
| Ținute | `GET/POST /outfits`, `GET/PATCH/DELETE /outfits/:id`, `POST /outfits/:id/wear` |
| Vreme | `GET /weather?lat&lon` (Open-Meteo, cache 10 min) |
| Sugestii | `GET /suggestions/today?occasion&lat&lon&variant`, `POST /suggestions/surprise` → `422 NOT_ENOUGH_ITEMS` dacă garderoba e prea mică |
| Implicare | `GET /stats`, `GET /wear-logs?from&to`, `GET /challenges/current`, `POST /challenges/:id/join`, `POST /challenges/:id/complete` |

Regulile de scor sunt în `server/src/services/outfitSuggestion.service.js` (vreme, stil/ocazie, culori, piese purtate recent).
Provocările se creează singure săptămânal (`challenges.service.js`), nu e nevoie de cron.

## Lansare
1. **Server (Render):** `render.yaml` e pregătit. Variabile: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `PUBLIC_URL`, `GOOGLE_*`, opțional `RESEND_API_KEY`/`EMAIL_FROM`. Build = `npm install && npm run build` (generează Prisma și rulează migrările). Dacă baza de producție e nouă: `npm run db:seed` o dată, local, cu `DIRECT_URL`/`DATABASE_URL` de producție.
2. **Client:** în `client/eas.json` înlocuiește `https://REPLACE-ME.onrender.com/api`. Adaugă `EXPO_PUBLIC_GOOGLE_*` ca variabile EAS (`eas env:create`). Test pe telefon: `eas build -p android --profile preview`.
3. **Google Sign-In:** în Google Cloud adaugă clientul Android cu pachetul `com.numetau.stilora` și amprenta SHA-1 din `eas credentials`.
4. **Politica de confidențialitate:** servită la `https://<server>/privacy` (`server/public/privacy.html`). Înlocuiește adresa de contact din fișier înainte de publicare.
5. **Publicare:** `eas build -p android --profile production` (AAB) și `eas submit -p android`.

## Imagini catalog
Imaginile se pun în `server/public/catalog/` și se trec în `imageUrl` din `prisma/catalog.seed.json` (apoi `npm run db:seed`). Folosește doar imagini proprii sau cu licență care permite folosirea comercială.
