import { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import TextField from "@/components/ui/TextField";
import OccasionPicker from "@/components/home/OccasionPicker";
import CategoryChips, { CATEGORY_EMOJI, CategoryFilter } from "@/components/wardrobe/CategoryChips";
import ErrorState, { errorMessage } from "@/components/ui/ErrorState";
import Loading from "@/components/ui/Loading";
import { useCreateOutfit, useOutfit, useUpdateOutfit } from "@/hooks/useOutfits";
import { useWardrobe } from "@/hooks/useWardrobe";
import { toPiece } from "@/services/wardrobe";
import type { Occasion } from "@/types/models";

export default function CreateOutfit() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>(); // cu id = modul editare
  const editing = !!id;
  const wardrobe = useWardrobe();
  const existing = useOutfit(id);
  const create = useCreateOutfit();
  const update = useUpdateOutfit();
  const saving = create.isPending || update.isPending;
  const pieces = useMemo(() => (wardrobe.data ?? []).map(toPiece), [wardrobe.data]);
  const [filter, setFilter] = useState<CategoryFilter>("ALL");
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState<Occasion>("EVERYDAY");
  const [submitted, setSubmitted] = useState(false);

  // la editare, completăm formularul o singură dată cu datele ținutei
  useEffect(() => {
    const o = existing.data;
    if (!o) return;
    setName(o.name);
    setOccasion(o.occasion);
    setSelected(o.items.map((w) => w.id));
  }, [existing.data]);

  const items = filter === "ALL" ? pieces : pieces.filter((i) => i.category === filter);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const nameError = !name.trim() ? "Dă un nume ținutei." : name.trim().length < 2 ? "Numele e prea scurt." : undefined;
  const itemsError = selected.length < 2 ? "Alege cel puțin 2 articole." : undefined;

  function save() {
    setSubmitted(true);
    if (nameError || itemsError) return;
    const body = { name: name.trim(), occasion, wardrobeItemIds: selected };
    const done = {
      onSuccess: () => {
        Alert.alert("Salvat", `Ținuta „${body.name}” a fost salvată.`);
        router.back();
      },
      onError: (e: unknown) => Alert.alert("Eroare", errorMessage(e)),
    };
    if (editing) update.mutate({ id, ...body }, done);
    else create.mutate(body, done);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={editing ? "Editează ținuta" : "Creator de ținute"} icon="close" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.pad}>
            <Text variant="titleMedium" style={styles.title}>{editing ? "Editează ținuta" : "Creează o ținută"}</Text>
            <Text variant="bodyMedium" style={styles.muted}>Alege articole din garderoba ta ({selected.length} alese)</Text>
          </View>

          <CategoryChips value={filter} onChange={setFilter} />

          {wardrobe.isPending || (editing && existing.isPending) ? (
            <Loading />
          ) : wardrobe.error && !wardrobe.data ? (
            <ErrorState error={wardrobe.error} onRetry={() => wardrobe.refetch()} />
          ) : pieces.length === 0 ? (
            <View style={[styles.pad, { gap: 12, alignItems: "center" }]}>
              <Text variant="bodyMedium" style={styles.muted}>Garderoba ta e goală. Adaugă mai întâi haine din catalog.</Text>
              <AppButton label="Deschide catalogul" onPress={() => router.push("/catalog")} />
            </View>
          ) : (
          <View style={styles.grid}>
            {items.map((item) => {
              const on = selected.includes(item.id);
              const source = item.imageUrl ? { uri: item.imageUrl } : undefined;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={item.name}
                  onPress={() => toggle(item.id)}
                  style={[styles.tile, on && styles.tileOn]}
                >
                  {source ? (
                    <Image source={source} style={styles.image} contentFit="contain" />
                  ) : (
                    <Text style={styles.emoji}>{CATEGORY_EMOJI[item.category]}</Text>
                  )}
                  <View style={[styles.badge, on && styles.badgeOn]}>
                    <Ionicons name={on ? "checkmark" : "add"} size={14} color={on ? "#fff" : colors.primary} />
                  </View>
                </Pressable>
              );
            })}
          </View>
          )}
          {submitted && itemsError ? <Text variant="bodySmall" style={[styles.error, styles.pad]}>{itemsError}</Text> : null}

          <View style={[styles.pad, { gap: 16 }]}>
            <TextField
              label="Nume ținută"
              icon="pricetag-outline"
              placeholder="Ex: Casual de weekend"
              value={name}
              onChangeText={setName}
              error={submitted ? nameError : undefined}
              returnKeyType="done"
            />
            <Text variant="labelLarge" style={styles.label}>Ocazie</Text>
          </View>
          <OccasionPicker value={occasion} onChange={setOccasion} />

          <View style={styles.pad}>
            <AppButton label="Salvează ținuta" onPress={save} loading={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32, gap: 16 },
  pad: { paddingHorizontal: 20, gap: 4 },
  title: { fontWeight: "700", color: colors.ink },
  muted: { color: colors.muted },
  label: { color: colors.ink, fontWeight: "700", marginBottom: -8 },
  error: { color: colors.danger },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20 },
  tile: { width: "30.6%", aspectRatio: 1, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.mist, alignItems: "center", justifyContent: "center", padding: 8 },
  tileOn: { borderColor: colors.primary },
  image: { width: "100%", height: "100%" },
  emoji: { fontSize: 36 },
  badge: { position: "absolute", right: 6, bottom: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
  badgeOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});