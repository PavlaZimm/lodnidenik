"use client"

import { useState } from "react"
import { PreTripCheck } from "@/lib/types/logbook"
import { Button } from "@/components/ui/button"
import { Anchor, ClipboardCheck, Compass, Fuel, UserCheck, Wind, Clock, AlertCircle, X, ShieldAlert, Phone } from "lucide-react"

interface PreTripFormProps {
  initialValues?: PreTripCheck
  onSave: (values: PreTripCheck) => void
  onClose: () => void
}

export function PreTripForm({ initialValues, onSave, onClose }: PreTripFormProps) {
  const [departureHarbour, setDepartureHarbour] = useState(initialValues?.departureHarbour || "Dolní Zálezly (Domovský přístav)")
  const [destinationHarbour, setDestinationHarbour] = useState(initialValues?.destinationHarbour || "")
  const [captain, setCaptain] = useState(initialValues?.captain || "Kapitán")
  const [crew, setCrew] = useState(initialValues?.crew || "Rodina")
  const [weatherForecast, setWeatherForecast] = useState(initialValues?.weatherForecast || "Slunečno, mírný vítr")
  const [fuelLevel, setFuelLevel] = useState(initialValues?.fuelLevel || "100 %")
  const [engineHours, setEngineHours] = useState(initialValues?.engineHours || "")
  const [boatNotes, setBoatNotes] = useState(initialValues?.boatNotes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      departureHarbour,
      destinationHarbour,
      captain,
      crew,
      weatherForecast,
      fuelLevel,
      engineHours,
      boatNotes,
      departureDate: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/40">
          <div className="flex items-center gap-2.5 text-primary">
            <ClipboardCheck className="size-6 text-brass" />
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Kapitánská příprava před odplutím
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Protokol lodi a kontroly před vyplutím
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Anchor className="size-3.5 text-primary" /> Místo vyplutí (Přístav/Kotviště)
              </label>
              <input
                type="text"
                required
                placeholder="např. Dolní Zálezly"
                value={departureHarbour}
                onChange={(e) => setDepartureHarbour(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Compass className="size-3.5 text-primary" /> Cílová destinace plavby
              </label>
              <input
                type="text"
                placeholder="např. Litoměřice / Střekov"
                value={destinationHarbour}
                onChange={(e) => setDestinationHarbour(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <UserCheck className="size-3.5 text-brass" /> Kapitán lodi
              </label>
              <input
                type="text"
                required
                value={captain}
                onChange={(e) => setCaptain(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">Posádka lodi</label>
              <input
                type="text"
                placeholder="např. Máma, Petr, Jirka"
                value={crew}
                onChange={(e) => setCrew(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Wind className="size-3.5 text-primary" /> Předpověď počasí
              </label>
              <input
                type="text"
                value={weatherForecast}
                onChange={(e) => setWeatherForecast(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Fuel className="size-3.5 text-brass" /> Stav paliva
              </label>
              <input
                type="text"
                placeholder="např. 100 % (Plná nádrž)"
                value={fuelLevel}
                onChange={(e) => setFuelLevel(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" /> Stav motohodin (mth)
              </label>
              <input
                type="text"
                placeholder="např. 148 mth"
                value={engineHours}
                onChange={(e) => setEngineHours(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="size-3.5 text-brass" /> Kapitánská kontrola před odplutím
            </label>
            <textarea
              rows={3}
              placeholder="Kontrola lana, kotevního vrátku, záchranných vest, oleje v motoru a plavebních dokladů..."
              value={boatNotes}
              onChange={(e) => setBoatNotes(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          {/* Captain Emergency & Safety Quick Reference */}
          <div className="p-3 bg-secondary/50 rounded-xl border border-border space-y-1 text-xs">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="size-3.5 text-destructive" /> Tísňové kontakty a vysílačka:
            </div>
            <div className="text-muted-foreground font-mono text-[11px] grid grid-cols-2 gap-1 pt-1">
              <span>VHF Kanál 10 / 16 (Plavební provoz)</span>
              <span>Tísňová linka: 112 / 150</span>
              <span>Státní plavební správa: 234 701 111</span>
              <span>Říční policie: 158</span>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose}>
              Zrušit
            </Button>
            <Button type="submit" size="lg" className="bg-brass text-white hover:bg-brass/90">
              <ClipboardCheck className="size-4 mr-2" /> Uložit protokol kapitána
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
