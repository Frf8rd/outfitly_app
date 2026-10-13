import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { MOCK_OUTFITS } from "@/constants/mock";
import AppButton from "@/components/ui/AppButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import OutfitCard from "@/components/outfit/OutfitCard";

const LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

// ---- DATE MOCK: zi din săptămână (0 = luni) -> id-uri de ținute purtate. Vine din WearLog (GET /stats). ----
const WORN: Record<number, string[]> = { 0: ["1"], 1: ["2"], 3: ["3", "4"] };
const STATS = { unworn: 11, newOutfits: 8 };
// -----------------------------------------------------------------------------------------------------------

export default function Journal() {
  const router = useRouter();

  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7; // luni = 0
  const days = LETTERS.map((letter, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - todayIndex + i);
    return { letter, date: d.getDate() };
  });

  const [selected, setSelected] = useState(todayIndex);
  const [showStats, setShowStats] = useState(false);

  const worn = (WORN[selected] ?? []).map((id) => MOCK_OUTFITS.find((o) => o.id === id)!).filter(Boolean);
  const daysWithOutfit = Object.keys(WORN).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Jurnal" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="titleMedium" style={styles.title}>Am purtat asta azi</Text>

        <View style={styles.week}>
          {days.map((d, i) => {
            const on = i === selected;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${d.date}${WORN[i] ? ", ai purtat o ținută" : ""}`}
                onPress={() => setSelected(i)}
                style={styles.day}
              >
                <Text variant="labelMedium" style={styles.muted}>{d.letter}</Text>
                <View style={[styles.dateCircle, on && styles.dateCircleOn]}>
                  <Text variant="labelLarge" style={[styles.dateText, on && { color: "#fff", fontWeight: "700" }]}>{d.date}</Text>
                </View>
                <View style={[styles.dot, WORN[i] ? { backgroundColor: colors.accent } : null]} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.rowBetween}>
          <Text variant="titleSmall" style={styles.title}>Ținute purtate</Text>
          <Text variant="labelLarge" style={styles.muted}>{daysWithOutfit} din 7 zile</Text>
        </View>

        {worn.length > 0 ? (
          <View style={styles.grid}>
            {worn.map((o) => (
              <View key={o.id} style={styles.cell}>
                <OutfitCard outfit={o} onPress={() => router.push(`/outfit/${o.id}`)} />
              </View>
            ))}
          </View>
        ) : (
          <Text variant="bodyMedium" style={[styles.muted, { textAlign: "center", paddingVertical: 24 }]}>
            Nu ai marcat nicio ținută în ziua asta.
          </Text>
        )}

        {selected === todayIndex ? (
          <AppButton
            label="Am purtat o ținută azi"
            icon="add"
            onPress={() => Alert.alert("Alege ținuta", "Alegerea din lista ta de ținute vine în curând.")} // TODO: POST /outfits/:id/wear
          />
        ) : null}

        <AppButton
          label={showStats ? "Ascunde statisticile" : "Vezi statistici"}
          variant="outline"
          icon="stats-chart"
          onPress={() => setShowStats((s) => !s)}
        />

        {showStats ? (
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text variant="headlineSmall" style={styles.statValue}>{STATS.unworn}</Text>
              <Text variant="bodySmall" style={styles.muted}>haine nepurtate în ultimele 30 de zile</Text>
            </View>
            <View style={styles.stat}>
              <Text variant="headlineSmall" style={styles.statValue}>{STATS.newOutfits}</Text>
              <Text variant="bodySmall" style={styles.muted}>ținute noi făcute fără cumpărături</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 4, gap: 16 },
  title: { fontWeight: "700", color: colors.ink },
  muted: { color: colors.muted },
  week: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  day: { alignItems: "center", gap: 6 },
  dateCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dateCircleOn: { backgroundColor: colors.primary },
  dateText: { color: colors.ink },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "transparent" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cell: { width: "47.5%" },
  stats: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, gap: 4, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  statValue: { fontWeight: "800", color: colors.primary },
});