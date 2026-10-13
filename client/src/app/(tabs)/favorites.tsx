import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { MOCK_OUTFITS } from "@/constants/mock";
import OutfitCard from "@/components/outfit/OutfitCard";


export default function Favorites() {
  const router = useRouter();
  const [outfits, setOutfits] = useState(MOCK_OUTFITS.filter((o) => o.isFavorite)); // TODO: GET /outfits?favorite=true

  // Apăsând pe inimă, ținuta iese din favorite (și din listă).
  const removeFavorite = (id: string) => setOutfits((list) => list.filter((o) => o.id !== id)); // TODO: PATCH /outfits/:id

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Favorite</Text>
        <Text variant="bodyMedium" style={styles.muted}>{outfits.length} ținute preferate</Text>
      </View>

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