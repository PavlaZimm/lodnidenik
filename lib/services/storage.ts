import { Trip } from "@/lib/types/logbook"

const STORAGE_KEY = "rodinny_lodni_denik_trips"
const ACTIVE_TRIP_ID_KEY = "rodinny_lodni_denik_active_id"

// Přesná poloha plavebního koryta Labe v Dolních Zálezlech
export const DOLNI_ZALEZLY_COORDS = { lat: 50.5973179, lng: 14.0430777 }

export const INITIAL_DEMO_TRIP: Trip = {
  id: "demo-trip-labe",
  name: "Plavba po Labi z Dolních Zálezel",
  description: "Domovský přístav: Dolní Zálezly. Výprava po řece Labi kaňonem Porta Bohemica do Litoměřic.",
  startDate: "2026-08-01T09:00:00.000Z",
  status: "active",
  totalDistanceKm: 16.8,
  preTripCheck: {
    departureHarbour: "Dolní Zálezly (Domovský přístav Labe)",
    destinationHarbour: "Litoměřice — Říční km 790",
    captain: "Táta (Kapitán)",
    crew: "Máma a rodina",
    weatherForecast: "Slunečno, 25°C, mírný vítr 2 m/s",
    fuelLevel: "100 % (Plná nádrž)",
    engineHours: "148.0 mth",
    boatNotes: "Loď sídlí v Dolních Zálezlech na Labi. Zkontrolován motor, lana, palivo i vesty.",
    departureDate: "2026-08-01T09:00",
  },
  // Přesné GPS souřadnice plavebního koryta Labe
  track: [
    { id: "tp-1", lat: 50.5973, lng: 14.0431, timestamp: "2026-08-01T09:15:00.000Z", speedKnots: 0.0 }, // Dolní Zálezly na vodě
    { id: "tp-2", lat: 50.5840, lng: 14.0540, timestamp: "2026-08-01T09:45:00.000Z", speedKnots: 5.4 }, // Církvice meandr
    { id: "tp-3", lat: 50.5505, lng: 14.0620, timestamp: "2026-08-01T10:30:00.000Z", speedKnots: 5.8 }, // Porta Bohemica
    { id: "tp-4", lat: 50.5280, lng: 14.0780, timestamp: "2026-08-01T11:15:00.000Z", speedKnots: 4.5 }, // Velké Žernoseky / Píšťany
    { id: "tp-5", lat: 50.5140, lng: 14.0650, timestamp: "2026-08-01T11:45:00.000Z", speedKnots: 5.0 }, // Lovosice ohyb
    { id: "tp-6", lat: 50.5315, lng: 14.1335, timestamp: "2026-08-01T12:30:00.000Z", speedKnots: 0.0 }, // Litoměřice molo na vodě
  ],
  entries: [
    {
      id: "e-1",
      tripId: "demo-trip-labe",
      timestamp: "2026-08-01T09:15:00.000Z",
      title: "Domovský přístav — Dolní Zálezly",
      text: "Vyplouváme z domovského stanoviště na řece Labi v Dolních Zálezlech.",
      placeName: "Dolní Zálezly (Koryto Labe)",
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
      text: "Plavba přes nádhernou skalní bránu Porta Bohemica na řece Labi.",
      placeName: "Porta Bohemica - Labe",
      lat: 50.5505,
      lng: 14.0620,
      category: "sight",
      photos: [],
    },
    {
      id: "e-3",
      tripId: "demo-trip-labe",
      timestamp: "2026-08-01T12:30:00.000Z",
      title: "Kotvení u Litoměřic",
      text: "Přistání u mola na vodě v Litoměřicích, pauza na oběd na palubě.",
      placeName: "Litoměřice - Říční kotviště",
      lat: 50.5315,
      lng: 14.1335,
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
