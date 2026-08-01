"use client"

import { useState } from "react"
import { LogEntry, Photo } from "@/lib/types/logbook"
import { extractExifFromPhoto } from "@/lib/services/exif"
import { reverseGeocode } from "@/lib/services/geocoding"
import { Button } from "@/components/ui/button"
import { Camera, MapPin, X, Loader2, Anchor, ShieldAlert, Coffee, Fuel, Compass, ShieldCheck } from "lucide-react"

interface AddEntryDialogProps {
  tripId: string
  currentLocation?: { lat: number; lng: number } | null
  onSave: (entry: LogEntry) => void
  onClose: () => void
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 // 15 MB

export function AddEntryDialog({ tripId, currentLocation, onSave, onClose }: AddEntryDialogProps) {
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [placeName, setPlaceName] = useState("")
  const [lat, setLat] = useState<number>(currentLocation?.lat || 50.5973)
  const [lng, setLng] = useState<number>(currentLocation?.lng || 14.0431)
  const [category, setCategory] = useState<LogEntry["category"]>("stop")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [stripExifGps, setStripExifGps] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
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

    setUploadError(null)
    setIsLoadingExif(true)
    const newPhotos: Photo[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Bezpečnostní kontrola typu a velikosti souboru
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) {
        setUploadError(`Soubor "${file.name}" není podporovaný obrázek (povolené: JPG, PNG, WEBP, HEIC).`)
        continue
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`Soubor "${file.name}" přesahuje maximální velikost 15 MB.`)
        continue
      }

      const url = URL.createObjectURL(file)
      const exif = await extractExifFromPhoto(file)

      const useGps = !stripExifGps && exif.lat && exif.lng

      newPhotos.push({
        id: `photo-${Date.now()}-${i}`,
        url,
        lat: useGps ? exif.lat : undefined,
        lng: useGps ? exif.lng : undefined,
        takenAt: exif.takenAt || new Date().toISOString(),
      })

      if (useGps && exif.lat && exif.lng) {
        setLat(exif.lat)
        setLng(exif.lng)
        handleAutoGeocode(exif.lat, exif.lng)
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos])
    setIsLoadingExif(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    const sanitizedTitle = title.trim().slice(0, 120)
    const sanitizedText = text.trim().slice(0, 2000)
    const sanitizedPlace = placeName.trim().slice(0, 100)

    const newEntry: LogEntry = {
      id: `entry-${Date.now()}`,
      tripId,
      timestamp: new Date().toISOString(),
      title: sanitizedTitle,
      text: sanitizedText,
      placeName: sanitizedPlace || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
      lat,
      lng,
      photos,
      category,
    }

    onSave(newEntry)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-background border border-border rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2.5 text-primary">
            <Anchor className="size-6" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              Přidat záznam / Zastávku na plavbě
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
          {/* Error Message */}
          {uploadError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {uploadError}
            </div>
          )}

          {/* Photo Upload Box */}
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center bg-secondary/20 hover:bg-secondary/40 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              id="photo-upload-input"
              className="hidden"
            />
            <label
              htmlFor="photo-upload-input"
              className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              {isLoadingExif ? (
                <Loader2 className="size-8 animate-spin text-primary" />
              ) : (
                <Camera className="size-8 text-primary" />
              )}
              <span className="font-medium text-foreground">Nahrát fotku z telefonu / fotoaparátu</span>
              <span className="text-xs">
                (Podporované: JPG, PNG, WEBP, HEIC do 15 MB)
              </span>
            </label>

            {/* Privacy EXIF Toggle */}
            <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                id="strip-exif"
                checked={stripExifGps}
                onChange={(e) => setStripExifGps(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="strip-exif" className="cursor-pointer flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-success" />
                <span>Skrýt domácí GPS polohu z metadat fotky (Ochrana soukromí)</span>
              </label>
            </div>

            {/* Photo previews */}
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {photos.map((p) => (
                  <div key={p.id} className="relative size-16 rounded overflow-hidden border border-border">
                    <img src={p.url} alt="Nahraná fotka" className="size-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5">
              Název zastávky / záznamu
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="např. Zastávka na oběd, Kotvení u ostrova..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                <span>Název místa / obce</span>
                {isLoadingGeo && <Loader2 className="size-3 animate-spin text-primary" />}
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  maxLength={100}
                  placeholder="např. Dolní Zálezly, Litoměřice"
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
              maxLength={2000}
              placeholder="Co jste zažili, co se stalo, jaká byla voda..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose}>
              Zrušit
            </Button>
            <Button type="submit" size="lg">
              Uložit záznam do deníku
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
