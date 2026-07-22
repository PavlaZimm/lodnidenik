# Code Style

- TypeScript strict mode. Nikdy `any` — `unknown` nebo generics.
- Funkce max ~50 řádků, pak refaktoruj.
- camelCase funkce, PascalCase komponenty, kebab-case názvy souborů komponent.
- Komentáře jen pro „proč", ne „co". Žádné magic numbers → pojmenované konstanty.
- Server Components default; `"use client"` jen kde je potřeba interaktivita (mapa, upload, živé vrstvy).
- Nejnovější stabilní verze balíčků, žádné alpha/beta bez důvodu.
- Drž se `BRAND_MANUAL.md` — barvy jen přes tokeny (`bg-primary`, `text-foreground`…), ne natvrdo hex.
