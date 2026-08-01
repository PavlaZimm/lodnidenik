/**
 * Reverzní geocoding přes Nominatim (OpenStreetMap API)
 * Dodržujeme Usage Policy: vlastního User-Agent a šetrné volání.
 */

interface NominatimResponse {
  display_name?: string
  address?: {
    village?: string
    town?: string
    city?: string
    municipality?: string
    suburb?: string
    county?: string
    state?: string
    water?: string
    river?: string
    sea?: string
  }
}

const cache = new Map<string, string>()

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          "User-Agent": "RodinnyLodniDenik/1.0 (rodinny-lodni-denik-app)",
        },
      }
    )

    if (!response.ok) {
      return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
    }

    const data: NominatimResponse = await response.json()
    const addr = data.address

    let name =
      addr?.water ||
      addr?.river ||
      addr?.sea ||
      addr?.village ||
      addr?.town ||
      addr?.city ||
      addr?.municipality ||
      addr?.suburb ||
      addr?.county ||
      data.display_name?.split(",")[0] ||
      `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`

    if (name.length > 40) {
      name = name.substring(0, 40) + "..."
    }

    cache.set(cacheKey, name)
    return name
  } catch (error) {
    console.warn("Geocoding failed:", error)
    return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
  }
}
