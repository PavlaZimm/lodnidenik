# tasks/todo.md — Rodinný lodní deník

---

## Fáze 1: Setup — HOTOVO ✅ (22. 7. 2026)

### 1.1 Příprava repozitáře
- [x] Rozbalit `lodni-denik-starter.zip` do rootu — přinese `.claude/` (rules, commands, settings), `.env.example`, `.gitignore`, `README.md`. `CLAUDE.md` a `BRAND_MANUAL.md` v rootu už jsou, nechají se beze změny.
- [x] `git init` + ověřit `git config user.email` (globálně je `zimmermannovap@gmail.com` ✅). **Necommitovat** — až na výslovný pokyn.
- [x] Ověřit, že `.env`, `.env.local` a `.env*.local` jsou v `.gitignore` (ve starteru jsou).

### 1.2 Scaffold Next.js + Tailwind v4 + shadcn/ui
- [x] Vygenerovat projekt přes `npx shadcn@latest init -t next` (dle CLAUDE.md) **ve scratchpadu** pod jménem `lodni-denik`, pak obsah přesunout do rootu.
      *Proč ne přímo v rootu:* složka se jmenuje `Lodnídeník` — diakritika a velká písmena, npm takový název balíčku odmítne. Scaffold vedle a přesun je čistší než hackovat název.
- [x] Volby scaffoldu: App Router, TypeScript, Tailwind v4, ESLint, alias `@/*`, **bez** `src/` adresáře (app/, components/, lib/ v rootu — sedí to na `Write(app/**)` pravidla v `.claude/settings.json`).
- [x] Ověřit: **žádný `tailwind.config.js`**, v `globals.css` jen `@import "tailwindcss";`, v devDependencies `tailwindcss@^4` + `@tailwindcss/postcss@^4`.
- [x] `tsconfig.json` — potvrdit `"strict": true`.
- [x] Merge: zachovat `.gitignore` a `README.md` ze starteru (doplnit jen to, co scaffold přidá navíc).

### 1.3 Fonty (BRAND_MANUAL §4)
- [x] `app/layout.tsx`: `Fraunces` → `--font-display`, `DM_Sans` → `--font-body`, `JetBrains_Mono` → `--font-mono`.
- [x] Všechny se `subsets: ["latin", "latin-ext"]` (česká diakritika) a `display: "swap"`.
- [x] Na `<html>` přidat `className` se všemi třemi variables, `lang="cs"`.
- [x] Metadata: title „Rodinný lodní deník", description.

### 1.4 Design tokeny (BRAND_MANUAL §9)
- [x] Do `app/globals.css` vložit `:root` blok s OKLCH tokeny **doslova podle BRAND_MANUAL** (papír, inkoust, písek, lano, mlha, moře, mosaz, cihla, mořská zeleň) + `--radius: 0.625rem`.
- [x] `@theme inline` blok — mapování na `--color-*`, `--font-display/sans/mono`, `--radius-lg/md/sm`.
- [x] Doplnit `body { background: var(--background); color: var(--foreground); }` a globální `prefers-reduced-motion` pravidlo (BRAND_MANUAL §8).
- [x] Dark theme **neřešit** — manuál říká zatím jen světlý.

### 1.5 Env proměnné
- [x] `.env.example` je ze starteru hotový (Supabase URL / anon / service-role, volitelný Mapy.com klíč, AIS až později).
- [x] **Klíče vyplní uživatel sám** — `cp .env.example .env.local` a doplnit hodnoty. Do chatu je neposílat, `.env.local` je v `.gitignore` i v `deny` v `.claude/settings.json`.
- [x] Supabase klíče stačí mít pro Fázi 2; **na rozjezd Fáze 1 nejsou potřeba** (nic se na ně zatím nepřipojuje).

### 1.6 Ověření
- [x] `npm run dev` → `localhost:3000` naběhne bez chyb.
- [x] Vizuální kontrola v prohlížeči: papírové pozadí, inkoustový text, nadpis ve Fraunces, tyrkysové tlačítko s bílým textem, mono u dat — tedy že tokeny i fonty opravdu chytly.
- [x] `npm run build` projde.
- [x] `npm run lint` projde.
- [x] Odškrtat Fázi 1 níže, napsat shrnutí do sekce Review.

### Co Fáze 1 NEZAHRNUJE (schválně)
- Žádná Supabase klientská knihovna, žádné DB schéma, žádný auth → Fáze 2.
- Žádný Leaflet, žádné mapové vrstvy, žádný geocoding → Fáze 3.
- Žádné shadcn komponenty nad rámec toho, co `init` založí (`components/ui/` se plní až podle potřeby).
- Žádný commit ani push.

