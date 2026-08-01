"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { TrackPoint } from "@/lib/types/logbook"

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function useGpsTracker(
  onNewPoint?: (point: TrackPoint, updatedTrack: TrackPoint[], addedDistanceKm: number) => void
) {
  const [isTracking, setIsTracking] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<TrackPoint | null>(null)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const lastPointRef = useRef<TrackPoint | null>(null)

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Váš prohlížeč nebo zařízení nepodporuje GPS polohu.")
      return
    }

    setError(null)
    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const speedKnots =
          pos.coords.speed !== null && pos.coords.speed !== undefined
            ? (pos.coords.speed * 3600) / 1852 // m/s to knots
            : undefined

        const newPoint: TrackPoint = {
          id: `tp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: new Date().toISOString(),
          speedKnots: speedKnots ? Math.round(speedKnots * 10) / 10 : 0,
          heading: pos.coords.heading || undefined,
          altitude: pos.coords.altitude || undefined,
        }

        setCurrentPosition(newPoint)

        let addedKm = 0
        if (lastPointRef.current) {
          addedKm = calculateDistanceKm(
            lastPointRef.current.lat,
            lastPointRef.current.lng,
            newPoint.lat,
            newPoint.lng
          )
        }
        lastPointRef.current = newPoint

        if (onNewPoint) {
          onNewPoint(newPoint, [], addedKm)
        }
      },
      (err) => {
        console.warn("GPS tracking error:", err.message)
        let msg = "Nelze získat GPS polohu."
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Přístup k GPS byl odmítnut. Povolte polohu v nastavení prohlížeče."
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "GPS Signál nedostupný."
        } else if (err.code === err.TIMEOUT) {
          msg = "Čekání na GPS vypršelo."
        }
        setError(msg)
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      }
    )
  }, [onNewPoint])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
    lastPointRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return {
    isTracking,
    currentPosition,
    error,
    startTracking,
    stopTracking,
  }
}
