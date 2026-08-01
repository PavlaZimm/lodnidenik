"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { TrackPoint } from "@/lib/types/logbook"

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [maxSpeedKnots, setMaxSpeedKnots] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const watchIdRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastPointRef = useRef<TrackPoint | null>(null)

  // Stopwatch timer when tracking is active
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTracking])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Váš prohlížeč nebo zařízení nepodporuje GPS polohu.")
      return
    }

    setError(null)
    setIsTracking(true)
    setElapsedSeconds(0)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const rawSpeedMps = pos.coords.speed !== null && pos.coords.speed !== undefined ? pos.coords.speed : 0
        const speedKnots = Math.round(((rawSpeedMps * 3600) / 1852) * 10) / 10

        if (speedKnots > maxSpeedKnots) {
          setMaxSpeedKnots(speedKnots)
        }

        const newPoint: TrackPoint = {
          id: `tp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: new Date().toISOString(),
          speedKnots,
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
        timeout: 15000,
        maximumAge: 2000, // Zrychlená aktualizace GPS polohy každé 2 sekundy!
      }
    )
  }, [onNewPoint, maxSpeedKnots])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
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
    elapsedSeconds,
    maxSpeedKnots,
    error,
    startTracking,
    stopTracking,
  }
}