### Otevřené otázky / poznámky k rozhodnutí
1. **Geocoding:** `CLAUDE.md` má pevné rozhodnutí „Nominatim, ne placené API", ale v zadání Fáze 1 zaznělo „geocoding Mapy.com". Rozpor vyřešit před Fází 3 a `CLAUDE.md` podle toho upravit.
2. **Mapy.com klíč:** volitelný. Bez něj jede OSM podklad. Řeší se až ve Fázi 3.
3. **shadcn base:** použit `radix` (nejlépe zdokumentovaný, nejvíc odladěný) + preset `nova` (Lucide ikony — sedí na BRAND_MANUAL §7). Barvy presetu byly kompletně přepsány našimi tokeny.

---

## Fáze 1: Setup (checklist ze starteru)
- [x] Next.js projekt inicializován (App Router + TypeScript)
- [x] Tailwind v4 + shadcn/ui (`npx shadcn@latest init -t next`)
- [x] CLAUDE.md a BRAND_MANUAL.md v rootu
- [x] Fonty (Fraunces, DM Sans, JetBrains Mono) v layout.tsx
- [x] Design tokeny z BRAND_MANUAL.md v globals.css
- [x] .env.example vytvořen, .env v .gitignore
- [ ] Supabase projekt založen, klíče v .env
- [ ] Git repo + Vercel deploy (testovací URL)

## Fáze 2: Databáze + auth
- [ ] Schéma: Trip, Entry, Photo (viz CLAUDE.md)
- [ ] RLS policies (zápis vlastník, čtení přes share_token)
- [ ] Storage bucket na fotky (ne veřejný, signed URLs)
- [ ] Přihlášení přes Google (Supabase Auth provider)

## Fáze 3: Jádro appky
- [ ] Layout — header + navigace (BRAND_MANUAL)
- [ ] Leaflet + OSM/Mapy.com podklad + OpenSeaMap overlay, piny + trasa (vlastní markery)
- [ ] Seznam výprav + detail výpravy
- [ ] Timeline zastávek
- [ ] Přidání zastávky z fotek (EXIF → GPS/čas → Nominatim název)
- [ ] Upload fotek + náhledy + lightbox
- [ ] Ruční doťuknutí pinu (když fotka nemá GPS)
- [ ] Veřejné sdílení přes share_token (read-only)

## Fáze 4: Kvalita
- [ ] Responzivita (mobile-first)
- [ ] Prázdné + loading stavy
- [ ] Lighthouse Accessibility ≥ 90, Performance ≥ 85
- [ ] /security-review

## Fáze 5 (později): Vychytávky
- [ ] „Jsme tady teď" — živý pin (jen po přihlášení, ne na veřejném odkazu)
- [ ] AIS vrstva — lodě v okolí (AISstream.io / VesselAPI)

## Review

### Fáze 1 — 22. 7. 2026

**Výsledek:** appka běží na `localhost:3000`, `build`, `lint` i `typecheck` procházejí čistě,
konzole prohlížeče bez chyb. Ověřeno na desktopu i na mobilním viewportu (375×812).

**Verze:** Next.js 16.2.6 (Turbopack), React 19.2.4, Tailwind v4, shadcn CLI 4.14, lucide-react 1.25.

**Rozhodnutí učiněná během stavby:**
- **Scaffold ve scratchpadu, pak přesun do rootu** — složka `Lodnídeník` má diakritiku,
  npm ji jako název balíčku odmítne. `package.json` má proto `"name": "lodni-denik"`.
- **shadcn base `radix`, preset `nova`** — `npx shadcn@latest init -t next` si vynutil volbu
  presetu. Nova přináší Lucide ikony (sedí na BRAND_MANUAL §7); její výchozí šedou paletu
  jsme celou přepsali tokeny z BRAND_MANUAL §9.
- **Odstraněn `next-themes` + `components/theme-provider.tsx`** — scaffold je nasadil
  s `defaultTheme="system"`, takže na Macu v tmavém režimu by se appka vykreslila v cizí
  šedé paletě místo papírové. BRAND_MANUAL říká zatím jen světlý theme, tak jsme dark
  variantu (`.dark` blok i `@custom-variant dark`) vypustili. Až bude dark theme na programu,
  vrátí se i s vlastními hodnotami.
- **`.gitignore` sloučen** ze starteru a Next.js scaffoldu — `.env`, `.env.local` i `.env*.local`
  ověřeny přes `git check-ignore`.
- **`app/page.tsx`** je dočasná ukázka pro vizuální ověření tokenů a fontů. Nahradí ji Fáze 3.
- **`.claude/launch.json`** přidán, aby šel dev server spouštět a kontrolovat v prohlížeči.

**Zádrhel, který si zaslouží zapamatovat:**
`next/font` nepřijímá proměnnou v `subsets` („Font loader values must be explicitly written
literals") — pole `["latin", "latin-ext"]` musí být vypsané u každého fontu zvlášť.
Lint i typecheck to prošly, spadl až `npm run build`.

**Co zbývá k plnému odškrtnutí Fáze 1:**
- Supabase projekt + klíče v `.env.local` (vyplňuje uživatel).
- Git repo je inicializované (`git init`, lokální user.email + user.name), ale **bez commitu**
  — čeká na pokyn. Vercel deploy zatím nenastaven.
