import { useState } from "react";
import { DimensionValue, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AppButton from "@/components/ui/AppButton";
import type { ComponentProps } from "react";

type Challenge = {
  id: string;
  title: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  status: "ACTIVE" | "DONE" | "UPCOMING";
  day?: number;
  total?: number;
  dates?: string;
};

// ---- DATE MOCK: se înlocuiesc cu GET /challenges/current ----
const MOCK: Challenge[] = [
  { id: "1", title: "O ținută monocromă", icon: "trophy-outline", status: "ACTIVE", day: 3, total: 7 },
  { id: "2", title: "Poartă ceva ce n-ai purtat luna asta", icon: "footsteps-outline", status: "ACTIVE", day: 1, total: 7 },
  { id: "3", title: "O săptămână fără cumpărături", icon: "leaf-outline", status: "DONE", day: 7, total: 7 },
  { id: "4", title: "Look de weekend", icon: "sunny-outline", status: "UPCOMING", dates: "19 – 25 octombrie" },
];
// --------------------------------------------------------------

export default function Challenges() {
  const [tab, setTab] = useState<"ACTIVE" | "DONE">("ACTIVE");
  const [items, setItems] = useState(MOCK);

  const list = items.filter((c) => c.status === tab);
  const upcoming = items.filter((c) => c.status === "UPCOMING");
  const complete = (id: string) =>
    setItems((l) => l.map((c) => (c.id === id ? { ...c, status: "DONE", day: c.total } : c))); // TODO: POST /challenges/:id/complete

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Provocări" />

      <View style={styles.tabs}>
        {([["ACTIVE", "Active"], ["DONE", "Finalizate"]] as const).map(([value, label]) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: tab === value }}
            onPress={() => setTab(value)}
            style={[styles.tab, tab === value && styles.tabOn]}
          >
            <Text variant="labelLarge" style={[styles.tabText, tab === value && styles.tabTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <Text variant="bodyMedium" style={[styles.muted, { textAlign: "center", paddingVertical: 32 }]}>
            {tab === "ACTIVE" ? "Nu ai nicio provocare activă." : "Nicio provocare finalizată încă."}
          </Text>
        ) : null}

        {list.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.icon}><Ionicons name={c.icon} size={22} color="#fff" /></View>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={styles.title}>{c.title}</Text>
                <Text variant="bodySmall" style={styles.muted}>
                  {c.status === "DONE" ? "Finalizată" : `Ziua ${c.day}/${c.total}`}
                </Text>
              </View>
              {c.status === "DONE" ? <Ionicons name="checkmark-circle" size={24} color={colors.accent} /> : null}
            </View>
            <View style={styles.track} accessibilityLabel={`Progres ${c.day} din ${c.total}`}>
              <View style={[styles.fill, { width: `${((c.day ?? 0) / (c.total ?? 1)) * 100}%` as DimensionValue }]} />
            </View>
            {c.status === "ACTIVE" ? (
              <AppButton label="Am terminat" variant="outline" onPress={() => complete(c.id)} style={{ minHeight: 44 }} />
            ) : null}
          </View>
        ))}

        {tab === "ACTIVE" && upcoming.length > 0 ? (
          <View style={{ gap: 10, marginTop: 8 }}>
            <Text variant="titleMedium" style={styles.title}>Provocări viitoare</Text>
            {upcoming.map((c) => (
              <View key={c.id} style={[styles.card, styles.cardTop]}>
                <View style={[styles.icon, { backgroundColor: colors.sage }]}><Ionicons name={c.icon} size={22} color={colors.ink} /></View>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={styles.title}>{c.title}</Text>
                  <Text variant="bodySmall" style={styles.muted}>{c.dates}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 12, gap: 12 },
  title: { fontWeight: "700", color: colors.ink },
  muted: { color: colors.muted },
  tabs: { flexDirection: "row", gap: 8, marginHorizontal: 20, padding: 4, borderRadius: radius.pill, backgroundColor: colors.mist },
  tab: { flex: 1, height: 38, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  tabOn: { backgroundColor: colors.primary },
  tabText: { color: colors.ink },
  tabTextOn: { color: "#fff", fontWeight: "700" },
  card: { gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.mist, overflow: "hidden" },
  fill: { height: 8, backgroundColor: colors.accent },
});