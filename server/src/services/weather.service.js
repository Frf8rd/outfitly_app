// Proxy către Open-Meteo (gratuit, fără cheie). Cache scurt în memorie ca să nu lovim API-ul la fiecare deschidere de ecran.
const TTL_MS = 10 * 60 * 1000;
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

// -> { temperature (°C, "se simte ca"), condition, summary } sau aruncă eroarea (apelantul decide dacă o ignoră)
export async function getWeather(lat, lon) {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}` +
    `&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = await res.json();
  const c = json.current;
  if (!c) throw new Error("Open-Meteo: răspuns fără date curente");

  const data = { temperature: Math.round(c.apparent_temperature ?? c.temperature_2m), ...describe(c.weather_code) };
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(key, { at: Date.now(), data });
  return data;
}
