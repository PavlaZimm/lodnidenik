"use client"

import { useEffect, useRef, useState } from "react"
import { TrackPoint, LogEntry } from "@/lib/types/logbook"
import { DOLNI_ZALEZLY_COORDS } from "@/lib/services/storage"
import { fetchLiveVessels, Vessel } from "@/lib/services/ais"
import "leaflet/dist/leaflet.css"
import { Ship } from "lucide-react"

interface BoatMapProps {
  track: TrackPoint[]
  entries: LogEntry[]
  currentPosition?: TrackPoint | null
  selectedEntryId?: string | null
  onSelectEntry?: (id: string) => void
  onMapClick?: (lat: number, lng: number) => void
}

export default function BoatMap({
  track,
  entries,
  currentPosition,
  selectedEntryId,
  onSelectEntry,
  onMapClick,
}: BoatMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const layerGroupRef = useRef<any>(null)
  const aisGroupRef = useRef<any>(null)

  const [showAis, setShowAis] = useState(true)

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const centerLat = DOLNI_ZALEZLY_COORDS.lat
      const centerLng = DOLNI_ZALEZLY_COORDS.lng

      const map = L.map(mapContainerRef.current!, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: true,
      })

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors',
      }).addTo(map)

      map.on("click", (e: any) => {
        if (onMapClick) {
          onMapClick(e.latlng.lat, e.latlng.lng)
        }
      })

      layerGroupRef.current = L.layerGroup().addTo(map)
      aisGroupRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Render AIS Ships Layer dynamically
  useEffect(() => {
    if (!mapInstanceRef.current || !aisGroupRef.current) return

    let isMounted = true

    import("leaflet").then(async (L) => {
      const aisGroup = aisGroupRef.current
      aisGroup.clearLayers()

      if (!showAis) return

      const center = mapInstanceRef.current.getCenter()
      const vessels = await fetchLiveVessels(center.lat, center.lng)

      if (!isMounted) return

      vessels.forEach((vessel) => {
        const vesselColor =
          vessel.type === "cargo"
            ? "#2E7D5B"
            : vessel.type === "passenger"
            ? "#0B6E78"
            : "#B07A22"

        const vesselIcon = L.divIcon({
          className: "ais-vessel-marker",
          html: `
            <div style="
              transform: translate(-50%, -50%);
              width: max-content;
              background-color: ${vesselColor};
              color: white;
              padding: 3px 10px;
              border-radius: 12px;
              font-family: var(--font-sans, sans-serif);
              font-size: 10px;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
            ">
              <span>🚢 ${vessel.name} (${vessel.speedKnots} kts)</span>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        })

        const marker = L.marker([vessel.lat, vessel.lng], { icon: vesselIcon })
        marker.bindPopup(`
          <div style="font-family: var(--font-sans, sans-serif); padding: 4px; max-width: 220px;">
            <div style="font-size: 10px; font-family: monospace; color: #5E6B76;">AIS POLOHA · MMSI ${vessel.mmsi}</div>
            <strong style="color: #16293D; font-size: 15px;">🚢 ${vessel.name} ${vessel.flag}</strong>
            <div style="font-size: 12px; font-weight: 500; color: #0B6E78; margin-top: 2px;">${vessel.typeName}</div>
            <div style="font-size: 11px; color: #5E6B76; margin-top: 4px;">
              Rychlost: <strong>${vessel.speedKnots} uzlů</strong> (kts)<br/>
              Délka: ${vessel.lengthMeters} m · Trasa: ${vessel.destination}
            </div>
          </div>
        `)
        marker.addTo(aisGroup)
      })
    })

    return () => {
      isMounted = false
    }
  }, [showAis])

  // Render Log Entries & Track Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return

    import("leaflet").then((L) => {
      const group = layerGroupRef.current
      group.clearLayers()

      // Domovské stanoviště Dolní Zálezly — bez přetékání textu
      const homeIcon = L.divIcon({
        className: "home-port-marker",
        html: `
          <div style="
            transform: translate(-50%, -50%);
            width: max-content;
            background: linear-gradient(135deg, #B07A22, #8A5D14);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-family: var(--font-sans, sans-serif);
            font-size: 11px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          ">
            <span>⚓ Domovský přístav: Dolní Zálezly</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })

      const homeMarker = L.marker([DOLNI_ZALEZLY_COORDS.lat, DOLNI_ZALEZLY_COORDS.lng], {
        icon: homeIcon,
        zIndexOffset: 1000,
      })
      homeMarker.bindPopup(`
        <div style="font-family: var(--font-sans, sans-serif); padding: 4px;">
          <strong style="color: #B07A22; font-size: 14px;">Domovský přístav lodi</strong>
          <div style="font-size: 12px; margin-top: 4px; color: #16293D;">Dolní Zálezly na Labi (km 749)</div>
          <div style="font-size: 11px; color: #5E6B76; margin-top: 2px;">Odtud rodiče vždy vyrážejí na plavbu.</div>
        </div>
      `)
      homeMarker.addTo(group)

      // Trasa
      if (track.length > 1) {
        const polylineCoords = track.map((p) => [p.lat, p.lng] as [number, number])
        const routeLine = L.polyline(polylineCoords, {
          color: "oklch(0.493 0.082 206.2)",
          weight: 4,
          opacity: 0.85,
          dashArray: "6, 8",
        })
        routeLine.addTo(group)
      }

      // Zastávky
      entries.forEach((entry, idx) => {
        const isSelected = entry.id === selectedEntryId
        const color = isSelected ? "oklch(0.620 0.119 74.4)" : "oklch(0.493 0.082 206.2)"

        const customIcon = L.divIcon({
          className: "custom-boat-marker",
          html: `
            <div style="
              background-color: ${color};
              color: white;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: var(--font-mono, monospace);
              font-weight: bold;
              font-size: 13px;
              border: 3px solid #F7F3EA;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
              transform: ${isSelected ? "scale(1.25)" : "scale(1)"};
              transition: transform 0.2s ease;
            ">
              ${idx + 1}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const marker = L.marker([entry.lat, entry.lng], { icon: customIcon })
        const popupContent = `
          <div style="font-family: var(--font-sans, sans-serif); padding: 4px; max-width: 200px;">
            <div style="font-size: 11px; font-family: monospace; color: #5E6B76;">${entry.placeName}</div>
            <div style="font-weight: 600; font-size: 14px; margin-top: 2px; color: #16293D;">${entry.title}</div>
            <div style="font-size: 12px; margin-top: 4px; color: #5E6B76;">${entry.text}</div>
          </div>
        `

        marker.bindPopup(popupContent)
        marker.on("click", () => {
          if (onSelectEntry) onSelectEntry(entry.id)
        })
        marker.addTo(group)
      })

      // GPS Poloha
      if (currentPosition) {
        const liveIcon = L.divIcon({
          className: "live-gps-marker",
          html: `
            <div style="position: relative;">
              <div style="
                width: 20px;
                height: 20px;
                background-color: #0B6E78;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(11,110,120,0.8);
              "></div>
              <div style="
                position: absolute;
                top: -6px;
                left: -6px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background-color: rgba(11,110,120,0.25);
                animation: pulse 2s infinite;
              "></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
        L.marker([currentPosition.lat, currentPosition.lng], { icon: liveIcon }).addTo(group)
      }

      const allPoints: [number, number][] = [
        [DOLNI_ZALEZLY_COORDS.lat, DOLNI_ZALEZLY_COORDS.lng],
        ...track.map((t) => [t.lat, t.lng] as [number, number]),
        ...entries.map((e) => [e.lat, e.lng] as [number, number]),
      ]
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints)
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
      }
    })
  }, [track, entries, currentPosition, selectedEntryId, onSelectEntry])

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-border shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* AIS Toggle Button */}
      <button
        onClick={() => setShowAis(!showAis)}
        className={`absolute top-3 right-3 z-10 px-3 py-1.5 rounded-lg border shadow-md font-sans text-xs font-semibold flex items-center gap-1.5 transition-all ${
          showAis
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background/90 text-foreground border-border hover:bg-secondary"
        }`}
      >
        <Ship className="size-4" />
        <span>{showAis ? "Lodě v okolí (AIS ON)" : "Zobrazit lodě v okolí"}</span>
      </button>

      <div className="absolute bottom-2 left-2 z-10 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded border border-border text-[11px] font-mono text-muted-foreground flex items-center gap-2">
        <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
        OpenSeaMap + OSM + AIS Radar
      </div>
    </div>
  )
}
