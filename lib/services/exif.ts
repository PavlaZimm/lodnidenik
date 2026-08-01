import ExifReader from "exifreader"

export interface PhotoExifData {
  lat?: number
  lng?: number
  takenAt?: string
}

export async function extractExifFromPhoto(file: File): Promise<PhotoExifData> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const tags = ExifReader.load(arrayBuffer)

    let lat: number | undefined
    let lng: number | undefined
    let takenAt: string | undefined

    if (tags.GPSLatitude && tags.GPSLongitude) {
      const latVal = tags.GPSLatitude.description
      const lngVal = tags.GPSLongitude.description
      const latRefVal = tags.GPSLatitudeRef?.value
      const lngRefVal = tags.GPSLongitudeRef?.value
      const latRef = Array.isArray(latRefVal) ? String(latRefVal[0]) : String(latRefVal || "N")
      const lngRef = Array.isArray(lngRefVal) ? String(lngRefVal[0]) : String(lngRefVal || "E")

      if (typeof latVal === "number" && typeof lngVal === "number") {
        lat = latRef.startsWith("S") ? -latVal : latVal
        lng = lngRef.startsWith("W") ? -lngVal : lngVal
      }
    }

    if (tags.DateTimeOriginal?.description) {
      // EXIF date format: "YYYY:MM:DD HH:MM:SS"
      const dateStr = tags.DateTimeOriginal.description
      const parts = dateStr.split(" ")
      if (parts.length === 2) {
        const ymd = parts[0].replace(/:/g, "-")
        takenAt = new Date(`${ymd}T${parts[1]}`).toISOString()
      }
    }

    return { lat, lng, takenAt }
  } catch (err) {
    console.warn("Could not read EXIF data:", err)
    return {}
  }
}
