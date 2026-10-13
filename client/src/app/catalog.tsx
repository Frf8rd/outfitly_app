import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import CategoryChips, { CATEGORY_EMOJI, CategoryFilter } from "@/components/wardrobe/CategoryChips";
import type { OutfitPiece } from "@/types/models";

type CatalogItem = OutfitPiece & { owned: boolean };

// ---- DATE MOCK: se înlocuiesc cu useCatalog() (GET /catalog) ----
const MOCK: CatalogItem[] = [
  { id: "1", name: "Tricou alb", category: "TOP", owned: true },
  { id: "2", name: "Blugi largi", category: "BOTTOM", owned: true },
  { id: "3", name: "Rochie florală", category: "DRESS", owned: false },
  { id: "4", name: "Jachetă denim", category: "OUTERWEAR", owned: false },
  { id: "5", name: "Pulover verde", category: "TOP", owned: false },
  { id: "6", name: "Fustă neagră", category: "BOTTOM", owned: false },
  { id: "7", name: "Sneakers albi", category: "SHOES", owned: false },
  { id: "8", name: "Geantă bej", category: "ACCESSORY", owned: false },
];
// ------------------------------------------------------------------

export default function Catalog() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryFilter>("ALL");
  const [selected, setSelected] = useState<string[]>([]);

  const q = query.trim().toLowerCase();
  const data = MOCK.filter(
    (i) => (filter === "ALL" || i.category === filter) && (!q || i.name.toLowerCase().includes(q))
  );

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  function addSelected() {
    // TODO: POST /wardrobe/bulk { catalogItemIds: selected }
    Alert.alert("Adăugat", `${selected.length} articole au fost adăugate în garderobă.`);
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Înapoi" hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <Text variant="headlineSmall" style={styles.title}>Catalog de haine</Text>
      </View>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Caută articole..."
          placeholderTextColor="#8A958F"
          accessibilityLabel="Caută articole"
          returnKeyType="search"
          style={styles.searchInput}
        />
        {query ? (
          <Pressable hitSlop={10} accessibilityLabel="Șterge căutarea" onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <CategoryChips value={filter} onChange={setFilter} />

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          const source = item.image ?? (item.imageUrl ? { uri: item.imageUrl } : undefined);
          return (
            <Pressable
              disabled={item.owned}
              onPress={() => toggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected || item.owned, disabled: item.owned }}
              accessibilityLabel={item.owned ? `${item.name}, deja în garderobă` : item.name}
              style={[styles.card, isSelected && styles.cardSelected, item.owned && { opacity: 0.6 }]}
            >
              <View style={[styles.check, (isSelected || item.owned) && styles.checkOn]}>
                {isSelected || item.owned ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
              </View>
              <View style={styles.imageWrap}>
                {source ? (
                  <Image source={source} style={styles.image} contentFit="contain" />
                ) : (
                  <Text style={styles.emoji}>{CATEGORY_EMOJI[item.category]}</Text>
                )}
              </View>
              <Text variant="labelLarge" style={styles.name} numberOfLines={1}>{item.name}</Text>
              {item.owned ? <Text variant="labelSmall" style={styles.muted}>În garderobă</Text> : null}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text variant="titleMedium" style={styles.title}>Niciun rezultat</Text>
            <Text variant="bodyMedium" style={styles.muted}>Încearcă alt cuvânt sau altă categorie.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <AppButton
          label={selected.length ? `Adaugă ${selected.length} în garderobă` : "Alege articole"}
          icon="add"
          disabled={selected.length === 0}
          onPress={addSelected}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontWeight: "800", color: colors.ink },
  muted: { color: colors.muted },
  search: { flexDirection: "row", alignItems: "center", gap: 10, height: 48, marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  searchInput: { flex: 1, fontSize: 16, color: colors.ink, paddingVertical: 0 },
  list: { paddingHorizontal: 20, paddingBottom: 100, flexGrow: 1 },
  row: { gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.mist, padding: 10, gap: 6, alignItems: "center" },
  cardSelected: { borderColor: colors.primary },
  check: { position: "absolute", top: 10, right: 10, zIndex: 1, width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.mist, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  imageWrap: { alignSelf: "stretch", aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  emoji: { fontSize: 56 },
  name: { color: colors.ink },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 60 },
  emptyEmoji: { fontSize: 48 },
  footer: { position: "absolute", left: 20, right: 20, bottom: 16 },
});