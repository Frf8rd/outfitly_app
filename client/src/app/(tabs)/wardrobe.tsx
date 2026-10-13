import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "react-native-paper";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import CategoryChips, { CATEGORY_EMOJI, CategoryFilter } from "@/components/wardrobe/CategoryChips";
import ErrorState, { errorMessage } from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import { useRemoveFromWardrobe, useWardrobe } from "@/hooks/useWardrobe";
import { toPiece } from "@/services/wardrobe";
import type { OutfitPiece } from "@/types/models";

export default function Wardrobe() {
  const router = useRouter();
  const { data, isPending, error, refetch } = useWardrobe();
  const remove = useRemoveFromWardrobe();
  const items = useMemo(() => (data ?? []).map(toPiece), [data]);
  const [filter, setFilter] = useState<CategoryFilter>("ALL");

  const shown = filter === "ALL" ? items : items.filter((i) => i.category === filter);
  const goToCatalog = () => router.push("/catalog");

  const confirmRemove = (item: OutfitPiece) =>
    Alert.alert("Scoți din garderobă?", item.name, [
      { text: "Anulează", style: "cancel" },
      {
        text: "Scoate",
        style: "destructive",
        onPress: () => remove.mutate(item.id, { onError: (e) => Alert.alert("Eroare", errorMessage(e)) }),
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Garderoba mea</Text>
        <Text variant="bodyMedium" style={styles.muted}>{items.length} articole</Text>
      </View>

      <CategoryChips value={filter} onChange={setFilter} />

      {isPending ? (
        <Loading />
      ) : error && !data ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
      <FlatList
        data={shown}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const source = item.image ?? (item.imageUrl ? { uri: item.imageUrl } : undefined);
          return (
            <Pressable
              style={styles.card}
              onLongPress={() => confirmRemove(item)}
              accessibilityLabel={`${item.name}. Ține apăsat pentru a scoate din garderobă.`}
            >
              <View style={styles.badge}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
              <View style={styles.imageWrap}>
                {source ? (
                  <Image source={source} style={styles.image} contentFit="contain" />
                ) : (
                  <Text style={styles.emoji}>{CATEGORY_EMOJI[item.category]}</Text>
                )}
              </View>
              <Text variant="labelLarge" style={styles.name} numberOfLines={1}>{item.name}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🧺</Text>
            <Text variant="titleMedium" style={styles.title}>
              {items.length === 0 ? "Garderoba e goală" : "Nimic în categoria asta"}
            </Text>
            <Text variant="bodyMedium" style={[styles.muted, { textAlign: "center" }]}>
              Adaugă haine din catalog ca să-ți putem sugera ținute.
            </Text>
          </View>
        }
      />
      )}

      <View style={styles.footer}>
        <AppButton label="Adaugă haine din catalog" icon="add" onPress={goToCatalog} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontWeight: "800", color: colors.ink },
  muted: { color: colors.muted },
  list: { paddingHorizontal: 20, paddingBottom: 100, flexGrow: 1 },
  row: { gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.mist, padding: 10, gap: 8 },
  badge: { position: "absolute", top: 10, right: 10, zIndex: 1, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  imageWrap: { aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  emoji: { fontSize: 56 },
  name: { color: colors.ink, textAlign: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 60, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 56 },
  footer: { position: "absolute", left: 20, right: 20, bottom: 16 },
});