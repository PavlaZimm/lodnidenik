import { Anchor, Compass, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"

// Dočasná úvodní stránka — slouží k ověření tokenů a fontů. Nahradí ji Fáze 3.
export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[1120px] flex-col justify-center gap-8 px-6 py-16">
      <div className="flex items-center gap-3 text-brass">
        <Compass className="size-6" strokeWidth={1.75} aria-hidden />
        <span className="font-mono text-xs tracking-widest uppercase">
          Fáze 1 — základy stojí
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="font-display text-4xl leading-[1.1] font-semibold md:text-5xl">
          Rodinný lodní deník
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
          Mapa s trasou, fotky a zápisky ze zastávek. Zatím prázdný — první
          výprava se přidá, až bude hotová databáze.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg">
          <MapPin strokeWidth={1.75} />
          Přidat zastávku
        </Button>
        <Button size="lg" variant="secondary">
          Prohlédnout výpravy
        </Button>
      </div>

      <div className="rounded-lg border bg-secondary p-6">
        <div className="flex items-center gap-2">
          <Anchor className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
          <h2 className="font-display text-xl font-semibold">Attersee 2026</h2>
        </div>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          47.8833° N, 13.5500° E · 22. 7. 2026
        </p>
      </div>
    </main>
  )
}
