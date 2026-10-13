import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { ApiError } from "@/services/api";
import { loginWithGoogleIdToken } from "@/services/auth";

WebBrowser.maybeCompleteAuthSession();

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Hook: const signInWithGoogle = useGoogleSignIn(); await signInWithGoogle();
// Aruncă ApiError cu mesaj dacă nu e configurat sau utilizatorul anulează (cod CANCELLED).
export function useGoogleSignIn() {
  // ID-uri de rezervă ca hook-ul să nu arunce eroare când nu e configurat nimic
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: webClientId ?? "missing",
    androidClientId: androidClientId ?? webClientId ?? "missing",
    iosClientId: iosClientId ?? webClientId ?? "missing",
  });

  return async () => {
    if (!webClientId && !androidClientId && !iosClientId) {
      throw new ApiError(0, "GOOGLE_NOT_CONFIGURED", "Autentificarea cu Google nu e configurată încă.");
    }
    if (!request) throw new ApiError(0, "GOOGLE_NOT_READY", "Se pregătește Google, încearcă din nou.");
    const result = await promptAsync();
    if (result.type !== "success") throw new ApiError(0, "CANCELLED", ""); // anulat de utilizator
    const idToken = result.params?.id_token;
    if (!idToken) throw new ApiError(0, "GOOGLE_FAILED", "Autentificarea cu Google a eșuat.");
    return loginWithGoogleIdToken(idToken);
  };
}
