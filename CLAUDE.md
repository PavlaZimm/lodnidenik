# Rodinný lodní deník

Webová aplikace pro rodinu na zaznamenávání cest z dovolených. Rodina přidává
zastávky s fotkami a textem, appka je zobrazuje na mapě jako trasu a na časové ose.

**Dvě nejvyšší priority projektu:**
1. **Jednoduché ovládání pro netechnické lidi** (rodiče, prarodiče) — minimum kroků, velká tlačítka, funguje na mobilu.
2. **Vysoká vizuální kvalita** — má to být fakt hezké, ne generický template.

---

## Stack

- **Framework:** Next.js (App Router) + TypeScript (strict mode)
- **Backend + DB + úložiště + auth:** Supabase (Postgres, Storage, Auth)
- **Mapa:** Leaflet + free podklad (Mapy.com turistická vrstva NEBO OpenStreetMap) + **OpenSeaMap** overlay (námořní/říční značení, přístavy, bóje)
- **Geocoding:** Nominatim (OpenStreetMap) — souřadnice → název místa, zdarma, bez karty
- **Styl:** Tailwind CSS **v4** (CSS-first konfigurace, žádný `tailwind.config.js`)
- **UI knihovna:** **shadcn/ui** (copy-paste komponenty, plná kontrola nad kódem)
- **Hosting:** Vercel (Hobby / free tier)

### Setup Tailwind v4 + shadcn/ui (aktuální postup)

- Tailwind **v4** je CSS-first: **žádný `tailwind.config.js`**. Konfigurace (barvy, fonty, breakpointy) se píše přímo v `globals.css` v bloku `@theme`.
- V `globals.css` jen `@import "tailwindcss";` — NE staré `@tailwind base/components/utilities`.
- Barvy v **OKLCH** (viz design systém / BRAND_MANUAL.md).
- PostCSS plugin `@tailwindcss/postcss`, v devDependencies `tailwindcss: "^4"` a `@tailwindcss/postcss: "^4"`.
- shadcn/ui založit přes `npx shadcn@latest init -t next` (samo detekuje Next.js + Tailwind v4, theming přes CSS proměnné).
- Komponenty přidávat přes `npx shadcn@latest add [komponenta]`.
- shadcn base volit přes `--base` (base / radix / aria).

### Setup mapy (free, bez karty)

- Renderer: **Leaflet** (raster, jednoduchý — ideální pro overlay dlaždice).
- **Podklad (base layer)** — jedna z variant:
  - **Mapy.com** turistická vrstva přes REST API (nejhezčí české + rakouské řeky; vyžaduje API klíč, free kredity + logo/atribuce). Pro Attersee/Rakousko top volba.
  - nebo **OpenStreetMap** standardní dlaždice (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) — bez klíče, jen atribuce.
- **Overlay:** **OpenSeaMap** značení — průhledná vrstva NAD podkladem:
  `https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png` (maxZoom 18). Ukazuje bóje, přístavy, vodní cesty.
- **Atribuce povinná:** „© OpenStreetMap contributors, © OpenSeaMap" (+ logo Mapy.com, pokud se použije jejich podklad).
- Piny a trasa: vlastní markery v paletě (viz BRAND_MANUAL), ne default.
- Geocoding přes **Nominatim** (`https://nominatim.openstreetmap.org`) — dodržet usage policy (1 req/s, vlastní User-Agent, cachovat výsledky).

### Pevná rozhodnutí — NEMĚNIT bez konzultace

- **Mapa je free stack** — Leaflet + OSM/Mapy.com podklad + OpenSeaMap overlay. **NEtahat sem Google Maps** (placené, vyžaduje kartu, hrozí účet, a neumí říční/námořní vrstvu jako OpenSeaMap).
- **Geocoding přes Nominatim** (zdarma), ne placené Google Geocoding.
- **NEPOUŽÍVAT Google Photos API** — od 3/2025 čte jen obsah nahraný vlastní aplikací. Fotky se nahrávají přímo do Supabase Storage.
- **Přihlášení přes Google řešit přes Supabase Auth** (Google jako provider), ne přes Google API napřímo.
- **PHP se nepoužívá** — projekt je celý v TypeScript/Next.js kvůli konzistenci stacku a hostingu na Vercelu.

---

## Datový model

- **Trip** (výprava): `id`, `name`, `description`, `date_from`, `date_to`, `cover_photo`, `owner_id`, `share_token` (dlouhý náhodný string, NE sekvenční ID)
- **Entry** (záznam/zastávka): `id`, `trip_id`, `datetime`, `place_name`, `lat`, `lng`, `text`, `owner_id`
- **Photo**: `id`, `entry_id`, `storage_path`, `taken_at`, `lat`, `lng`
- Fotky fyzicky v **Supabase Storage** (ne v DB).

---

## Klíčové funkce

1. **Mapa s trasou** — zastávky jedné výpravy jako piny spojené čárou v pořadí podle času. Klik na pin otevře detail s fotkou a textem. Mapa je hlavní hrdina obrazovky.
2. **Timeline** — záznamy chronologicky pod sebou.
3. **Přidání záznamu jedním gestem** — uživatel nahraje fotky → appka přečte GPS a čas z EXIF metadat → předvyplní polohu na mapě a datum → Nominatim doplní název místa. Uživatel jen doťukne větu textu. Když fotka GPS nemá, pin doťukne ručně na mapě.
4. **Více výprav** — každá dovolená vlastní deník se svou mapou.
5. **Veřejné sdílení jen pro čtení** přes `share_token` (rodina otevře bez přihlášení).

### Fáze 2 (přidat až po funkčním jádru — NEIMPLEMENTOVAT dřív)

