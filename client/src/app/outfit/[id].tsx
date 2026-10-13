import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import OutfitPreview from "@/components/outfit/OutfitPreview";
import ErrorState, { errorMessage } from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import { useDeleteOutfit, useOutfit, useUpdateOutfit, useWearOutfit } from "@/hooks/useOutfits";
import { ApiError } from "@/services/api";
import { toSaved } from "@/services/outfits";
import { OCCASIONS } from "@/components/home/OccasionPicker";
import { CATEGORY_EMOJI, CATEGORY_FILTERS } from "@/components/wardrobe/CategoryChips";

export default function OutfitDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isPending, error, refetch } = useOutfit(id);
  const update = useUpdateOutfit();
  const del = useDeleteOutfit();
  const wear = useWearOutfit();
  const outfit = useMemo(() => (data ? toSaved(data) : undefined), [data]);
  const [worn, setWorn] = useState(false);

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Ținută" />
        <Loading />
      </SafeAreaView>
    );
  }

  if (error && !(error instanceof ApiError && error.status === 404)) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Ținută" />
        <ErrorState error={error} onRetry={() => refetch()} />
      </SafeAreaView>
    );
  }

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
        onPress: () =>
          del.mutate(id, {
            onSuccess: () => router.back(),
            onError: (e) => Alert.alert("Eroare", errorMessage(e)),
          }),
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
          onToggleFavorite={() =>
            update.mutate({ id, isFavorite: !outfit.isFavorite }, { onError: (e) => Alert.alert("Eroare", errorMessage(e)) })
          }
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
          loading={wear.isPending}
          onPress={() => wear.mutate(id, { onSuccess: () => setWorn(true), onError: (e) => Alert.alert("Eroare", errorMessage(e)) })}
        />
        <AppButton label="Editează" variant="outline" icon="create-outline" onPress={() => router.push({ pathname: "/outfit/create", params: { id } })} />
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