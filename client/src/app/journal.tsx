import { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import ErrorState from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import ScreenHeader from "@/components/ui/ScreenHeader";
import OutfitCard from "@/components/outfit/OutfitCard";
import { OCCASIONS } from "@/components/home/OccasionPicker";
import { useStats, useWearLogs } from "@/hooks/useEngagement";
import { useOutfits, useWearOutfit } from "@/hooks/useOutfits";
import { ApiError } from "@/services/api";
import { toSaved } from "@/services/outfits";

const LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

export default function Journal() {
  const router = useRouter();

  // săptămâna curentă, luni -> duminică, în ora telefonului
  const { days, from, to, todayIndex } = useMemo(() => {
    const today = new Date();
    const todayIndex = (today.getDay() + 6) % 7; // luni = 0
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayIndex);
    const days = LETTERS.map((letter, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      return { letter, date: d.getDate() };
    });
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);
    return { days, from: monday, to: sunday, todayIndex };
  }, []);

  const [selected, setSelected] = useState(todayIndex);
  const [showStats, setShowStats] = useState(false);
  const [picking, setPicking] = useState(false);

  const logs = useWearLogs(from, to);
  const stats = useStats();
  const outfits = useOutfits();
  const wear = useWearOutfit();

  // zi din săptămână (0 = luni) -> ținute purtate în acea zi
  const worn = useMemo(() => {
    const map: Record<number, NonNullable<typeof logs.data>> = {};
    for (const l of logs.data ?? []) {
      const d = new Date(l.wornOn);
      const idx = (d.getDay() + 6) % 7;
      (map[idx] ??= []).push(l);
    }
    return map;
  }, [logs.data]);

  const selectedLogs = worn[selected] ?? [];
  const daysWithOutfit = Object.keys(worn).length;

  async function mark(id: string) {
    try {
      await wear.mutateAsync(id);
      setPicking(false);
    } catch (e) {
      Alert.alert("Eroare", e instanceof ApiError ? e.message : "Nu am putut salva. Încearcă din nou.");
    }
  }

  function openPicker() {
    if (outfits.data && outfits.data.length === 0) {
      Alert.alert("Nu ai încă nicio ținută", "Creează o ținută, apoi o poți marca aici ca purtată.", [
        { text: "Mai târziu", style: "cancel" },
        { text: "Creează ținută", onPress: () => router.push("/outfit/create") },
      ]);
      return;
    }
    setPicking(true);
  }

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
                accessibilityLabel={`${d.date}${worn[i] ? ", ai purtat o ținută" : ""}`}
                onPress={() => setSelected(i)}
                style={styles.day}
              >
                <Text variant="labelMedium" style={styles.muted}>{d.letter}</Text>
                <View style={[styles.dateCircle, on && styles.dateCircleOn]}>
                  <Text variant="labelLarge" style={[styles.dateText, on && { color: "#fff", fontWeight: "700" }]}>{d.date}</Text>
                </View>
                <View style={[styles.dot, worn[i] ? { backgroundColor: colors.accent } : null]} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.rowBetween}>
          <Text variant="titleSmall" style={styles.title}>Ținute purtate</Text>
          <Text variant="labelLarge" style={styles.muted}>{daysWithOutfit} din 7 zile</Text>
        </View>

        {logs.isPending ? (
          <Loading />
        ) : logs.isError ? (
          <ErrorState error={logs.error} onRetry={() => logs.refetch()} />
        ) : selectedLogs.length > 0 ? (
          <View style={styles.grid}>
            {selectedLogs.map((l) => (
              <View key={l.id} style={styles.cell}>
                <OutfitCard outfit={toSaved(l.outfit)} onPress={() => router.push(`/outfit/${l.outfit.id}`)} />
              </View>
            ))}
          </View>
        ) : (
          <Text variant="bodyMedium" style={[styles.muted, { textAlign: "center", paddingVertical: 24 }]}>
            Nu ai marcat nicio ținută în ziua asta.
          </Text>
        )}

        {selected === todayIndex ? <AppButton label="Am purtat o ținută azi" icon="add" onPress={openPicker} /> : null}

        <AppButton
          label={showStats ? "Ascunde statisticile" : "Vezi statistici"}
          variant="outline"
          icon="stats-chart"
          onPress={() => setShowStats((s) => !s)}
        />

        {showStats ? (
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text variant="headlineSmall" style={styles.statValue}>{stats.data?.unwornCount ?? "–"}</Text>
              <Text variant="bodySmall" style={styles.muted}>haine nepurtate în ultimele 30 de zile</Text>
            </View>
            <View style={styles.stat}>
              <Text variant="headlineSmall" style={styles.statValue}>{stats.data?.outfitCount ?? "–"}</Text>
              <Text variant="bodySmall" style={styles.muted}>ținute noi făcute fără cumpărături</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={picking} transparent animationType="slide" onRequestClose={() => setPicking(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPicking(false)} accessibilityLabel="Închide">
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text variant="titleMedium" style={styles.title}>Ce ai purtat azi?</Text>
            {outfits.isPending ? (
              <Loading />
            ) : outfits.isError ? (
              <ErrorState error={outfits.error} onRetry={() => outfits.refetch()} />
            ) : (
              <FlatList
                data={outfits.data}
                keyExtractor={(o) => o.id}
                contentContainerStyle={{ gap: 8 }}
                renderItem={({ item }) => (
                  <Pressable accessibilityRole="button" disabled={wear.isPending} onPress={() => mark(item.id)} style={styles.pickRow}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleSmall" style={styles.title}>{item.name}</Text>
                      <Text variant="bodySmall" style={styles.muted}>
                        {OCCASIONS.find((o) => o.value === item.occasion)?.label} · {item.items.length} piese
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            )}
            <AppButton label="Anulează" variant="outline" onPress={() => setPicking(false)} />
          </Pressable>
        </Pressable>
      </Modal>
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
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { maxHeight: "70%", padding: 20, gap: 12, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, backgroundColor: colors.background },
  pickRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
});