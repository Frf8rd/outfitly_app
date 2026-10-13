// Proxy către Open-Meteo (gratuit, fără cheie). Cache scurt în memorie ca să nu lovim API-ul la fiecare deschidere de ecran.
const TTL_MS = 10 * 60 * 1000;
const STALE_MS = 6 * 60 * 60 * 1000; // dacă ambele surse pică, folosim ultimul răspuns de max 6 ore
const MAX_ENTRIES = 500;
const cache = new Map(); // "lat,lon" rotunjit la 2 zecimale (~1 km) -> { at, data }

// Codurile WMO folosite de Open-Meteo -> categoria simplă din aplicație + text în română
function describe(code) {
  if (code === 0) return { condition: "clear", summary: "Cer senin" };
  if (code === 1 || code === 2) return { condition: "cloudy", summary: "Parțial noros" };
  if (code === 3) return { condition: "cloudy", summary: "Noros" };
  if (code === 45 || code === 48) return { condition: "cloudy", summary: "Ceață" };
  if (code >= 51 && code <= 57) return { condition: "rain", summary: "Burniță" };
  if (code >= 61 && code <= 67) return { condition: "rain", summary: "Ploaie" };
  if (code >= 71 && code <= 77) return { condition: "snow", summary: "Ninsoare" };
  if (code >= 80 && code <= 82) return { condition: "rain", summary: "Averse" };
  if (code === 85 || code === 86) return { condition: "snow", summary: "Averse de zăpadă" };
  if (code >= 95) return { condition: "rain", summary: "Furtună" };
  return { condition: "cloudy", summary: "Variabil" };
}

// Open-Meteo (principal). Pe Render free IP-ul e partajat cu alte aplicații, deci uneori întoarce 429.
async function fromOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}` +
    `&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = await res.json();
  const c = json.current;
  if (!c) throw new Error("Open-Meteo: răspuns fără date curente");
  return { temperature: Math.round(c.apparent_temperature ?? c.temperature_2m), ...describe(c.weather_code) };
}

// MET Norway (rezervă, gratuit, fără cheie, dar cere User-Agent). Codurile lor -> aceeași formă ca mai sus.
function describeMet(symbol = "") {
  const s = symbol.replace(/_(day|night|polartwilight)$/, "");
  if (s.includes("thunder")) return { condition: "rain", summary: "Furtună" };
  if (s.includes("snow") || s.includes("sleet")) return { condition: "snow", summary: s.includes("sleet") ? "Lapoviță" : "Ninsoare" };
  if (s.includes("shower")) return { condition: "rain", summary: "Averse" };
  if (s.includes("rain")) return { condition: "rain", summary: "Ploaie" };
  if (s === "clearsky" || s === "fair") return { condition: "clear", summary: s === "clearsky" ? "Cer senin" : "Preponderent senin" };
  if (s === "partlycloudy") return { condition: "cloudy", summary: "Parțial noros" };
  if (s === "cloudy") return { condition: "cloudy", summary: "Noros" };
  if (s === "fog") return { condition: "cloudy", summary: "Ceață" };
  return { condition: "cloudy", summary: "Variabil" };
}

async function fromMetNo(lat, lon) {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": process.env.WEATHER_USER_AGENT || "Stilora/1.0 (https://stilora-api.onrender.com)" },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`MET Norway ${res.status}`);
  const json = await res.json();
  const t = json.properties?.timeseries?.[0]?.data;
  const temp = t?.instant?.details?.air_temperature;
  if (typeof temp !== "number") throw new Error("MET Norway: răspuns fără temperatură");
  const symbol = t.next_1_hours?.summary?.symbol_code ?? t.next_6_hours?.summary?.symbol_code;
  return { temperature: Math.round(temp), ...describeMet(symbol) };
}

// -> { temperature (°C), condition, summary } sau aruncă eroarea (apelantul decide dacă o ignoră).
// Ordine: cache proaspăt -> Open-Meteo -> MET Norway -> cache vechi (până la 6 ore) -> eroare.
export async function getWeather(lat, lon) {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  let data;
  try {
    data = await fromOpenMeteo(lat, lon);
  } catch (e1) {
    console.error("weather (principal):", e1.message);
    try {
      data = await fromMetNo(lat, lon);
    } catch (e2) {
      console.error("weather (rezervă):", e2.message);
      if (hit && Date.now() - hit.at < STALE_MS) return hit.data; // mai bine date vechi decât nimic
      throw e2;
    }
  }

  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(key, { at: Date.now(), data });
  return data;
}