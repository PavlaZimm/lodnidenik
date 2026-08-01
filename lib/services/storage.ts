import { Trip } from "@/lib/types/logbook"

const STORAGE_KEY = "rodinny_lodni_denik_trips"
const ACTIVE_TRIP_ID_KEY = "rodinny_lodni_denik_active_id"

export const DOLNI_ZALEZLY_COORDS = { lat: 50.5973179, lng: 14.0430777 }

export const INITIAL_DEMO_TRIP: Trip = {
  id: "demo-trip-labe",
  name: "Plavba po Labi z Dolních Zálezel",
  description: "Domovský přístav: Dolní Zálezly. Výprava po řece Labi údolím Porta Bohemica.",
  startDate: "2026-08-01T09:00:00.000Z",
  status: "active",
  totalDistanceKm: 18.5,
  preTripCheck: {
    departureHarbour: "Dolní Zálezly (Domovský přístav)",
    destinationHarbour: "Litoměřice / Střekov",
    captain: "Táta (Kapitán)",
    crew: "Máma a rodina",
    weatherForecast: "Slunečno, 25°C, mírný vítr 2 m/s",
    fuelLevel: "100 %",
    engineHours: "148.0 h",
    boatNotes: "Loď sídlí v Dolních Zálezlech. Zkontrolován motor, lana, palivo i vesty.",
    departureDate: "2026-08-01T09:00",
  },
  track: [
    { id: "tp-1", lat: 50.5973, lng: 14.0431, timestamp: "2026-08-01T09:15:00.000Z", speedKnots: 0.0 },
    { id: "tp-2", lat: 50.5845, lng: 14.0542, timestamp: "2026-08-01T09:45:00.000Z", speedKnots: 5.4 },
    { id: "tp-3", lat: 50.5650, lng: 14.0810, timestamp: "2026-08-01T10:30:00.000Z", speedKnots: 5.8 },
    { id: "tp-4", lat: 50.5420, lng: 14.1150, timestamp: "2026-08-01T11:15:00.000Z", speedKnots: 4.5 },
    { id: "tp-5", lat: 50.5332, lng: 14.1331, timestamp: "2026-08-01T12:00:00.000Z", speedKnots: 0.0 },
  ],
  entries: [
    {
      id: "e-1",
      tripId: "demo-trip-labe",
      timestamp: "2026-08-01T09:15:00.000Z",
      title: "Domovský přístav — Dolní Zálezly",
      text: "Domovské stanoviště lodi na Labi v Dolních Zálezlech. Odplouváme za krásného letního počasí.",
      placeName: "Dolní Zálezly (Labe)",
      lat: 50.5973179,
      lng: 14.0430777,
      category: "anchor",
      photos: [],
    },
    {
      id: "e-2",
      tripId: "demo-trip-labe",
      timestamp: "2026-08-01T10:30:00.000Z",
      title: "Průjezd kaňonem Porta Bohemica",
      text: "Nádherné výhledy na vinice a skály v Labském údolí.",
      placeName: "Porta Bohemica - Labe",
      lat: 50.565,
      lng: 14.081,
      category: "sight",
      photos: [],
    },
    {
      id: "e-3",
      tripId: "demo-trip-labe",
      timestamp: "2026-08-01T12:00:00.000Z",
      title: "Kotvení u Litoměřic",
      text: "Příjezd k Litoměřicím, oběd a relaxace na lodi.",
      placeName: "Litoměřice - Kotviště",
      lat: 50.5332,
      lng: 14.1331,
      category: "stop",
      photos: [],
    },
  ],
}

export function loadTripsFromStorage(): Trip[] {
  if (typeof window === "undefined") return [INITIAL_DEMO_TRIP]

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      saveTripsToStorage([INITIAL_DEMO_TRIP])
      return [INITIAL_DEMO_TRIP]
    }
    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveTripsToStorage([INITIAL_DEMO_TRIP])
      return [INITIAL_DEMO_TRIP]
    }
    return parsed
  } catch (err) {
    console.error("Failed to load trips:", err)
    return [INITIAL_DEMO_TRIP]
  }
}

export function saveTripsToStorage(trips: Trip[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
  } catch (err) {
    console.error("Failed to save trips:", err)
  }
}

export function loadActiveTripId(): string {
  if (typeof window === "undefined") return INITIAL_DEMO_TRIP.id
  return localStorage.getItem(ACTIVE_TRIP_ID_KEY) || INITIAL_DEMO_TRIP.id
}

export function saveActiveTripId(id: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(ACTIVE_TRIP_ID_KEY, id)
}
