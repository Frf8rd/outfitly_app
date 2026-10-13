import { api, qs } from "@/services/api";
import type { Occasion, Suggestion, WeatherData } from "@/types/models";

export const getWeather = (lat: number, lon: number) => api<WeatherData>(`/weather${qs({ lat, lon })}`);

export const getTodaySuggestion = (p: { occasion: Occasion; variant: number; lat?: number; lon?: number }) =>
  api<Suggestion>(`/suggestions/today${qs({ occasion: p.occasion, variant: p.variant, lat: p.lat, lon: p.lon })}`);

export const getSurprise = (body: { occasion?: Occasion; previousKeys?: string[] }) =>
  api<Suggestion>("/suggestions/surprise", { method: "POST", body });
