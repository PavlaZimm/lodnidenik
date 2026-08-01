import { Trip } from "@/lib/types/logbook"

export function generateGpxXml(trip: Trip): string {
  const trackPointsXml = trip.track
    .map(
      (pt) =>
        `      <trkpt lat="${pt.lat}" lon="${pt.lng}">
        <time>${pt.timestamp}</time>
        ${pt.speedKnots ? `<speed>${(pt.speedKnots * 0.514444).toFixed(2)}</speed>` : ""}
      </trkpt>`
    )
    .join("\n")

  const waypointsXml = trip.entries
    .map(
      (entry) =>
        `  <wpt lat="${entry.lat}" lon="${entry.lng}">
    <name>${escapeXml(entry.title)}</name>
    <desc>${escapeXml(entry.text || "")} — Místo: ${escapeXml(entry.placeName)}</desc>
    <time>${entry.timestamp}</time>
  </wpt>`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Rodinný lodní deník" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(trip.name)}</name>
    <desc>${escapeXml(trip.description || "Plavba z lodního deníku")}</desc>
    <time>${trip.startDate}</time>
  </metadata>
${waypointsXml}
  <trk>
    <name>${escapeXml(trip.name)}</name>
    <trkseg>
${trackPointsXml}
    </trkseg>
  </trk>
</gpx>`
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function downloadGpxFile(trip: Trip) {
  const gpxContent = generateGpxXml(trip)
  const blob = new Blob([gpxContent], { type: "application/gpx+xml;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  const filename = `${trip.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.gpx`
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
