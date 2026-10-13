import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import type { ComponentProps } from "react";

// ---- DATE MOCK: se înlocuiesc cu GET /auth/me și GET /stats ----
const USER = { name: "Andreea", style: "Casual", clothes: 24, outfits: 8, unworn: 11 };
// -----------------------------------------------------------------

const STATS = [
  { label: "Haine", value: USER.clothes },
  { label: "Ținute", value: USER.outfits },
  { label: "Nepurtate (30 zile)", value: USER.unworn },
];

const ROWS: { icon: ComponentProps<typeof Ionicons>["name"]; label: string; sub: string; href: Href }[] = [
  { icon: "calendar-outline", label: "Jurnal", sub: "Ce ai purtat în fiecare zi", href: "/journal" },
  { icon: "trophy-outline", label: "Provocări", sub: "Provocările săptămânii", href: "/challenges" },
  { icon: "color-palette-outline", label: "Testul de stil", sub: "Descoperă-ți stilul", href: "/style-quiz" },
  { icon: "settings-outline", label: "Setări", sub: "Cont, notificări, deconectare", href: "/settings" },
];

export default function Profile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text variant="headlineMedium" style={styles.avatarText}>{USER.name[0]}</Text>
          </View>
          <Text variant="headlineSmall" style={styles.name}>{USER.name}</Text>
          <View style={styles.styleChip}>
            <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
            <Text variant="labelLarge" style={styles.styleText}>Stilul tău: {USER.style}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.stat} accessible accessibilityLabel={`${s.label}: ${s.value}`}>
              <Text variant="headlineSmall" style={styles.statValue}>{s.value}</Text>
              <Text variant="labelSmall" style={styles.muted} numberOfLines={2}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menu}>
          {ROWS.map((r, i) => (
            <Pressable
              key={r.label}
              accessibilityRole="button"
              onPress={() => router.push(r.href)}
              style={[styles.row, i > 0 && styles.rowBorder]}
            >
              <View style={styles.rowIcon}>
                <Ionicons name={r.icon} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={styles.rowLabel}>{r.label}</Text>
                <Text variant="bodySmall" style={styles.muted}>{r.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 20 },
  muted: { color: colors.muted },
  hero: { alignItems: "center", gap: 8, paddingTop: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.sage, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.ink, fontWeight: "800" },
  name: { fontWeight: "800", color: colors.ink },
  styleChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 30, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  styleText: { color: colors.primary, fontWeight: "700" },
  stats: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, alignItems: "center", gap: 2, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  statValue: { fontWeight: "800", color: colors.primary },
  menu: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.mist },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  rowLabel: { color: colors.ink, fontWeight: "700" },
});