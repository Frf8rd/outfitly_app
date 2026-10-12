import { useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Chip, Surface, Text } from "react-native-paper";
import { colors } from "@/constants/theme";

const OCCASIONS = ["Școală", "Întâlnire", "Petrecere", "Vacanță"];

const OUTFIT = [
  { emoji: "👚", label: "Bluză", bg: "#FDE4EF" },
  { emoji: "👖", label: "Blugi", bg: "#E6DDFB" },
  { emoji: "👟", label: "Adidași", bg: "#FFF1D6" },
];

export default function HomeScreen() {
  const [occasion, setOccasion] = useState("Școală");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text variant="headlineMedium" style={styles.title}>Salut! 👋</Text>
          <Text variant="bodyMedium" style={styles.muted}>Stilul tău, regulile tale!</Text>
        </View>

        <Surface style={styles.weather} elevation={0}>
          <Text style={styles.weatherEmoji}>🌤️</Text>
          <View style={{ flex: 1 }}>
            <Text variant="titleLarge" style={styles.weatherTemp}>18°C</Text>
            <Text variant="bodyMedium" style={styles.weatherText}>Parțial noros · ia o jachetă ușoară</Text>
          </View>
        </Surface>

        <Text variant="titleMedium" style={styles.section}>Pentru ce ocazie?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {OCCASIONS.map((o) => (
            <Chip
              key={o}
              selected={occasion === o}
              showSelectedCheck={false}
              onPress={() => setOccasion(o)}
              style={[styles.chip, occasion === o && styles.chipActive]}
              textStyle={occasion === o ? styles.chipTextActive : styles.chipText}
            >
              {o}
            </Chip>
          ))}
        </ScrollView>

        <Text variant="titleMedium" style={styles.section}>Ținuta zilei</Text>
        <Surface style={styles.outfitCard} elevation={2}>
          <View style={styles.items}>
            {OUTFIT.map((item) => (
              <View key={item.label} style={styles.itemWrap}>
                <View style={[styles.item, { backgroundColor: item.bg }]}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                </View>
                <Text variant="labelMedium" style={styles.muted}>{item.label}</Text>
              </View>
            ))}
          </View>
          <Text variant="bodyMedium" style={styles.muted}>Potrivită pentru: {occasion}</Text>
          <Button icon="heart-outline" mode="outlined" style={styles.saveBtn}>Salvează la favorite</Button>
        </Surface>

        <Button
          mode="contained"
          icon="auto-fix"
          style={styles.surprise}
          contentStyle={styles.surpriseContent}
          labelStyle={styles.surpriseLabel}
          onPress={() => console.log("Surprinde-mă!")}
        >
          Surprinde-mă!
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 14 },
  title: { fontWeight: "800", color: colors.text },
  muted: { color: "#7a6b8a" },
  weather: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 24, backgroundColor: colors.pink },
  weatherEmoji: { fontSize: 44 },
  weatherTemp: { fontWeight: "800", color: colors.text },
  weatherText: { color: colors.text },
  section: { marginTop: 6, fontWeight: "700", color: colors.text },
  chips: { gap: 8, paddingRight: 20 },
  chip: { backgroundColor: "#fff", borderRadius: 20, borderWidth: 1, borderColor: colors.lavender },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  outfitCard: { padding: 18, borderRadius: 24, backgroundColor: "#fff", gap: 12 },
  items: { flexDirection: "row", justifyContent: "space-between" },
  itemWrap: { alignItems: "center", gap: 6, flex: 1 },
  item: { width: 84, height: 84, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  itemEmoji: { fontSize: 40 },
  saveBtn: { borderColor: colors.primary },
  surprise: { borderRadius: 28, marginTop: 4 },
  surpriseContent: { paddingVertical: 8 },
  surpriseLabel: { fontSize: 16, fontWeight: "700" },
});