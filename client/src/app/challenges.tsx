import { useState } from "react";
import { Alert, DimensionValue, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AppButton from "@/components/ui/AppButton";
import ErrorState from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import { useChallenges, useCompleteChallenge, useJoinChallenge } from "@/hooks/useEngagement";
import { ApiError } from "@/services/api";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

const MONTHS = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];
function range(startsAt: string, endsAt: string) {
  const a = new Date(startsAt);
  const b = new Date(endsAt);
  const same = a.getUTCMonth() === b.getUTCMonth();
  return `${a.getUTCDate()}${same ? "" : ` ${MONTHS[a.getUTCMonth()]}`} – ${b.getUTCDate()} ${MONTHS[b.getUTCMonth()]}`;
}

export default function Challenges() {
  const [tab, setTab] = useState<"ACTIVE" | "DONE">("ACTIVE");
  const { data, isPending, error, refetch } = useChallenges();
  const join = useJoinChallenge();
  const complete = useCompleteChallenge();

  const items = data ?? [];
  // „Active” = cele începute: te-ai alăturat (ACTIVE) sau poți să te alături (AVAILABLE)
  const list = items.filter((c) => (tab === "ACTIVE" ? c.status === "ACTIVE" || c.status === "AVAILABLE" : c.status === "DONE"));
  const upcoming = items.filter((c) => c.status === "UPCOMING");

  const run = (fn: () => Promise<unknown>) =>
    fn().catch((e) => Alert.alert("Eroare", e instanceof ApiError ? e.message : "Nu am putut salva. Încearcă din nou."));

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

      {isPending ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {list.length === 0 ? (
            <Text variant="bodyMedium" style={[styles.muted, { textAlign: "center", paddingVertical: 32 }]}>
              {tab === "ACTIVE" ? "Nu ai nicio provocare activă." : "Nicio provocare finalizată încă."}
            </Text>
          ) : null}

          {list.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.icon}><Ionicons name={c.icon as IconName} size={22} color="#fff" /></View>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={styles.title}>{c.title}</Text>
                  <Text variant="bodySmall" style={styles.muted}>
                    {c.status === "DONE" ? "Finalizată" : c.status === "ACTIVE" ? `Ziua ${c.day}/${c.total}` : c.description}
                  </Text>
                </View>
                {c.status === "DONE" ? <Ionicons name="checkmark-circle" size={24} color={colors.accent} /> : null}
              </View>

              {c.status !== "AVAILABLE" ? (
                <View style={styles.track} accessibilityLabel={`Progres ${c.day} din ${c.total}`}>
                  <View style={[styles.fill, { width: `${(c.day / c.total) * 100}%` as DimensionValue }]} />
                </View>
              ) : null}

              {c.status === "AVAILABLE" ? (
                <AppButton label="Alătură-te" loading={join.isPending && join.variables === c.id} onPress={() => run(() => join.mutateAsync(c.id))} style={{ minHeight: 44 }} />
              ) : null}
              {c.status === "ACTIVE" ? (
                <AppButton label="Am terminat" variant="outline" loading={complete.isPending && complete.variables === c.id} onPress={() => run(() => complete.mutateAsync(c.id))} style={{ minHeight: 44 }} />
              ) : null}
            </View>
          ))}

          {tab === "ACTIVE" && upcoming.length > 0 ? (
            <View style={{ gap: 10, marginTop: 8 }}>
              <Text variant="titleMedium" style={styles.title}>Provocări viitoare</Text>
              {upcoming.map((c) => (
                <View key={c.id} style={[styles.card, styles.cardTop]}>
                  <View style={[styles.icon, { backgroundColor: colors.sage }]}><Ionicons name={c.icon as IconName} size={22} color={colors.ink} /></View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleSmall" style={styles.title}>{c.title}</Text>
                    <Text variant="bodySmall" style={styles.muted}>{range(c.startsAt, c.endsAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
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