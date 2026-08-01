export interface TrackPoint {
  id: string
  lat: number
  lng: number
  timestamp: string // ISO string
  speedKnots?: number
  heading?: number
  altitude?: number
}

export interface Photo {
  id: string
  url: string
  lat?: number
  lng?: number
  takenAt?: string
  caption?: string
}

export interface LogEntry {
  id: string
  tripId: string
  timestamp: string // ISO string
  title: string
  text: string
  placeName: string
  lat: number
  lng: number
  photos: Photo[]
  category?: "stop" | "note" | "anchor" | "fuel" | "sight" | "warning"
}

export interface PreTripCheck {
  departureHarbour: string
  destinationHarbour: string
  captain: string
  crew: string
  weatherForecast: string
  fuelLevel: string
  engineHours: string
  boatNotes: string
  departureDate: string
}

export interface Trip {
  id: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  status: "draft" | "active" | "completed"
  preTripCheck?: PreTripCheck
  track: TrackPoint[]
  entries: LogEntry[]
  totalDistanceKm: number
}
