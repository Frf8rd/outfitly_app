import { Pressable, ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { colors, radius } from "@/constants/theme";
import type { Occasion } from "@/types/models";

export const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: "EVERYDAY", label: "Zilnic" },
  { value: "SCHOOL", label: "Școală" },
  { value: "WORK", label: "Serviciu" },
  { value: "DATE", label: "Întâlnire" },
  { value: "PARTY", label: "Petrecere" },
  { value: "VACATION", label: "Vacanță" },
];

type Props = { value: Occasion; onChange: (o: Occasion) => void };

export default function OccasionPicker({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {OCCASIONS.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text variant="labelLarge" style={[styles.text, active && styles.textActive]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 20 },
  chip: { paddingHorizontal: 16, height: 38, borderRadius: radius.pill, justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.ink },
  textActive: { color: "#FFFFFF", fontWeight: "700" },
});