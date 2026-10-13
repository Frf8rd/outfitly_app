import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import ErrorState from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import WeatherCard from "@/components/home/WeatherCard";
import OccasionPicker from "@/components/home/OccasionPicker";
import OutfitPreview from "@/components/outfit/OutfitPreview";
import { useCoords, useSuggestionOutfit, useTodaySuggestion, useWeather } from "@/hooks/useSuggestions";
import { ApiError } from "@/services/api";
import { toPiece } from "@/services/wardrobe";
import { disableReminder, enableReminder, isReminderEnabled, REMINDER_TIME, remindersSupported } from "@/services/notifications";
import { useAuthStore } from "@/store/auth";
import type { Occasion } from "@/types/models";

export default function HomeScreen() {
  const router = useRouter();
  const userName = useAuthStore((s) => s.user?.name);
  const [occasion, setOccasion] = useState<Occasion>("EVERYDAY");
  const [reminderOn, setReminderOn] = useState(false);

  const { data: coords } = useCoords();
  const weather = useWeather(coords);
  const today = useTodaySuggestion(occasion, 0, coords);
  const suggestion = today.data;
  const outfit = useSuggestionOutfit(suggestion, "TODAY");

  useEffect(() => {
    isReminderEnabled().then(setReminderOn);
  }, []);

  // Clopoțelul: pornește notificarea zilnică; dacă e deja pornită, o poți opri.
  async function onBell() {
    if (!remindersSupported) {
      Alert.alert("Indisponibil aici", "Notificările locale nu funcționează în Expo Go pe Android. Folosește un build de dezvoltare sau `eas build --profile preview`.");
      return;
    }
    if (reminderOn) {
      Alert.alert("Notificări active", `Primești o notificare în fiecare dimineață la ${REMINDER_TIME}.`, [
        { text: "Închide", style: "cancel" },
        { text: "Dezactivează", style: "destructive", onPress: () => disableReminder().then(() => setReminderOn(false)) },
      ]);
      return;
    }
    const ok = await enableReminder();
    setReminderOn(ok);
    Alert.alert(
      ok ? "Notificări activate" : "Notificările sunt oprite",
      ok ? `Te anunțăm în fiecare dimineață la ${REMINDER_TIME} când ținuta ta e gata.` : "Permite notificările din setările telefonului ca să primești ținuta zilei."
    );
  }

  async function onFavorite() {
    try {
      await outfit.toggleFavorite();
    } catch (e) {
      Alert.alert("Eroare", e instanceof ApiError ? e.message : "Nu am putut salva ținuta.");
    }
  }

  async function openDetails() {
    try {
      router.push(`/outfit/${await outfit.ensureSaved()}`);
    } catch (e) {
      Alert.alert("Eroare", e instanceof ApiError ? e.message : "Nu am putut deschide ținuta.");
    }
  }

  const tooSmall = today.error instanceof ApiError && today.error.status === 422;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, styles.padded]}>
          <View style={styles.headerText}>
            <View style={styles.greetingRow}>
              <Text variant="headlineSmall" style={styles.greeting}>
                Bună{userName ? `, ${userName}` : ""}!
              </Text>
              <Ionicons name="heart-outline" size={20} color={colors.primary} />
            </View>
            <Text variant="bodyMedium" style={styles.muted}>
              Astăzi e o zi perfectă pentru un outfit nou!
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={reminderOn ? "Notificări active" : "Activează notificările"}
            hitSlop={10}
            onPress={onBell}
          >
            <Ionicons name={reminderOn ? "notifications" : "notifications-outline"} size={24} color={reminderOn ? colors.primary : colors.ink} />
          </Pressable>
        </View>

        {/* Vreme */}
        <View style={styles.padded}>
          {weather.data && coords ? (
            <WeatherCard weather={{ ...weather.data, city: coords.city }} />
          ) : (
            <View style={styles.weatherPlaceholder}>
              <Text variant="bodyMedium" style={styles.muted}>
                {weather.isError ? "Nu am putut încărca vremea acum." : "Se încarcă vremea…"}
              </Text>
            </View>
          )}
          {coords?.approximate ? (
            <Text variant="bodySmall" style={[styles.muted, { marginTop: 6 }]}>
              Locația nu e disponibilă, deci folosesc vremea din {coords.city}.
            </Text>
          ) : null}
        </View>

        {/* Ocazie */}
        <View style={styles.block}>
          <Text variant="titleMedium" style={[styles.sectionTitle, styles.padded]}>
            Pentru ce ocazie?
          </Text>
          <OccasionPicker value={occasion} onChange={setOccasion} />
        </View>

        {/* Ținuta zilei */}
        <View style={[styles.block, styles.padded]}>
          <View style={styles.sectionRow}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ținuta zilei
            </Text>
            {suggestion ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push({ pathname: "/today", params: { occasion } })}
                style={styles.linkRow}
              >
                <Text variant="labelLarge" style={styles.link}>
                  Vezi sugestia
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>

          {tooSmall ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👗</Text>
              <Text variant="titleSmall" style={styles.sectionTitle}>Garderoba e prea mică</Text>
              <Text variant="bodyMedium" style={[styles.muted, { textAlign: "center" }]}>
                Adaugă un top și un pantalon (sau o rochie) ca să-ți pot sugera ținuta zilei.
              </Text>
              <AppButton label="Adaugă haine" onPress={() => router.push("/(tabs)/wardrobe")} style={{ alignSelf: "stretch" }} />
            </View>
          ) : today.isError ? (
            <ErrorState error={today.error} onRetry={() => today.refetch()} />
          ) : !suggestion ? (
            <Loading label="Îți aleg ținuta…" />
          ) : (
            <>
              <OutfitPreview items={suggestion.items.map((w) => toPiece(w))} isFavorite={outfit.isFavorite} onToggleFavorite={onFavorite} />
              <AppButton label="Vezi ținuta" onPress={openDetails} loading={outfit.busy} />
            </>
          )}

          <AppButton label="Surprinde-mă!" variant="outline" icon="sparkles-outline" onPress={() => router.push({ pathname: "/surprise", params: { occasion } })} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 12, paddingBottom: 28, gap: 18 },
  padded: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerText: { flex: 1, gap: 2 },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  greeting: { fontWeight: "800", color: colors.ink },
  muted: { color: colors.muted },
  weatherPlaceholder: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  emptyCard: { alignItems: "center", gap: 8, padding: 20, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  emptyEmoji: { fontSize: 40 },
  block: { gap: 12 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontWeight: "700", color: colors.ink },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  link: { color: colors.primary, fontWeight: "600" },
});