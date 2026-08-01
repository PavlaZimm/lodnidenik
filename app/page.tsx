"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Trip, LogEntry, PreTripCheck, TrackPoint } from "@/lib/types/logbook"
import {
  loadTripsFromStorage,
  saveTripsToStorage,
  loadActiveTripId,
  saveActiveTripId,
  INITIAL_DEMO_TRIP,
} from "@/lib/services/storage"
import { useGpsTracker } from "@/lib/hooks/use-gps-tracker"
import { TripHeader } from "@/components/logbook/trip-header"
import { Timeline } from "@/components/logbook/timeline"
import { PreTripForm } from "@/components/logbook/pre-trip-form"
import { AddEntryDialog } from "@/components/logbook/add-entry-dialog"
import { EditEntryDialog } from "@/components/logbook/edit-entry-dialog"
import { InstallGuideDialog } from "@/components/logbook/install-guide-dialog"
import { PhotoLightbox } from "@/components/logbook/photo-lightbox"
import { Anchor, Compass, Info, CheckCircle2, MapPin, Play, Square, ClipboardCheck, Smartphone } from "lucide-react"

const BoatMap = dynamic(() => import("@/components/map/boat-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] sm:h-[420px] md:h-[500px] rounded-2xl bg-secondary/40 animate-pulse flex flex-col items-center justify-center border border-border text-muted-foreground gap-2">
      <Anchor className="size-8 animate-bounce text-primary" />
      <span className="font-mono text-xs">Načítám lodní mapu a plavební značení...</span>
    </div>
  ),
})

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([INITIAL_DEMO_TRIP])
  const [activeTripId, setActiveTripId] = useState<string>(INITIAL_DEMO_TRIP.id)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [showPreTripModal, setShowPreTripModal] = useState(false)
  const [showAddEntryModal, setShowAddEntryModal] = useState(false)
  const [showInstallGuide, setShowInstallGuide] = useState(false)
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null)
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null)
  const [manualClickCoords, setManualClickCoords] = useState<{ lat: number; lng: number } | null>(
    null
  )

  useEffect(() => {
    const loadedTrips = loadTripsFromStorage()
    const activeId = loadActiveTripId()
    setTrips(loadedTrips)
    if (loadedTrips.some((t) => t.id === activeId)) {
      setActiveTripId(activeId)
    } else if (loadedTrips.length > 0) {
      setActiveTripId(loadedTrips[0].id)
    }
  }, [])

  const updateTripsState = useCallback((newTrips: Trip[]) => {
    setTrips(newTrips)
    saveTripsToStorage(newTrips)
  }, [])

  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0] || INITIAL_DEMO_TRIP

  const handleGpsPoint = useCallback(
    (point: TrackPoint, _arr: TrackPoint[], addedKm: number) => {
      setTrips((prevTrips) => {
        const updated = prevTrips.map((t) => {
          if (t.id === activeTrip.id) {
            return {
              ...t,
              track: [...t.track, point],
              totalDistanceKm: t.totalDistanceKm + addedKm,
            }
          }
          return t
        })
        saveTripsToStorage(updated)
        return updated
      })
    },
    [activeTrip.id]
  )

  const {
    isTracking,
    currentPosition,
    elapsedSeconds,
    maxSpeedKnots,
    error: gpsError,
    startTracking,
    stopTracking,
  } = useGpsTracker(handleGpsPoint)

  const handleCreateTrip = () => {
    const name = prompt("Zadejte název nové plavby:", `Plavba ${new Date().toLocaleDateString("cs-CZ")}`)
    if (!name) return

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name,
      startDate: new Date().toISOString(),
      status: "active",
      totalDistanceKm: 0,
      track: [],
      entries: [],
    }

    const updated = [newTrip, ...trips]
    updateTripsState(updated)
    setActiveTripId(newTrip.id)
    saveActiveTripId(newTrip.id)
  }

  const handleDeleteTrip = (tripId: string) => {
    const updated = trips.filter((t) => t.id !== tripId)
    if (updated.length > 0) {
      updateTripsState(updated)
      setActiveTripId(updated[0].id)
      saveActiveTripId(updated[0].id)
    }
  }

  const handleSavePreTrip = (preCheck: PreTripCheck) => {
    const updated = trips.map((t) => {
      if (t.id === activeTrip.id) {
        return { ...t, preTripCheck: preCheck }
      }
      return t
    })
    updateTripsState(updated)
    setShowPreTripModal(false)
  }

  const handleSaveEntry = (entry: LogEntry) => {
    const updated = trips.map((t) => {
      if (t.id === activeTrip.id) {
        return {
          ...t,
          entries: [entry, ...t.entries],
        }
      }
      return t
    })
    updateTripsState(updated)
    setShowAddEntryModal(false)
    setSelectedEntryId(entry.id)
  }

  const handleUpdateEntry = (updatedEntry: LogEntry) => {
    const updated = trips.map((t) => {
      if (t.id === activeTrip.id) {
        return {
          ...t,
          entries: t.entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)),
        }
      }
      return t
    })
    updateTripsState(updated)
    setEditingEntry(null)
  }

  const handleDeleteEntry = (entryId: string) => {
    const updated = trips.map((t) => {
      if (t.id === activeTrip.id) {
        return {
          ...t,
          entries: t.entries.filter((e) => e.id !== entryId),
        }
      }
      return t
    })
    updateTripsState(updated)
  }

  const handleMapClick = (lat: number, lng: number) => {
    setManualClickCoords({ lat, lng })
    setShowAddEntryModal(true)
  }

  return (
    <main className="min-h-svh max-w-[1120px] mx-auto px-3 sm:px-4 py-3 sm:py-6 md:py-10 space-y-4 md:space-y-6 pb-24 md:pb-10">
      {/* Top App Header */}
      <header className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Compass className="size-7 md:size-8 text-primary shrink-0" strokeWidth={1.75} />
          <div>
            <h1 className="font-display text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Rodinný lodní deník
            </h1>
            <p className="text-[10px] sm:text-xs font-mono text-muted-foreground">
              Plavební deník s GPS trasováním pro rodiče
            </p>
          </div>
        </div>

        {/* Add to Home Screen Button */}
        <button
          onClick={() => setShowInstallGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors shrink-0"
        >
          <Smartphone className="size-4 text-primary" />
          <span className="hidden sm:inline">Dát na plochu mobilu</span>
          <span className="sm:hidden">Na plochu</span>
        </button>
      </header>

      {/* GPS Error Alert */}
      {gpsError && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs md:text-sm flex items-center gap-2.5">
          <Info className="size-4 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Dashboard Control Header */}
      <TripHeader
        trips={trips}
        activeTrip={activeTrip}
        isTracking={isTracking}
        currentSpeedKnots={currentPosition?.speedKnots}
        maxSpeedKnots={maxSpeedKnots}
        elapsedSeconds={elapsedSeconds}
        onSelectTrip={(id) => {
          setActiveTripId(id)
          saveActiveTripId(id)
        }}
        onCreateTrip={handleCreateTrip}
        onDeleteTrip={handleDeleteTrip}
        onToggleTracking={isTracking ? stopTracking : startTracking}
        onOpenPreTripCheck={() => setShowPreTripModal(true)}
        onAddEntry={() => {
          setManualClickCoords(null)
          setShowAddEntryModal(true)
        }}
      />

      {/* Pre-Trip Badge */}
      {activeTrip.preTripCheck && (
        <div className="p-3.5 bg-secondary/30 rounded-xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 text-success shrink-0" />
            <div>
              <span className="font-semibold text-foreground font-display text-sm">
                Příprava: {activeTrip.preTripCheck.departureHarbour} &rarr;{" "}
                {activeTrip.preTripCheck.destinationHarbour || "Cíl v itineráři"}
              </span>
              <div className="text-muted-foreground mt-0.5 text-[11px] sm:text-xs">
                Kapitán: <strong className="text-foreground">{activeTrip.preTripCheck.captain}</strong> ·
                Počasí: {activeTrip.preTripCheck.weatherForecast} · Palivo: {activeTrip.preTripCheck.fuelLevel}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPreTripModal(true)}
            className="text-primary hover:underline font-medium self-start md:self-auto"
          >
            Zobrazit protokol &rarr;
          </button>
        </div>
      )}

      {/* Interactive Nautical Map */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-muted-foreground">
          <span>Mapa plavby (Klepením přidáte zastávku)</span>
          <span>{activeTrip.entries.length} zastávek</span>
        </div>
        <BoatMap
          track={activeTrip.track}
          entries={activeTrip.entries}
          currentPosition={currentPosition}
          selectedEntryId={selectedEntryId}
          onSelectEntry={setSelectedEntryId}
          onMapClick={handleMapClick}
        />
      </section>

      {/* Timeline view */}
      <section className="pt-2">
        <Timeline
          entries={activeTrip.entries}
          selectedEntryId={selectedEntryId}
          onSelectEntry={setSelectedEntryId}
          onEditEntry={(entry) => setEditingEntry(entry)}
          onDeleteEntry={handleDeleteEntry}
          onOpenPhoto={setActivePhotoUrl}
        />
      </section>

      {/* MOBILE STICKY BOTTOM DOCK (S ošetřením pro iPhone spodní lištu env(safe-area-inset-bottom)) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-3 py-2.5 shadow-2xl flex items-center justify-around gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setShowPreTripModal(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-foreground py-1 px-2.5 rounded-lg active:bg-secondary"
        >
          <ClipboardCheck className="size-5 text-brass" />
          <span>Příprava</span>
        </button>

        <button
          onClick={() => {
            setManualClickCoords(null)
            setShowAddEntryModal(true)
          }}
          className="flex items-center justify-center gap-1.5 bg-brass text-white font-semibold py-2.5 px-4 rounded-full shadow-lg text-xs active:scale-95 transition-transform"
        >
          <MapPin className="size-4" />
          <span>+ Záznam / Fotka</span>
        </button>

        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2.5 rounded-lg active:bg-secondary ${
            isTracking ? "text-destructive" : "text-primary"
          }`}
        >
          {isTracking ? <Square className="size-5 fill-current animate-pulse" /> : <Play className="size-5 fill-current" />}
          <span>{isTracking ? "Stop GPS" : "Snímat GPS"}</span>
        </button>
      </div>

      {/* Modals & Lightbox */}
      {showPreTripModal && (
        <PreTripForm
          initialValues={activeTrip.preTripCheck}
          onSave={handleSavePreTrip}
          onClose={() => setShowPreTripModal(false)}
        />
      )}

      {showAddEntryModal && (
        <AddEntryDialog
          tripId={activeTrip.id}
          currentLocation={
            manualClickCoords ||
            (currentPosition ? { lat: currentPosition.lat, lng: currentPosition.lng } : null)
          }
          onSave={handleSaveEntry}
          onClose={() => setShowAddEntryModal(false)}
        />
      )}

      {editingEntry && (
        <EditEntryDialog
          entry={editingEntry}
          onSave={handleUpdateEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {showInstallGuide && <InstallGuideDialog onClose={() => setShowInstallGuide(false)} />}

      <PhotoLightbox url={activePhotoUrl} onClose={() => setActivePhotoUrl(null)} />
    </main>
  )
}
