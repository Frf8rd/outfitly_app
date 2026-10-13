import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";
import { CLOTHES } from "@/constants/clothes";
import AppButton from "@/components/ui/AppButton";
import WeatherCard from "@/components/home/WeatherCard";
import OccasionPicker from "@/components/home/OccasionPicker";
import OutfitPreview from "@/components/outfit/OutfitPreview";
import { useAuthStore } from "@/store/auth";
import type { Occasion, OutfitSuggestion, Weather } from "@/types/models";

// ---- DATE MOCK: se înlocuiesc cu hook-uri (useAuth, useWeather, useTodayOutfit) ----

const WEATHER: Weather = { temperature: 18, condition: "clear", summary: "Cer senin", city: "Chișinău" };

const SUGGESTION: OutfitSuggestion = {
  name: "Look casual",
  occasion: "EVERYDAY",
  isFavorite: false,
  items: [
    { id: "1", name: "Pulover verde", category: "TOP", image: CLOTHES.pulover },
    { id: "2", name: "Pantaloni crem", category: "BOTTOM", image: CLOTHES.pantaloni },
    { id: "3", name: "Sneakers", category: "SHOES", image: CLOTHES.adidasi },
  ],
};
// ------------------------------------------------------------------------------------

export default function HomeScreen() {
  const router = useRouter();
  const userName = useAuthStore((s) => s.user?.name);
  const [occasion, setOccasion] = useState<Occasion>("EVERYDAY");
  const [isFavorite, setIsFavorite] = useState(SUGGESTION.isFavorite);

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
            accessibilityLabel="Notificări"
            hitSlop={10}
            onPress={() => console.log("TODO: notificări")}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.ink} />
          </Pressable>
        </View>

        {/* Vreme */}
        <View style={styles.padded}>
          <WeatherCard weather={WEATHER} />
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
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push("/today")}
              style={styles.linkRow}
            >
              <Text variant="labelLarge" style={styles.link}>
                Vezi sugestia
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </Pressable>
          </View>

          <OutfitPreview
            items={SUGGESTION.items}
            isFavorite={isFavorite}
            onToggleFavorite={() => setIsFavorite((v) => !v)}
          />

          <AppButton label="Vezi ținuta" onPress={() => router.push("/today")} />
          <AppButton
            label="Surprinde-mă!"
            variant="outline"
            icon="sparkles-outline"
            onPress={() => router.push("/surprise")}
          />
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
  block: { gap: 12 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontWeight: "700", color: colors.ink },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  link: { color: colors.primary, fontWeight: "600" },
});