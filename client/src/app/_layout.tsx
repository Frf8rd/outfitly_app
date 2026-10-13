import { useEffect } from "react";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from "react-native-paper";
import { theme } from "@/constants/theme";
import { queryClient } from "@/services/queryClient";
import { useAuthStore } from "@/store/auth";

// Ținem splash-ul pe ecran până știm dacă există o sesiune salvată (altfel se vede un flash de login).
SplashScreen.preventAutoHideAsync();

export const unstable_settings = { initialRouteName: "(auth)" };

// Gardul de rute: nelogat -> (auth), logat -> (tabs). Rulează la fiecare schimbare de stare sau de rută.
function useAuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const navReady = !!useRootNavigationState()?.key;
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (!navReady || status === "loading") return;
    const inAuthGroup = segments[0] === "(auth)";
    if (status === "signedOut" && !inAuthGroup) router.replace("/welcome");
    else if (status === "signedIn" && inAuthGroup) router.replace("/(tabs)");
  }, [navReady, status, segments, router]);

  useEffect(() => {
    if (status !== "loading") SplashScreen.hideAsync();
  }, [status]);
}

export default function RootLayout() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useAuthGate();

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </QueryClientProvider>
  );
}
