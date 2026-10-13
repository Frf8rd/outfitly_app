import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import EmptyState from "@/components/ui/EmptyState";
import ScreenHeader from "@/components/ui/ScreenHeader";
import OutfitPreview from "@/components/outfit/OutfitPreview";
import { OCCASIONS } from "@/components/home/OccasionPicker";
import { useSuggestionOutfit, useSurprise } from "@/hooks/useSuggestions";
import { ApiError } from "@/services/api";
import { toPiece } from "@/services/wardrobe";
import type { Occasion, Suggestion } from "@/types/models";

export default function Surprise() {
  const router = useRouter();
  const params = useLocalSearchParams<{ occasion?: string }>();
  const occasion = (OCCASIONS.find((o) => o.value === params.occasion)?.value ?? "EVERYDAY") as Occasion;

  const [result, setResult] = useState<Suggestion | null>(null);
  const [seen, setSeen] = useState<string[]>([]); // ca „Încă una!” să nu repete aceeași ținută
  const [tooSmall, setTooSmall] = useState(false);
  const surprise = useSurprise();
  const outfit = useSuggestionOutfit(result ?? undefined, "SURPRISE");

  const fail = (e: unknown, fallback: string) => Alert.alert("Eroare", e instanceof ApiError ? e.message : fallback);

  async function roll() {
    try {
      const s = await surprise.mutateAsync({ occasion, previousKeys: seen.slice(-10) });
      setResult(s);
      setSeen((l) => [...l, s.key]);
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) setTooSmall(true);
      else fail(e, "Nu am putut alege o ținută. Încearcă din nou.");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Surprinde-mă!" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tooSmall ? (
          <EmptyState
            emoji="👗"
            title="Garderoba e prea mică"
            message="Adaugă un top și un pantalon (sau o rochie) ca să te pot surprinde."
            actionLabel="Adaugă haine"
            onAction={() => router.replace("/(tabs)/wardrobe")}
          />
        ) : result ? (
          <>
            <OutfitPreview
              items={result.items.map((w) => toPiece(w))}
              isFavorite={outfit.isFavorite}
              onToggleFavorite={() => outfit.toggleFavorite().catch((e) => fail(e, "Nu am putut salva ținuta."))}
            />
            <Text variant="titleMedium" style={styles.title}>{result.name}</Text>
            <AppButton
              label="Vezi detalii"
              loading={outfit.busy}
              onPress={() => outfit.ensureSaved().then((id) => router.push(`/outfit/${id}`)).catch((e) => fail(e, "Nu am putut deschide ținuta."))}
            />
            <AppButton label="Încă una!" variant="outline" icon="sparkles-outline" loading={surprise.isPending} onPress={roll} />
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
            <AppButton label="Surprinde-mă!" icon="sparkles-outline" loading={surprise.isPending} onPress={roll} style={{ alignSelf: "stretch" }} />
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