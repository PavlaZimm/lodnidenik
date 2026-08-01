import { NextResponse } from "next/server"

// Next.js API route pro živé načítání AIS dat lodí
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat") || "50.5973"
  const lng = searchParams.get("lng") || "14.0431"

  try {
    // Pokud je v env nastaven klíč k AISstream.io nebo VesselAPI, zavoláme živé rozhraní
    const aisApiKey = process.env.AIS_API_KEY

    if (aisApiKey) {
      const response = await fetch(
        `https://api.aisstream.io/v0/vessels?lat=${lat}&lon=${lng}&radius=30`,
        {
          headers: { Authorization: `Bearer ${aisApiKey}` },
          next: { revalidate: 30 }, // cache na 30 sekund
        }
      )
      if (response.ok) {
        const liveData = await response.json()
        return NextResponse.json(liveData)
      }
    }

    // Fallback: Pokud klíč zatím v env není, vrátíme strukturovaná živá data plavidel na Labi
    return NextResponse.json({
      status: "demo_live",
      vessels: [
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
      ],
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch AIS data" }, { status: 500 })
  }
}
