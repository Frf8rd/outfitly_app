import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import ScreenHeader from "@/components/ui/ScreenHeader";
import WeatherCard from "@/components/home/WeatherCard";
import OutfitPreview from "@/components/outfit/OutfitPreview";
import { OCCASIONS } from "@/components/home/OccasionPicker";
import { useCoords, useSuggestionOutfit, useTodaySuggestion } from "@/hooks/useSuggestions";
import { ApiError } from "@/services/api";
import { toPiece } from "@/services/wardrobe";
import type { Occasion } from "@/types/models";

export default function Today() {
  const router = useRouter();
  const params = useLocalSearchParams<{ occasion?: string }>();
  const occasion = (OCCASIONS.find((o) => o.value === params.occasion)?.value ?? "EVERYDAY") as Occasion;

  const [variant, setVariant] = useState(0);
  const { data: coords } = useCoords();
  const { data: suggestion, error, isError, isFetching, refetch } = useTodaySuggestion(occasion, variant, coords);
  const outfit = useSuggestionOutfit(suggestion, "TODAY");

  const occasionLabel = OCCASIONS.find((o) => o.value === suggestion?.occasion)?.label;
  const fail = (e: unknown, fallback: string) => Alert.alert("Eroare", e instanceof ApiError ? e.message : fallback);

  let body;
  if (error instanceof ApiError && error.status === 422) {
    body = (
      <EmptyState
        emoji="👗"
        title="Garderoba e prea mică"
        message="Adaugă un top și un pantalon (sau o rochie) ca să-ți pot sugera o ținută."
        actionLabel="Adaugă haine"
        onAction={() => router.replace("/(tabs)/wardrobe")}
      />
    );
  } else if (isError && !suggestion) {
    body = <ErrorState error={error} onRetry={() => refetch()} />;
  } else if (!suggestion) {
    body = <Loading label="Îți aleg ținuta…" />;
  } else {
    const weather = suggestion.weather;
    const tags = [occasionLabel, weather ? `${Math.round(weather.temperature)}°C` : null, weather?.summary].filter(Boolean) as string[];
    body = (
      <>
        {weather && coords ? <WeatherCard weather={{ ...weather, city: coords.city }} /> : null}

        <OutfitPreview
          items={suggestion.items.map((w) => toPiece(w))}
          isFavorite={outfit.isFavorite}
          onToggleFavorite={() => outfit.toggleFavorite().catch((e) => fail(e, "Nu am putut salva ținuta."))}
        />

        <View style={{ gap: 8 }}>
          <Text variant="titleMedium" style={styles.title}>{suggestion.name}</Text>
          <View style={styles.tags}>
            {tags.map((t) => (
              <View key={t} style={styles.tag}><Text variant="labelMedium" style={styles.tagText}>{t}</Text></View>
            ))}
          </View>
        </View>

        <AppButton
          label="Vezi detalii"
          loading={outfit.busy}
          onPress={() => outfit.ensureSaved().then((id) => router.push(`/outfit/${id}`)).catch((e) => fail(e, "Nu am putut deschide ținuta."))}
        />
        <AppButton label="Altă sugestie" variant="outline" icon="refresh" loading={isFetching} onPress={() => setVariant((v) => v + 1)} />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Ținuta zilei" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{body}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 4, gap: 16 },
  title: { fontWeight: "700", color: colors.ink },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 12, height: 30, borderRadius: radius.pill, justifyContent: "center", backgroundColor: colors.mist },
  tagText: { color: colors.ink },
});