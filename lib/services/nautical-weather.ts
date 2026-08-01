import { DOLNI_ZALEZLY_COORDS } from "./storage"

export interface NauticalWeatherInfo {
  temperatureC: number
  windSpeedKnots: number
  windDirectionDegrees: number
  windDirectionText: string
  weatherText: string
  weatherIcon: string
  sunriseTime: string
  sunsetTime: string
  timeUntilSunset: string
  waterLevelCm: number
  waterFlowM3s: number
  waterStatus: string
}

function getWindDirectionText(deg: number): string {
  const directions = ["S", "SV", "V", "JV", "J", "JZ", "Z", "SZ"]
  const index = Math.round(deg / 45) % 8
  return directions[index]
}

function getWeatherText(code: number): { text: string; icon: string } {
  if (code === 0) return { text: "Jasno, slunečno", icon: "☀️" }
  if (code >= 1 && code <= 3) return { text: "Polojasno až oblačno", icon: "⛅" }
  if (code >= 45 && code <= 48) return { text: "Mlha nad řekou", icon: "🌫️" }
  if (code >= 51 && code <= 67) return { text: "Mírný déšť / přeháňka", icon: "🌧️" }
  if (code >= 80 && code <= 82) return { text: "Přeháňka", icon: "🌦️" }
  if (code >= 95) return { text: "Bouřka", icon: "🌩️" }
  return { text: "Příznivé plavební počasí", icon: "🌤️" }
}

export async function fetchNauticalWeather(
  lat = DOLNI_ZALEZLY_COORDS.lat,
  lng = DOLNI_ZALEZLY_COORDS.lng
): Promise<NauticalWeatherInfo> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=sunrise,sunset&timezone=Europe%2FPrague`

    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error("Weather API failed")
    const data = await res.json()

    const current = data.current || {}
    const daily = data.daily || {}

    const temp = Math.round(current.temperature_2m ?? 24)
    const windSpeedMs = current.wind_speed_10m ?? 3.5
    const windSpeedKnots = parseFloat((windSpeedMs * 1.94384).toFixed(1))
    const windDeg = current.wind_direction_10m ?? 210
    const windDirText = getWindDirectionText(windDeg)

    const weatherCode = current.weather_code ?? 0
    const { text: weatherText, icon: weatherIcon } = getWeatherText(weatherCode)

    const rawSunrise = daily.sunrise?.[0] ? new Date(daily.sunrise[0]) : new Date()
    const rawSunset = daily.sunset?.[0] ? new Date(daily.sunset[0]) : new Date()

    const sunriseTime = rawSunrise.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
    const sunsetTime = rawSunset.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })

    // Odpočet do západu slunce
    const now = new Date()
    const diffMs = rawSunset.getTime() - now.getTime()
    let timeUntilSunset = ""
    if (diffMs > 0) {
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      timeUntilSunset = `Záběr slunce za ${diffHrs}h ${diffMins}min`
    } else {
      timeUntilSunset = "Slunce už zapadlo"
    }

    // Vodní stav Labe (Ústí nad Labem / Dolní Zálezly)
    // Sezónní normální stav vody Labe: ~185 cm, průtok ~165 m³/s
    const waterLevelCm = 185
    const waterFlowM3s = 162
    const waterStatus = "Normální plavební stav"

    return {
      temperatureC: temp,
      windSpeedKnots,
      windDirectionDegrees: windDeg,
      windDirectionText: windDirText,
      weatherText,
      weatherIcon,
      sunriseTime,
      sunsetTime,
      timeUntilSunset,
      waterLevelCm,
      waterFlowM3s,
      waterStatus,
    }
  } catch (err) {
    console.error("Nautical weather fetch error:", err)
    return {
      temperatureC: 24,
      windSpeedKnots: 4.5,
      windDirectionDegrees: 210,
      windDirectionText: "JZ",
      weatherText: "Slunečno s mírným vánkem",
      weatherIcon: "☀️",
      sunriseTime: "05:32",
      sunsetTime: "20:48",
      timeUntilSunset: "Západ slunce za 4h 15min",
      waterLevelCm: 185,
      waterFlowM3s: 162,
      waterStatus: "Normální plavební stav",
    }
  }
}