6. **Živá poloha rodiny** — tlačítko „Jsme tady teď" hodí aktuální pin s časem. Trvalé sledování na pozadí NE. Živá poloha se NIKDY nezobrazuje na veřejném sdílecím odkazu, jen po přihlášení.
7. **Lodě v okolí (AIS)** — druhá mapová vrstva „co kolem pluje" přes AISstream.io nebo VesselAPI (free tier). Pozor: AIS pokrývá jen větší/komerční lodě (trajekty, výletní lodě, kargo), ne malé čluny.

---

## Bezpečnost — bereme vážně, kontroluj jako senior

- **Row Level Security (RLS)** zapnutá na všech tabulkách. Zápis pouze pro přihlášeného vlastníka záznamu. RLS NIKDY nevypínat kvůli sdílení.
- **Veřejné čtení výhradně přes `share_token`** (dlouhý náhodný string), přístup k výpravě po tokenu, ne po číselném ID.
- **Storage bucket není veřejný.** Fotky servírovat přes signed URLs, přístup jen k fotkám dané (sdílené) výpravy.
- **Ochrana soukromí u EXIF:** u veřejně sdílené výpravy defaultně nezobrazovat přesnou GPS fotek pořízených „doma", umožnit jednotlivé piny skrýt. Uživatele upozornit, že fotky mohou prozradit domácí adresu. Nabídnout odstranění GPS metadat při uploadu.
- **Validace uploadu:** jen obrázky (kontrola MIME i přípony), limit velikosti, sanitizace názvů souborů.
- Žádné secrets v klientském kódu. Service-role klíč jen na serveru, vše přes env proměnné.
- Rate limiting na auth a upload endpointy.

---

## Design & UX — má to být krásné

- **Ne generický Tailwind vzhled.** Záměrný, promyšlený design s vlastní osobností. Estetika: cestování / námořní deník, ale moderně a čistě, ne kýč.
- **Design systém:** neutrální paleta + jeden akcent + stavové barvy, konzistentní typografie (kvalitní font pár, ne systémový default), design tokeny. Kontrast kontrolovat na WCAG AA.
- **Mobile-first** (fotí a zadává se z telefonu): velká tlačítka, minimum kroků, plynulé nahrávání fotek s náhledy, jemné animace přechodů.
- Pěkně řešit prázdné stavy, loading stavy a detail fotky (lightbox) — na těchhle detailech se pozná kvalita.
- Detaily viz `BRAND_MANUAL.md` *(pokud existuje)*.

---

## Design & vzhled

- Kompletní design systém (paleta v OKLCH, fonty, tokeny, komponenty) je v **`BRAND_MANUAL.md`** v rootu. Před stavěním UI si ho přečti a drž se ho.
- Estetika: námořní deník / cestování, moderně a čistě. Papírové pozadí, námořní inkoust, tyrkysový akcent, mosaz střídmě.

---

## Konvence

- TypeScript strict mode vždy zapnutý. Nikdy `any` — použij `unknown` nebo generics.
- Funkce max ~50 řádků, pak refaktoruj.
- Pojmenování: camelCase pro funkce, PascalCase pro komponenty.
- Komentáře jen pro „proč", ne „co". Žádné magic numbers — pojmenované konstanty.
- Server components tam, kde to jde; klientské komponenty jen kde je potřeba interaktivita (mapa, upload, živé vrstvy).

---

## Workflow

- **Plan mode default** — před netriviálním úkolem (3+ kroky) napiš plán do `tasks/todo.md` s checkboxy. Až pak stav.
- Když se něco pokazí — STOP, přeplánuj, nezačínej naslepo znovu.
- Po každé korekci od uživatele zapiš poučení do `tasks/lessons.md`.
- **Verifikuj před „hotovo"** — spusť build, ověř v prohlížeči. Otázka před commitem: „Schválil by to senior?"
- Nevylepšuj to, co není rozbité. Minimální dopad na okolní kód.

---

## Version control & deploy

- **Nikdy automaticky necommituj ani nepushuj** — jen na explicitní pokyn.
- Před prvním commitem nastav git email (`git config user.email "..."`) — Vercel odmítá commity bez emailu.
- Commit messages stručně, imperativně (add map layer, fix exif parsing).
- Deploy: Git → GitHub → Vercel (auto-deploy z main).
- Před prvním pushem ověř, že `.env` je v `.gitignore`.

---

## Klíčové příkazy

- `npm run dev` — dev server
- `npm run build` — produkční build
- `npm run lint` — lint
- `npx supabase ...` — práce s lokální Supabase / migracemi

---

## Postup výstavby

1. Struktura projektu + databázové schéma v Supabase **včetně RLS policies**.
2. Design systém (tokeny, barvy, typografie) po výběru UI knihovny.
3. Kostra s jednou výpravou a mapou.
4. Přidání záznamu z fotek (EXIF + Nominatim).
5. Timeline, více výprav, veřejné sdílení.
6. Až nakonec fáze 2 (živá poloha, AIS).

**Postupuj po částech a ptej se, když něco není jasné. Nezaváděj nový stack ani placené API bez konzultace.**

---

## Definition of Done

- [ ] Funkce ze zadání splněná a ověřená v prohlížeči
- [ ] Responzivní (mobile, tablet, desktop) — mobile-first
- [ ] RLS policies zapnuté a otestované (zápis jen vlastník, čtení přes token)
- [ ] `.env` v `.gitignore`, `.env.example` aktuální, žádné secrets v kódu
- [ ] Dodržený `BRAND_MANUAL.md` (barvy, fonty, tokeny)
- [ ] Lighthouse Accessibility ≥ 90, Performance ≥ 85
- [ ] Atribuce mapy zobrazená (© OpenStreetMap, © OpenSeaMap, příp. Mapy.com)
