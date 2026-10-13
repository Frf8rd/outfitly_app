import { useMemo } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import OutfitCard from "@/components/outfit/OutfitCard";
import ErrorState, { errorMessage } from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import { useOutfits, useUpdateOutfit } from "@/hooks/useOutfits";
import { toSaved } from "@/services/outfits";


export default function Favorites() {
  const router = useRouter();
  const { data, isPending, error, refetch } = useOutfits({ favorite: true });
  const update = useUpdateOutfit();
  const outfits = useMemo(() => (data ?? []).map(toSaved), [data]);

  // Apăsând pe inimă, ținuta iese din favorite (și din listă).
  const removeFavorite = (id: string) =>
    update.mutate({ id, isFavorite: false }, { onError: (e) => Alert.alert("Eroare", errorMessage(e)) });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Favorite</Text>
        <Text variant="bodyMedium" style={styles.muted}>{outfits.length} ținute preferate</Text>
      </View>

      {isPending ? (
        <Loading />
      ) : error && !data ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
      <FlatList
        data={outfits}
        keyExtractor={(o) => o.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OutfitCard
            outfit={item}
            onPress={() => router.push(`/outfit/${item.id}`)}
            onToggleFavorite={() => removeFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤍</Text>
            <Text variant="titleMedium" style={styles.title}>Nicio ținută favorită</Text>
            <Text variant="bodyMedium" style={[styles.muted, { textAlign: "center" }]}>
              Apasă inima de pe o ținută ca s-o găsești rapid aici.
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
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontWeight: "800", color: colors.ink },
  muted: { color: colors.muted },
  list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
  row: { gap: 12, marginBottom: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 60, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48 },
});