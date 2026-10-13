import { ApiError } from "@/services/api";
import { loginWithGoogleIdToken } from "@/services/auth";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Modulul e nativ: nu există în Expo Go sau în build-uri făcute înainte de instalare.
// Îl încărcăm într-un try/catch ca aplicația să pornească oricum (butonul Google doar arată un mesaj).
type GoogleModule = typeof import("@react-native-google-signin/google-signin");
let G: GoogleModule | null = null;
try {
  G = require("@react-native-google-signin/google-signin") as GoogleModule;
  G.GoogleSignin.configure({ webClientId });
} catch {
  G = null;
}

// Hook: const signInWithGoogle = useGoogleSignIn(); await signInWithGoogle();
// Aruncă ApiError cu mesaj dacă nu e configurat sau utilizatorul anulează (cod CANCELLED).
export function useGoogleSignIn() {
  return async () => {
    if (!G) {
      throw new ApiError(0, "GOOGLE_UNAVAILABLE", "Google Sign-In nu merge în Expo Go. Folosește un build nativ (APK de la EAS).");
    }
    if (!webClientId) {
      throw new ApiError(0, "GOOGLE_NOT_CONFIGURED", "Autentificarea cu Google nu e configurată încă.");
    }
    const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = G;
    try {
      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();
      if (!isSuccessResponse(res)) throw new ApiError(0, "CANCELLED", "");
      const idToken = res.data.idToken;
      if (!idToken) throw new ApiError(0, "GOOGLE_FAILED", "Autentificarea cu Google a eșuat.");
      return await loginWithGoogleIdToken(idToken);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) throw new ApiError(0, "CANCELLED", "");
      console.warn("[google] sign-in error:", e);
      throw new ApiError(0, "GOOGLE_FAILED", "Autentificarea cu Google a eșuat.");
    }
  };
}