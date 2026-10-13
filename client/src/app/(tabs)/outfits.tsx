import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { OCCASIONS } from "@/components/home/OccasionPicker";
import OutfitCard from "@/components/outfit/OutfitCard";
import ErrorState, { errorMessage } from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import { useOutfits, useUpdateOutfit } from "@/hooks/useOutfits";
import { toSaved } from "@/services/outfits";
import type { Occasion } from "@/types/models";


export default function Outfits() {
  const router = useRouter();
  const { data, isPending, error, refetch } = useOutfits();
  const update = useUpdateOutfit();
  const outfits = useMemo(() => (data ?? []).map(toSaved), [data]);
  const [occasion, setOccasion] = useState<Occasion | "ALL">("ALL");

  const shown = occasion === "ALL" ? outfits : outfits.filter((o) => o.occasion === occasion);
  const filters = [{ value: "ALL" as const, label: "Toate" }, ...OCCASIONS];

  const toggleFavorite = (id: string, isFavorite: boolean) =>
    update.mutate({ id, isFavorite: !isFavorite }, { onError: (e) => Alert.alert("Eroare", errorMessage(e)) });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={styles.title}>Ținutele mele</Text>
          <Text variant="bodyMedium" style={styles.muted}>{outfits.length} ținute salvate</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Creează o ținută"
          onPress={() => router.push("/outfit/create")}
          style={styles.add}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {filters.map((f) => {
            const active = f.value === occasion;
            return (
              <Pressable
                key={f.value}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setOccasion(f.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text variant="labelLarge" style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isPending ? (
        <Loading />
      ) : error && !data ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
      <FlatList
        data={shown}
        keyExtractor={(o) => o.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OutfitCard
            outfit={item}
            onPress={() => router.push(`/outfit/${item.id}`)}
            onToggleFavorite={() => toggleFavorite(item.id, item.isFavorite)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text variant="titleMedium" style={styles.title}>
              {outfits.length === 0 ? "Nicio ținută încă" : "Nicio ținută pentru ocazia asta"}
            </Text>
            <Text variant="bodyMedium" style={[styles.muted, { textAlign: "center" }]}>
              Apasă + ca să-ți creezi prima ținută din garderoba ta.
            </Text>
          </View>
        }
      />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontWeight: "800", color: colors.ink },
  muted: { color: colors.muted },
  add: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  chips: { gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  chip: { paddingHorizontal: 16, height: 38, borderRadius: radius.pill, justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.ink },
  chipTextActive: { color: "#fff", fontWeight: "700" },
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  row: { gap: 12, marginBottom: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 60, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48 },
});