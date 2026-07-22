# BRAND_MANUAL.md — Rodinný lodní deník

Design systém pro appku. Estetika **námořní deník / cestovatelský zápisník** — teplý papír,
námořní inkoust, tyrkysová voda, mosaz kompasu. Moderně a čistě, ne kýč. Určeno pro
netechnické lidi → přehledné, klidné, s velkými prvky.

Stack: **Next.js + Tailwind CSS v4 + shadcn/ui**. Barvy v OKLCH, tokeny níže rovnou pro shadcn.

---

## 1. Positioning & Tone of Voice

- **Co to je:** soukromý rodinný deník cest z dovolených — mapa, fotky, zápisky.
- **Jak má působit:** klidně, důvěryhodně, s nádechem dobrodružství. Jako pěkně vedený lodní deník, do kterého se člověk rád vrací.
- **Tón textů v UI:** lidský, vřelý, stručný. Tykání v rámci rodiny je ok. Žádný korporátní žargon.
- **Čemu se vyhnout:** technické hlášky na uživatele („chyba 500"), zahlcení volbami, křiklavé barvy.

---

## 2. Barevná paleta

Role palety podle pravidla 60-30-10 (papír ~60 %, plochy/písek ~30 %, tyrkysový akcent ~10 %).

| Role | Název | HEX | OKLCH | Použití |
|---|---|---|---|---|
| Pozadí | Papír | `#F7F3EA` | `oklch(0.965 0.013 86.8)` | hlavní plocha appky |
| Text | Námořní inkoust | `#16293D` | `oklch(0.275 0.045 250.9)` | veškerý hlavní text |
| Plocha / karta | Písek | `#ECE4D3` | `oklch(0.921 0.024 85.8)` | karty, sekundární pozadí |
| Border | Lano | `#DAD0BC` | `oklch(0.860 0.029 84.6)` | oddělovače, ohraničení |
| Sekundární text | Mlha | `#5E6B76` | `oklch(0.521 0.024 243.7)` | popisky, metadata, časy |
| **Akcent (primary)** | Moře (teal) | `#0B6E78` | `oklch(0.493 0.082 206.2)` | tlačítka, odkazy, aktivní stavy, trasa na mapě |
| Highlight | Mosaz | `#B07A22` | `oklch(0.620 0.119 74.4)` | jen dekorace (ikony kompasu, akcenty), **ne malý text** |
| Error | Cihla | `#B0432C` | `oklch(0.528 0.147 33.6)` | chyby, mazání |
| Success | Mořská zeleň | `#2E7D5B` | `oklch(0.531 0.095 161.9)` | potvrzení, úspěch |

**Pravidla použití:**
- Tyrkysová (Moře) je jediná „zářící" barva → jen CTA, odkazy, aktivní pin/trasa. Ne na velké plochy.
- Mosaz je dekorativní highlight (kontrast s bílým i tmavým textem je jen 3,7–4,0:1) → používej na ikony a velké prvky, **ne na drobný text**.
- Error je tlumená cihlová, **nikdy čistá `#FF0000`**. Červená jen na stavy, ne na hlavní CTA.

---

## 3. Ověřené kontrasty (WCAG 2.1 AA)

| Kombinace | Poměr | Verdikt |
|---|---|---|
| Inkoust text na papíru | 13,37:1 | ✅ text |
| Inkoust text na písku (karta) | 11,70:1 | ✅ text |
| Mlha (sekundární text) na papíru | 4,94:1 | ✅ text |
| Bílý text na tyrkysové (tlačítko) | 5,97:1 | ✅ text |
| Bílý text na cihlové (error) | 5,70:1 | ✅ text |
| Bílý text na mořské zeleni | 5,00:1 | ✅ text |
| Tyrkysový odkaz na papíru | 5,39:1 | ✅ text |
| Text na mosazi | 3,7–4,0:1 | ⚠️ jen velký text / UI, ne drobný text |

Primary tlačítko → **bílý text** (5,97:1, s rezervou). Focus ring → tyrkysová.

---

## 4. Typografie

Párování **Fraunces (display) + DM Sans (body) + JetBrains Mono (data)**. Editorial nádech
deníku, čistý čitelný text, mono na souřadnice a časy (evokuje přístrojovou desku).

- **Display — Fraunces** (serif s charakterem): nadpisy, název výpravy, hero.
- **Body — DM Sans**: běžný text, UI, tlačítka.
- **Mono — JetBrains Mono**: GPS souřadnice, časová razítka, data lodí (AIS).
- **NIKDY** Inter/Roboto/Arial jako display.
- Vždy `subsets: ["latin", "latin-ext"]` kvůli české diakritice.

**Typografická škála:**

| Prvek | Font | px (desktop) | weight | line-height |
|---|---|---|---|---|
| H1 | Fraunces | 40–48 | 600 | 1.1 |
| H2 | Fraunces | 30–32 | 600 | 1.2 |
| H3 | Fraunces | 22–24 | 500 | 1.3 |
| Body | DM Sans | 16–18 | 400 | 1.6 |
| Small / popisky | DM Sans | 14 | 400 | 1.5 |
| Caption / metadata | JetBrains Mono | 12–13 | 400 | 1.4 |

**Next.js import (`app/layout.tsx`):**

```typescript
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
});
// na <html> přidej: className={`${fraunces.variable} ${dmSans.variable} ${jetbrains.variable}`}
```

---

## 5. Spacing & Grid

- **Base unit:** 4px. Spacing škála: 4, 8, 12, 16, 24, 32, 48, 64.
- **Max-width obsahu:** 1120px, centrováno. Mapa může být full-bleed (přes celou šířku).
- **Mobile-first:** default styl pro mobil, `md:`/`lg:` pro větší. Dotykové cíle min. 44×44px.
- Velkorysý whitespace — appka má „dýchat", ne být natěsnaná.

---

## 6. Komponenty

**Tlačítka**
- *Primary:* pozadí tyrkysová `#0B6E78`, bílý text, radius `--radius`, jemný hover (ztmavení o ~6 %). Hlavní akce (Přidat zastávku, Uložit).
- *Secondary:* pozadí písek `#ECE4D3`, text inkoust, border lano. Vedlejší akce.
- *Ghost:* průhledné pozadí, text inkoust, hover = písek. Terciární akce.
- *Destructive:* cihlová `#B0432C`, bílý text. Jen mazání.

**Karty (zastávka / výprava)**
- Pozadí papír nebo písek, border lano, radius `--radius`, jemný stín. Hover: mírné zvednutí (`translateY(-2px)`) + o stupeň silnější stín. Uvnitř náhled fotky, název (Fraunces), datum (mono).

**Navigace**
- Sticky top bar, pozadí papír s `backdrop-filter: blur`, tenký spodní border lano. Na mobilu minimalistická, velké dotykové cíle.

**Mapa**
- Leaflet: podklad (OSM/Mapy.com) + OpenSeaMap overlay. Piny tyrkysové, trasa tyrkysová čára, aktivní pin zvýrazněný mosazí. Vlastní markery, ne default modré kapky. Atribuce vždy viditelná.

**Detail fotky (lightbox)**
- Tmavý overlay (inkoust s průhledností), fotka centrovaná, zavření křížkem + klávesou Esc, swipe na mobilu.

**Prázdné stavy**
- Vlídná ilustrace/ikona + jedna věta + jedno CTA (např. „Zatím žádná výprava. Založ první →").

---

## 7. Ikonografie

- **Sada:** Lucide (`lucide-react`) — čistá, moderní, sedí k UI.
- Motivy: `map-pin`, `anchor`, `compass`, `ship`, `camera`, `route`, `calendar`.
- Velikosti: 16 / 20 / 24px. Stroke ~1.75. Barva inkoust, aktivní tyrkysová, dekorativní mosaz.

---

## 8. Animace & Motion

- **Filozofie:** účelné a jemné, ne okázalé. Appka je klidná.
- **Rychlosti:** fast 150ms (hover), normal 250ms (přechody), slow 400ms (page reveal).
- **Page load:** jemný staggered fade-in karet / zastávek (postupně, ~60ms mezi prvky).
- **Hover:** karty se lehce zvednou, tlačítka ztmaví.
- **Vždy respektuj `prefers-reduced-motion`** — při zapnutém redukuj/vypni animace.

---

## 9. CSS Variables — shadcn tokeny (globals.css, Tailwind v4)

```css
@import "tailwindcss";

:root {
  --radius: 0.625rem;

  --background: oklch(0.965 0.013 86.8);          /* papír */
  --foreground: oklch(0.275 0.045 250.9);         /* inkoust */

  --card: oklch(0.965 0.013 86.8);
  --card-foreground: oklch(0.275 0.045 250.9);
  --popover: oklch(0.965 0.013 86.8);
  --popover-foreground: oklch(0.275 0.045 250.9);

  --primary: oklch(0.493 0.082 206.2);            /* moře / teal */
  --primary-foreground: oklch(1 0 0);             /* bílá */

  --secondary: oklch(0.921 0.024 85.8);           /* písek */
  --secondary-foreground: oklch(0.275 0.045 250.9);

  --muted: oklch(0.921 0.024 85.8);
  --muted-foreground: oklch(0.521 0.024 243.7);   /* mlha */

  --accent: oklch(0.921 0.024 85.8);              /* hover plochy = písek */
  --accent-foreground: oklch(0.275 0.045 250.9);

  --destructive: oklch(0.528 0.147 33.6);         /* cihla */
  --destructive-foreground: oklch(1 0 0);

  --success: oklch(0.531 0.095 161.9);            /* mořská zeleň (custom) */
  --success-foreground: oklch(1 0 0);

  --brass: oklch(0.620 0.119 74.4);               /* mosaz — dekorace (custom) */

  --border: oklch(0.860 0.029 84.6);              /* lano */
  --input: oklch(0.860 0.029 84.6);
  --ring: oklch(0.493 0.082 206.2);               /* focus = teal */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-brass: var(--brass);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --font-display: var(--font-display);
  --font-sans: var(--font-body);
  --font-mono: var(--font-mono);

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}
```

*Dark theme volitelně později — pro rodinný deník zatím stačí světlý.*

---

## 10. Přístupnost

- Kontrast dodržet dle tabulky v sekci 3 (běžný text ≥ 4,5:1, velký/UI ≥ 3:1).
- **Focus ring viditelný** vždy — tyrkysový (`--ring`), 2px, offset.
- Informaci nenést jen barvou — přidej ikonu/text (např. u error nejen červená, ale i ikona).
- `prefers-reduced-motion` respektovat.
- Alt texty u fotek (klidně auto z názvu místa/data), aria-label u ikonových tlačítek.
- Keyboard: celá appka ovladatelná klávesnicí, Esc zavírá lightbox/modaly.

---

## Do / Don't

| ❌ Don't | ✅ Do |
|---|---|
| Čistá `#FF0000` na chyby | Tlumená cihlová `#B0432C` |
| Tyrkysová na velké plochy | Tyrkysová jen na CTA/odkazy/aktivní (~10 %) |
| Mosaz na drobný text | Mosaz jen na ikony a velké dekorativní prvky |
| Inter/Roboto jako nadpisy | Fraunces na nadpisy |
| Default Google červené piny | Vlastní tyrkysové markery v paletě |
| Technické error hlášky uživateli | Lidská věta + cesta ven |
| Natěsnaný layout | Velkorysý whitespace, appka „dýchá" |
