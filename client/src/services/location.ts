import * as Location from "expo-location";

export type Coords = { lat: number; lon: number; city: string; approximate: boolean };

// Dacă utilizatorul refuză locația (sau nu merge GPS-ul), arătăm vremea din Chișinău, marcată ca „approximate”.
const FALLBACK: Coords = { lat: 47.01, lon: 28.86, city: "Chișinău", approximate: true };

export async function getCoords(): Promise<Coords> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== "granted") return FALLBACK;

    const pos = (await Location.getLastKnownPositionAsync()) ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
    if (!pos) return FALLBACK;
    const { latitude, longitude } = pos.coords;

    let city = "";
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      city = place?.city ?? place?.subregion ?? place?.region ?? "";
    } catch {
      // fără nume de oraș: afișăm doar „Locația ta”
    }
    return { lat: latitude, lon: longitude, city: city || "Locația ta", approximate: false };
  } catch {
    return FALLBACK;
  }
}
