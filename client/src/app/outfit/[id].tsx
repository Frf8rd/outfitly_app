import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import { MOCK_OUTFITS } from "@/constants/mock";
import AppButton from "@/components/ui/AppButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import OutfitPreview from "@/components/outfit/OutfitPreview";
import { OCCASIONS } from "@/components/home/OccasionPicker";
import { CATEGORY_EMOJI, CATEGORY_FILTERS } from "@/components/wardrobe/CategoryChips";

export default function OutfitDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // TODO: GET /outfits/:id
  const [outfit, setOutfit] = useState(() => MOCK_OUTFITS.find((o) => o.id === id));
  const [worn, setWorn] = useState(false);

  if (!outfit) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Ținută" />
        <View style={styles.empty}>
          <Text style={styles.emoji}>🤷</Text>
          <Text variant="titleMedium" style={styles.title}>Nu am găsit ținuta</Text>
          <AppButton label="Înapoi" onPress={() => router.back()} style={{ alignSelf: "stretch" }} />
        </View>
      </SafeAreaView>
    );
  }

  const occasion = OCCASIONS.find((o) => o.value === outfit.occasion)?.label;

  function confirmDelete() {
    Alert.alert("Ștergi ținuta?", outfit?.name, [
      { text: "Anulează", style: "cancel" },
      {
        text: "Șterge",
        style: "destructive",
        onPress: () => {
          // TODO: DELETE /outfits/:id
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={outfit.name} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OutfitPreview
          items={outfit.items}
          isFavorite={outfit.isFavorite}
          onToggleFavorite={() => setOutfit({ ...outfit, isFavorite: !outfit.isFavorite })} // TODO: PATCH /outfits/:id
        />

        <Text variant="bodyMedium" style={styles.muted}>Ocazie: {occasion}</Text>

        <View style={styles.list}>
          {outfit.items.map((p, i) => (
            <View key={p.id} style={[styles.row, i > 0 && styles.rowBorder]}>
              <Text style={styles.rowEmoji}>{CATEGORY_EMOJI[p.category]}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={styles.title}>{p.name}</Text>
                <Text variant="bodySmall" style={styles.muted}>{CATEGORY_FILTERS.find((f) => f.value === p.category)?.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <AppButton
          label={worn ? "Marcată ca purtată azi" : "Am purtat-o azi"}
          icon={worn ? "checkmark" : "shirt-outline"}
          disabled={worn}
          onPress={() => setWorn(true)} // TODO: POST /outfits/:id/wear
        />
        <AppButton label="Editează" variant="outline" icon="create-outline" onPress={() => router.push("/outfit/create")} />
        <AppButton label="Șterge ținuta" variant="outline" style={styles.danger} onPress={confirmDelete} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 4, gap: 14 },
  title: { fontWeight: "700", color: colors.ink },
  muted: { color: colors.muted },
  emoji: { fontSize: 48 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  list: { borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.mist },
  rowEmoji: { fontSize: 28 },
  danger: { borderColor: colors.danger },
});