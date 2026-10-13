import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { MOCK_OUTFITS } from "@/constants/mock";
import AppButton from "@/components/ui/AppButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import OutfitPreview from "@/components/outfit/OutfitPreview";
import type { SavedOutfit } from "@/components/outfit/OutfitCard";

export default function Surprise() {
  const router = useRouter();
  const [result, setResult] = useState<SavedOutfit | null>(null);
  const [loading, setLoading] = useState(false);

  async function surprise() {
    setLoading(true);
    // TODO: POST /suggestions/surprise  (acum: alegere aleatoare din mock, alta decât precedenta)
    await new Promise((r) => setTimeout(r, 600));
    const options = MOCK_OUTFITS.filter((o) => o.id !== result?.id);
    setResult(options[Math.floor(Math.random() * options.length)]);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Surprinde-mă!" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {result ? (
          <>
            <OutfitPreview
              items={result.items}
              isFavorite={result.isFavorite}
              onToggleFavorite={() => setResult({ ...result, isFavorite: !result.isFavorite })} // TODO: POST /outfits
            />
            <Text variant="titleMedium" style={styles.title}>{result.name}</Text>
            <AppButton label="Vezi detalii" onPress={() => router.push(`/outfit/${result.id}`)} />
            <AppButton label="Încă una!" variant="outline" icon="sparkles-outline" loading={loading} onPress={surprise} />
          </>
        ) : (
          <View style={styles.intro}>
            <View style={styles.circle}>
              <MaterialCommunityIcons name="hanger" size={72} color={colors.primary} />
            </View>
            <Text variant="headlineSmall" style={styles.title}>Surprinde-mă!</Text>
            <Text variant="bodyLarge" style={styles.muted}>
              Apasă butonul și primește o ținută aleatoare din garderoba ta!
            </Text>
            <AppButton label="Surprinde-mă!" icon="sparkles-outline" loading={loading} onPress={surprise} style={{ alignSelf: "stretch" }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 20, paddingTop: 4, gap: 16 },
  intro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingBottom: 40 },
  circle: { width: 150, height: 150, borderRadius: 75, backgroundColor: colors.sage, opacity: 0.5, alignItems: "center", justifyContent: "center" },
  title: { fontWeight: "800", color: colors.ink, textAlign: "center" },
  muted: { color: colors.muted, textAlign: "center" },
});