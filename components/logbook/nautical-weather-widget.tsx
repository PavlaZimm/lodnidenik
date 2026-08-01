"use client"

import { useEffect, useState } from "react"
import { fetchNauticalWeather, NauticalWeatherInfo } from "@/lib/services/nautical-weather"
import { Sun, Sunset, Sunrise, Wind, Waves, Thermometer, RefreshCw } from "lucide-react"

export function NauticalWeatherWidget() {
  const [weather, setWeather] = useState<NauticalWeatherInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const loadWeather = async () => {
    setLoading(true)
    const data = await fetchNauticalWeather()
    setWeather(data)
    setLoading(false)
  }

  useEffect(() => {
    loadWeather()
  }, [])

  if (loading || !weather) {
    return (
      <div className="p-4 rounded-2xl bg-card border border-border animate-pulse flex items-center justify-between text-muted-foreground text-xs font-mono">
        <span className="flex items-center gap-2">
          <Sun className="size-4 animate-spin text-brass" /> Načítám živé plavební počasí, západ slunce a stav Labe...
        </span>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-5 bg-card border border-border rounded-2xl shadow-sm space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{weather.weatherIcon}</span>
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-foreground leading-tight">
              Plavební počasí & Řeka Labe
            </h3>
            <p className="text-[10px] sm:text-xs font-mono text-muted-foreground">
              Dolní Zálezly · Živé podmínky pro plavbu
            </p>
          </div>
        </div>

        <button
          onClick={loadWeather}
          title="Obnovit živé počasí a stav vody"
          className="p-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>

      {/* Grid of 3 key Captain Weather Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Teplota a Vítr */}
        <div className="p-3 bg-secondary/40 rounded-xl border border-border/50 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Wind className="size-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Vítr & Teplota</div>
            <div className="font-mono text-sm font-bold text-foreground mt-0.5">
              {weather.temperatureC}°C · {weather.windSpeedKnots} kts ({weather.windDirectionText})
            </div>
            <div className="text-[11px] text-muted-foreground">{weather.weatherText}</div>
          </div>
        </div>

        {/* 2. Západ Slunce a Odpočet */}
        <div className="p-3 bg-secondary/40 rounded-xl border border-border/50 flex items-center gap-3">
          <div className="p-2 bg-brass/15 rounded-lg text-brass">
            <Sunset className="size-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
              <Sunrise className="size-3 text-muted-foreground" /> {weather.sunriseTime} · <Sunset className="size-3 text-brass" /> {weather.sunsetTime}
            </div>
            <div className="font-mono text-sm font-bold text-brass mt-0.5">
              Západ slunce: {weather.sunsetTime}
            </div>
            <div className="text-[11px] text-foreground font-medium">{weather.timeUntilSunset}</div>
          </div>
        </div>

        {/* 3. Stav Vody a Průtok Labe */}
        <div className="p-3 bg-secondary/40 rounded-xl border border-border/50 flex items-center gap-3">
          <div className="p-2 bg-success/15 rounded-lg text-success">
            <Waves className="size-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Stav vody Labe (Ústí/Zálezly)</div>
            <div className="font-mono text-sm font-bold text-foreground mt-0.5">
              {weather.waterLevelCm} cm · {weather.waterFlowM3s} m³/s
            </div>
            <div className="text-[11px] text-success font-medium">{weather.waterStatus}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
