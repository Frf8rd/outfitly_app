import { Pressable, ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { colors, radius } from "@/constants/theme";
import type { Category } from "@/types/models";

export type CategoryFilter = Category | "ALL";

export const CATEGORY_FILTERS: { label: string; value: CategoryFilter }[] = [
  { label: "Toate", value: "ALL" },
  { label: "Topuri", value: "TOP" },
  { label: "Pantaloni", value: "BOTTOM" },
  { label: "Rochii", value: "DRESS" },
  { label: "Jachete", value: "OUTERWEAR" },
  { label: "Încălțăminte", value: "SHOES" },
  { label: "Accesorii", value: "ACCESSORY" },
];

export const CATEGORY_EMOJI: Record<Category, string> = {
  TOP: "👚", BOTTOM: "👖", DRESS: "👗", OUTERWEAR: "🧥", SHOES: "👟", ACCESSORY: "👜",
};

type Props = { value: CategoryFilter; onChange: (v: CategoryFilter) => void };

// Filtrele pe categorii, folosite în Garderobă și în Catalog.
export default function CategoryChips({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {CATEGORY_FILTERS.map((f) => {
        const active = f.value === value;
        return (
          <Pressable
            key={f.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(f.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text variant="labelLarge" style={[styles.text, active && styles.textActive]}>{f.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 20, paddingBottom: 12 },
  chip: { paddingHorizontal: 16, height: 38, borderRadius: radius.pill, justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.ink },
  textActive: { color: "#fff", fontWeight: "700" },
});