"use client"

import { Trip } from "@/lib/types/logbook"
import { Button } from "@/components/ui/button"
import { Anchor, Compass, Play, Square, ClipboardCheck, Plus, Navigation, MapPin, Trash2 } from "lucide-react"

interface TripHeaderProps {
  trips: Trip[]
  activeTrip: Trip
  isTracking: boolean
  currentSpeedKnots?: number
  onSelectTrip: (id: string) => void
  onCreateTrip: () => void
  onDeleteTrip: (id: string) => void
  onToggleTracking: () => void
  onOpenPreTripCheck: () => void
  onAddEntry: () => void
}

export function TripHeader({
  trips,
  activeTrip,
  isTracking,
  currentSpeedKnots,
  onSelectTrip,
  onCreateTrip,
  onDeleteTrip,
  onToggleTracking,
  onOpenPreTripCheck,
  onAddEntry,
}: TripHeaderProps) {
  return (
    <div className="flex flex-col gap-5 p-5 md:p-6 bg-card border border-border rounded-2xl shadow-sm">
      {/* Top row: Trip title & Trip switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <Anchor className="size-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Aktivní plavba
              </span>
              {activeTrip.preTripCheck ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-success/15 text-success font-medium border border-success/30">
                  <ClipboardCheck className="size-3" /> Připraveno k plavbě
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-brass/15 text-brass font-medium border border-brass/30">
                  <Compass className="size-3" /> Čeká na zápis před cestou
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <select
                value={activeTrip.id}
                onChange={(e) => onSelectTrip(e.target.value)}
                className="font-display text-2xl md:text-3xl font-semibold bg-transparent border-b border-dashed border-border focus:outline-none focus:border-primary cursor-pointer pr-2 max-w-[260px] md:max-w-md truncate"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <button
                onClick={onCreateTrip}
                title="Založit novou výpravu"
                className="p-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
              >
                <Plus className="size-4" />
              </button>

              {trips.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Opravdu chcete smazat celou výpravu "${activeTrip.name}"?`)) {
                      onDeleteTrip(activeTrip.id)
                    }
                  }}
                  title="Smazat tuto výpravu"
                  className="p-1.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Pre-trip log button */}
          <Button variant="secondary" onClick={onOpenPreTripCheck} className="flex-1 md:flex-none">
            <ClipboardCheck className="size-4 text-brass" />
            {activeTrip.preTripCheck ? "Upravit přípravu" : "Zápis před cestou"}
          </Button>

          {/* GPS Route recording toggle */}
          {isTracking ? (
            <Button variant="destructive" onClick={onToggleTracking} className="flex-1 md:flex-none">
              <Square className="size-4 fill-current animate-pulse" />
              Zastavit snímání GPS
            </Button>
          ) : (
            <Button onClick={onToggleTracking} className="flex-1 md:flex-none">
              <Play className="size-4 fill-current" />
              Snímat trasu (GPS)
            </Button>
          )}

          {/* Add entry button */}
          <Button onClick={onAddEntry} className="w-full md:w-auto bg-brass text-white hover:bg-brass/90">
            <MapPin className="size-4" />
            Přidat zastávku / fotku
          </Button>
        </div>
      </div>

      {/* Navigation Stats & Details Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/60">
        <div className="p-3 bg-secondary/50 rounded-xl border border-border/50">
          <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
            <Navigation className="size-3.5 text-primary" /> Ujetá vzdálenost
          </div>
          <div className="font-mono text-lg font-bold text-foreground mt-0.5">
            {activeTrip.totalDistanceKm.toFixed(1)} km{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({(activeTrip.totalDistanceKm / 1.852).toFixed(1)} NM)
            </span>
          </div>
        </div>

        <div className="p-3 bg-secondary/50 rounded-xl border border-border/50">
          <div className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
            <Compass className="size-3.5 text-brass" /> Rychlost plavby
          </div>
          <div className="font-mono text-lg font-bold text-foreground mt-0.5">
            {currentSpeedKnots ? `${currentSpeedKnots} kts` : "0.0 kts"}
          </div>
        </div>

        <div className="p-3 bg-secondary/50 rounded-xl border border-border/50">
          <div className="text-[11px] font-mono text-muted-foreground uppercase">Počet zastávek</div>
          <div className="font-mono text-lg font-bold text-foreground mt-0.5">
            {activeTrip.entries.length} záznamů
          </div>
        </div>

        <div className="p-3 bg-secondary/50 rounded-xl border border-border/50">
          <div className="text-[11px] font-mono text-muted-foreground uppercase">GPS Snímání</div>
          <div className="font-mono text-xs font-semibold mt-1.5 flex items-center gap-2">
            {isTracking ? (
              <>
                <span className="relative flex size-2.5">
                  <span className="animate-ping absolute inline-flex size-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex size-2.5 rounded-full bg-success"></span>
                </span>
                <span className="text-success font-medium">Aktivní záznam trasy</span>
              </>
            ) : (
              <>
                <span className="size-2.5 rounded-full bg-muted-foreground/50"></span>
                <span className="text-muted-foreground font-normal">Snímání vypnuto</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
