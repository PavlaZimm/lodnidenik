"use client"

import { useEffect, useRef, useState } from "react"
import { TrackPoint, LogEntry } from "@/lib/types/logbook"
import { DOLNI_ZALEZLY_COORDS } from "@/lib/services/storage"
import { fetchLiveVessels, Vessel } from "@/lib/services/ais"
import "leaflet/dist/leaflet.css"
import { Ship, Layers, Navigation } from "lucide-react"

interface BoatMapProps {
  track: TrackPoint[]
  entries: LogEntry[]
  currentPosition?: TrackPoint | null
  selectedEntryId?: string | null
  onSelectEntry?: (id: string) => void
  onMapClick?: (lat: number, lng: number) => void
}

type MapLayerType = "seamap" | "osm" | "satellite"

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
  const tileLayerRef = useRef<any>(null)
  const seaOverlayRef = useRef<any>(null)

  const [showAis, setShowAis] = useState(true)
  const [activeLayer, setActiveLayer] = useState<MapLayerType>("seamap")
  const [autoFollowBoat, setAutoFollowBoat] = useState(true)

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
        preferCanvas: true,
      })

      tileLayerRef.current = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      seaOverlayRef.current = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a>',
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

  // Switch Map Layers
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current
      if (tileLayerRef.current) map.removeLayer(tileLayerRef.current)
      if (seaOverlayRef.current) map.removeLayer(seaOverlayRef.current)

      if (activeLayer === "satellite") {
        tileLayerRef.current = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
            attribution: "Tiles &copy; Esri &mdash; Source: Esri",
          }
        ).addTo(map)

        seaOverlayRef.current = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
          maxZoom: 18,
        }).addTo(map)
      } else if (activeLayer === "seamap") {
        tileLayerRef.current = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        seaOverlayRef.current = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: '&copy; <a href="http://www.openseamap.org">OpenSeaMap</a>',
        }).addTo(map)
      } else {
        tileLayerRef.current = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)
      }
    })
  }, [activeLayer])

  // Render AIS Vessels
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

  // Render Log Entries & Smooth Dynamic Track Line
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return

    import("leaflet").then((L) => {
      const group = layerGroupRef.current
      group.clearLayers()

      // Domovský přístav
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

      // Strava/Run-Style Dynamic Polyline
      if (track.length > 1) {
        const polylineCoords = track.map((p) => [p.lat, p.lng] as [number, number])

        L.polyline(polylineCoords, {
          color: "#0B6E78",
          weight: 8,
          opacity: 0.35,
        }).addTo(group)

        L.polyline(polylineCoords, {
          color: "#0B6E78",
          weight: 4,
          opacity: 0.95,
          dashArray: "8, 6",
        }).addTo(group)
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

      // Live Boat Current GPS Marker
      if (currentPosition) {
        const liveIcon = L.divIcon({
          className: "live-gps-marker",
          html: `
            <div style="position: relative;">
              <div style="
                width: 24px;
                height: 24px;
                background-color: #0B6E78;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 0 12px rgba(11,110,120,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
              ">⛵</div>
              <div style="
                position: absolute;
                top: -8px;
                left: -8px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(11,110,120,0.25);
                animation: pulse 1.5s infinite;
              "></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        const liveMarker = L.marker([currentPosition.lat, currentPosition.lng], { icon: liveIcon, zIndexOffset: 2000 })
        liveMarker.addTo(group)

        if (autoFollowBoat && mapInstanceRef.current) {
          mapInstanceRef.current.panTo([currentPosition.lat, currentPosition.lng], { animate: true, duration: 0.5 })
        }
      }

      if (!autoFollowBoat || !currentPosition) {
        const allPoints: [number, number][] = [
          [DOLNI_ZALEZLY_COORDS.lat, DOLNI_ZALEZLY_COORDS.lng],
          ...track.map((t) => [t.lat, t.lng] as [number, number]),
          ...entries.map((e) => [e.lat, e.lng] as [number, number]),
        ]
        if (allPoints.length > 0) {
          const bounds = L.latLngBounds(allPoints)
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
        }
      }
    })
  }, [track, entries, currentPosition, selectedEntryId, autoFollowBoat, onSelectEntry])

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] md:h-[500px] rounded-2xl overflow-hidden border border-border shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Control Buttons — Responsive Stacking for Small Mobile Screens */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1.5 max-w-[90%]">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {/* Auto Follow Boat Button */}
          {currentPosition && (
            <button
              onClick={() => setAutoFollowBoat(!autoFollowBoat)}
              className={`px-2.5 py-1 rounded-lg border shadow-md font-sans text-[11px] font-semibold flex items-center gap-1 transition-all ${
                autoFollowBoat
                  ? "bg-brass text-white border-brass"
                  : "bg-background/95 text-foreground border-border hover:bg-secondary"
              }`}
            >
              <Navigation className="size-3" />
              <span>{autoFollowBoat ? "Sledování zapnuto" : "Sledovat loď"}</span>
            </button>
          )}

          {/* AIS Toggle Button */}
          <button
            onClick={() => setShowAis(!showAis)}
            className={`px-2.5 py-1 rounded-lg border shadow-md font-sans text-[11px] font-semibold flex items-center gap-1 transition-all ${
              showAis
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background/95 text-foreground border-border hover:bg-secondary"
            }`}
          >
            <Ship className="size-3.5" />
            <span>{showAis ? "Lodě (AIS ON)" : "Lodě (OFF)"}</span>
          </button>
        </div>

        {/* Map Layer Selector */}
        <div className="bg-background/95 backdrop-blur-md border border-border shadow-md rounded-lg p-0.5 flex items-center gap-0.5 text-[11px]">
          <button
            onClick={() => setActiveLayer("seamap")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              activeLayer === "seamap"
                ? "bg-primary text-white"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            🌊 Námořní
          </button>
          <button
            onClick={() => setActiveLayer("satellite")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              activeLayer === "satellite"
                ? "bg-primary text-white"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            🛰️ Satelit
          </button>
          <button
            onClick={() => setActiveLayer("osm")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              activeLayer === "osm"
                ? "bg-primary text-white"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            🗺️ Základní
          </button>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 z-10 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-border text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
        <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
        {activeLayer === "seamap"
          ? "OpenSeaMap (Bóje, značky)"
          : activeLayer === "satellite"
          ? "Satelitní Labe"
          : "Základní vodní mapa"}
      </div>
    </div>
  )
}
