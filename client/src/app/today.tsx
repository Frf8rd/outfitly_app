import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { MOCK_OUTFITS, MOCK_WEATHER } from "@/constants/mock";
import AppButton from "@/components/ui/AppButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import WeatherCard from "@/components/home/WeatherCard";
import OutfitPreview from "@/components/outfit/OutfitPreview";
import { OCCASIONS } from "@/components/home/OccasionPicker";

export default function Today() {
  const router = useRouter();
  // TODO: GET /suggestions/today?occasion=&lat=&lon=
  const [index, setIndex] = useState(0);
  const [outfits, setOutfits] = useState(MOCK_OUTFITS);
  const outfit = outfits[index];
  const occasion = OCCASIONS.find((o) => o.value === outfit.occasion)?.label;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Ținuta zilei" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <WeatherCard weather={MOCK_WEATHER} />

        <OutfitPreview
          items={outfit.items}
          isFavorite={outfit.isFavorite}
          onToggleFavorite={() =>
            setOutfits((l) => l.map((o, i) => (i === index ? { ...o, isFavorite: !o.isFavorite } : o))) // TODO: POST /outfits
          }
        />

        <View style={{ gap: 8 }}>
          <Text variant="titleMedium" style={styles.title}>{outfit.name}</Text>
          <View style={styles.tags}>
            {[occasion, `${MOCK_WEATHER.temperature}°C`, MOCK_WEATHER.summary].map((t) => (
              <View key={t} style={styles.tag}><Text variant="labelMedium" style={styles.tagText}>{t}</Text></View>
            ))}
          </View>
        </View>

        <AppButton label="Vezi detalii" onPress={() => router.push(`/outfit/${outfit.id}`)} />
        <AppButton label="Altă sugestie" variant="outline" icon="refresh" onPress={() => setIndex((index + 1) % outfits.length)} />
      </ScrollView>
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