export interface Vessel {
  mmsi: number
  name: string
  type: "cargo" | "passenger" | "tug" | "pleasure" | "tanker"
  typeName: string
  lat: number
  lng: number
  speedKnots: number
  heading: number
  lengthMeters: number
  destination: string
  flag: string
}

export const DEFAULT_VESSELS: Vessel[] = [
  {
    mmsi: 270001042,
    name: "LABE 14",
    type: "cargo",
    typeName: "Nákladní šípaté plavidlo (Kargo)",
    lat: 50.575,
    lng: 14.068,
    speedKnots: 6.2,
    heading: 145,
    lengthMeters: 80,
    destination: "Děčín -> Mělník",
    flag: "🇨🇿 Česko",
  },
  {
    mmsi: 270020110,
    name: "PORTA BOHEMICA I",
    type: "passenger",
    typeName: "Výletní osobní loď",
    lat: 50.548,
    lng: 14.102,
    speedKnots: 8.5,
    heading: 320,
    lengthMeters: 45,
    destination: "Litoměřice -> Ústí nad Labem",
    flag: "🇨🇿 Česko",
  },
  {
    mmsi: 211245890,
    name: "BESKYDY",
    type: "tug",
    typeName: "Zadokolesový remorkér",
    lat: 50.602,
    lng: 14.038,
    speedKnots: 4.1,
    heading: 10,
    lengthMeters: 58,
    destination: "Ústí nad Labem (Střekov)",
    flag: "🇨🇿 Česko",
  },
  {
    mmsi: 270014520,
    name: "ELBE PRINCESS",
    type: "passenger",
    typeName: "Kabinová výletní loď",
    lat: 50.531,
    lng: 14.138,
    speedKnots: 7.0,
    heading: 130,
    lengthMeters: 95,
    destination: "Drážďany -> Praha",
    flag: "🇫🇷 Francie",
  },
]

export async function fetchLiveVessels(lat: number = 50.5973, lng: number = 14.0431): Promise<Vessel[]> {
  try {
    const res = await fetch(`/api/ais?lat=${lat}&lng=${lng}`)
    if (!res.ok) return DEFAULT_VESSELS
    const data = await res.json()
    return data.vessels || DEFAULT_VESSELS
  } catch (err) {
    console.warn("AIS Live fetch fallback:", err)
    return DEFAULT_VESSELS
  }
}
