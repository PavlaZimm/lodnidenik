# tasks/lessons.md — poučení z průběhu

## Fáze 1 (22. 7. 2026)

- **`next/font` vyžaduje doslovné literály.** `subsets: FONT_SUBSETS` (sdílená konstanta)
  build shodí hláškou „Font loader values must be explicitly written literals". Pole se musí
  vypsat u každého fontu zvlášť. Pozor: `lint` ani `typecheck` to nechytnou, spadne až
  `npm run build` — proto build vždy před „hotovo".

- **Scaffold nedůvěřuj naslepo.** `shadcn init -t next` nasadil `next-themes` s
  `defaultTheme="system"`. Na tmavém systému by to přebilo papírovou paletu z BRAND_MANUAL.
  Po každém scaffoldu projít, co všechno přišlo s sebou, a vyhodit, co jde proti zadání.

- **Diakritika v názvu složky.** `create-next-app` / `shadcn init` odvozují název npm balíčku
  z názvu adresáře a `Lodnídeník` je pro npm nevalidní. Řešení: scaffold vedle pod ASCII
  názvem a obsah přesunout.
