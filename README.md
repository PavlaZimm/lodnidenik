# Rodinný lodní deník 🧭

Webová appka na zaznamenávání rodinných cest z dovolených — mapa s trasou, fotky, zápisky.

## Stack
Next.js (App Router) + TypeScript · Tailwind v4 + shadcn/ui · Supabase (DB/Storage/Auth) · Leaflet + OpenSeaMap · Vercel

## Dokumenty
- `CLAUDE.md` — instrukce pro Claude Code (stack, bezpečnost, funkce, workflow)
- `BRAND_MANUAL.md` — design systém (paleta, fonty, tokeny)
- `tasks/todo.md` — plán výstavby po fázích

## Lokální spuštění
```bash
npm install
cp .env.example .env.local   # a doplň skutečné klíče
npm run dev                  # http://localhost:3000
```

## Bezpečnost
Secrets jen v `.env` (nikdy do gitu). Supabase RLS zapnutá. Veřejné sdílení jen přes `share_token`.
Mapa je free (OSM/Mapy.com + OpenSeaMap), atribuci vždy zobrazit.
