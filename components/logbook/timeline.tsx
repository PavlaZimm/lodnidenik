"use client"

import { LogEntry } from "@/lib/types/logbook"
import { MapPin, Anchor, Camera, Compass, Fuel, Coffee, ShieldAlert, Trash2, Pencil } from "lucide-react"

interface TimelineProps {
  entries: LogEntry[]
  selectedEntryId?: string | null
  onSelectEntry: (id: string) => void
  onEditEntry: (entry: LogEntry) => void
  onDeleteEntry: (id: string) => void
  onOpenPhoto: (url: string) => void
}

const CATEGORY_ICONS = {
  stop: MapPin,
  anchor: Anchor,
  sight: Compass,
  fuel: Fuel,
  note: Coffee,
  warning: ShieldAlert,
}

export function Timeline({
  entries,
  selectedEntryId,
  onSelectEntry,
  onEditEntry,
  onDeleteEntry,
  onOpenPhoto,
}: TimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-xl text-muted-foreground">
        <Anchor className="size-10 mx-auto text-muted-foreground/50 mb-2" />
        <h3 className="font-display text-lg font-semibold text-foreground">Zatím žádné zastávky</h3>
        <p className="text-sm mt-1 max-w-sm mx-auto">
          Klikněte na „Přidat zastávku / fotku“ a zapište první zážitek nebo fotku z plavby.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2">
        <Anchor className="size-5 text-primary" /> Časový přehled zastávek
      </h2>

      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {entries.map((entry, idx) => {
          const isSelected = entry.id === selectedEntryId
          const IconComp = CATEGORY_ICONS[entry.category || "stop"] || MapPin
          const dateFormatted = new Date(entry.timestamp).toLocaleString("cs-CZ", {
            day: "numeric",
            month: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })

          return (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry.id)}
              className={`relative bg-card border rounded-xl p-4 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20 shadow-md bg-secondary/20"
                  : "border-border hover:border-primary/50 hover:shadow-sm"
              }`}
            >
              {/* Timeline node icon */}
              <div
                className={`absolute -left-6 top-4 -translate-x-1/2 size-7 rounded-full flex items-center justify-center border-2 border-background text-xs font-mono font-bold ${
                  isSelected
                    ? "bg-brass text-white shadow-md"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {idx + 1}
              </div>

              {/* Entry header */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-secondary text-primary">
                    <IconComp className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground leading-snug">
                      {entry.title}
                    </h3>
                    <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
                      <span>{entry.placeName}</span>
                      <span>·</span>
                      <span>{dateFormatted}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {entry.lat.toFixed(4)}°, {entry.lng.toFixed(4)}°
                  </span>

                  {/* Tlačítko pro úpravu záznamu */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditEntry(entry)
                    }}
                    title="Upravit tento záznam"
                    className="p-1.5 rounded-md text-foreground/70 hover:text-primary hover:bg-secondary transition-colors"
                  >
                    <Pencil className="size-4" />
                  </button>

                  {/* Tlačítko pro vymazání záznamu */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Opravdu chcete smazat zastávku "${entry.title}"?`)) {
                        onDeleteEntry(entry.id)
                      }
                    }}
                    title="Smazat tuto zastávku"
                    className="p-1.5 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Text note */}
              {entry.text && (
                <p className="mt-3 text-sm text-foreground/90 leading-relaxed font-sans">
                  {entry.text}
                </p>
              )}

              {/* Photos grid */}
              {entry.photos && entry.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                  {entry.photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenPhoto(photo.url)
                      }}
                      className="relative size-20 rounded-lg overflow-hidden border border-border group cursor-zoom-in"
                    >
                      <img
                        src={photo.url}
                        alt={entry.title}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera className="size-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
