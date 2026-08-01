"use client"

import { useState } from "react"
import { LogEntry, Photo } from "@/lib/types/logbook"
import { extractExifFromPhoto } from "@/lib/services/exif"
import { reverseGeocode } from "@/lib/services/geocoding"
import { Button } from "@/components/ui/button"
import { Camera, MapPin, X, Loader2, Anchor, ShieldAlert, Coffee, Fuel, Compass, Pencil, Trash2 } from "lucide-react"

interface EditEntryDialogProps {
  entry: LogEntry
  onSave: (updatedEntry: LogEntry) => void
  onClose: () => void
}

export function EditEntryDialog({ entry, onSave, onClose }: EditEntryDialogProps) {
  const [title, setTitle] = useState(entry.title)
  const [text, setText] = useState(entry.text)
  const [placeName, setPlaceName] = useState(entry.placeName)
  const [lat, setLat] = useState<number>(entry.lat)
  const [lng, setLng] = useState<number>(entry.lng)
  const [category, setCategory] = useState<LogEntry["category"]>(entry.category || "stop")
  const [photos, setPhotos] = useState<Photo[]>(entry.photos || [])
  const [timestamp, setTimestamp] = useState(
    entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  )
  const [isLoadingExif, setIsLoadingExif] = useState(false)
  const [isLoadingGeo, setIsLoadingGeo] = useState(false)

  const handleAutoGeocode = async (lLat: number, lLng: number) => {
    setIsLoadingGeo(true)
    const name = await reverseGeocode(lLat, lLng)
    setPlaceName(name)
    setIsLoadingGeo(false)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsLoadingExif(true)
    const newPhotos: Photo[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const url = URL.createObjectURL(file)
      const exif = await extractExifFromPhoto(file)

      newPhotos.push({
        id: `photo-${Date.now()}-${i}`,
        url,
        lat: exif.lat,
        lng: exif.lng,
        takenAt: exif.takenAt || new Date().toISOString(),
      })
    }

    setPhotos((prev) => [...prev, ...newPhotos])
    setIsLoadingExif(false)
  }

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    const updated: LogEntry = {
      ...entry,
      title,
      text,
      placeName: placeName || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
      lat,
      lng,
      category,
      photos,
      timestamp: new Date(timestamp).toISOString(),
    }

    onSave(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-background border border-border rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2.5 text-primary">
            <Pencil className="size-6" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              Upravit zastávku / záznam
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">
              Název zastávky / záznamu
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none font-medium text-foreground"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">
              Datum a čas události
            </label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">Typ události</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: "stop", label: "Zastávka", icon: MapPin },
                { id: "anchor", label: "Kotvení", icon: Anchor },
                { id: "sight", label: "Vyhlídka", icon: Compass },
                { id: "fuel", label: "Palivo", icon: Fuel },
                { id: "note", label: "Poznámka", icon: Coffee },
                { id: "warning", label: "Varování", icon: ShieldAlert },
              ].map((item) => {
                const IconComp = item.icon
                const isSelected = category === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as LogEntry["category"])}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md border font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-input hover:bg-secondary"
                    }`}
                  >
                    <IconComp className="size-3.5" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Place name & GPS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5 flex items-center justify-between">
                <span>Název místa</span>
                {isLoadingGeo && <Loader2 className="size-3 animate-spin text-primary" />}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAutoGeocode(lat, lng)}
                  title="Dohledat název z GPS"
                  className="px-2.5 py-2 bg-secondary border border-border rounded-md hover:bg-secondary/80"
                >
                  <MapPin className="size-4 text-primary" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1.5">
                GPS Souřadnice
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-1/2 px-2.5 py-2 bg-background border border-input rounded-md font-mono text-xs"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-1/2 px-2.5 py-2 bg-background border border-input rounded-md font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Text/Notes */}
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">
              Zápis / Poznámky do deníku
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          {/* Photos Management */}
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">
              Fotografie ({photos.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {photos.map((p) => (
                <div key={p.id} className="relative size-16 rounded overflow-hidden border border-border group">
                  <img src={p.url} alt="Fotka" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(p.id)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-90 hover:opacity-100"
                    title="Odstranit fotku"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              id="edit-photo-upload"
              className="hidden"
            />
            <label
              htmlFor="edit-photo-upload"
              className="inline-flex items-center gap-2 px-3 py-2 bg-secondary border border-border rounded-md text-xs font-medium cursor-pointer hover:bg-secondary/80 text-foreground"
            >
              {isLoadingExif ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5 text-primary" />}
              <span>Přidat další fotku</span>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose}>
              Zrušit
            </Button>
            <Button type="submit" size="lg">
              Uložit změny
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
