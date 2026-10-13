// Adresa serverului vine din client/.env: EXPO_PUBLIC_API_URL=http://192.168.1.15:4000/api
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

// Cât timp nu ai server, autentificarea merge în mod DEMO (acceptă orice date valide).
export const MOCK_AUTH = API_URL === "";