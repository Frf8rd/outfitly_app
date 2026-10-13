import { Pressable, StyleSheet, View, DimensionValue } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { colors, radius } from "@/constants/theme";
import type { Category, OutfitPiece } from "@/types/models";

// Fiecare categorie are un "loc" în colaj (procente din card), ca în design:
// top mare stânga-sus, pantaloni înalți dreapta, încălțăminte jos-stânga.
type Slot = { left: DimensionValue; top: DimensionValue; width: DimensionValue; height: DimensionValue };

const SLOTS: Record<Category, Slot> = {
  TOP: { left: "4%", top: "6%", width: "50%", height: "46%" },
  OUTERWEAR: { left: "4%", top: "6%", width: "50%", height: "46%" },
  BOTTOM: { left: "52%", top: "6%", width: "44%", height: "80%" },
  DRESS: { left: "22%", top: "4%", width: "56%", height: "70%" },
  SHOES: { left: "6%", top: "58%", width: "42%", height: "30%" },
  ACCESSORY: { left: "56%", top: "66%", width: "30%", height: "24%" },
};

const EMOJI: Record<Category, string> = {
  TOP: "👚", BOTTOM: "👖", DRESS: "👗", OUTERWEAR: "🧥", SHOES: "👟", ACCESSORY: "👜",
};

type Props = {
  items: OutfitPiece[];
  isFavorite: boolean;
  onToggleFavorite?: () => void;
};

export default function OutfitPreview({ items, isFavorite, onToggleFavorite }: Props) {
  // dacă există un TOP, jacheta nu mai primește același loc (evită suprapunerea)
  const hasTop = items.some((i) => i.category === "TOP");
  const visible = items.filter((i) => !(i.category === "OUTERWEAR" && hasTop));

  return (
    <View style={styles.card}>
      <View style={styles.blob} />

      <View style={styles.collage}>
        {visible.map((item) => {
          const source = item.image ?? (item.imageUrl ? { uri: item.imageUrl } : undefined);
          return (
            <View
              key={item.id}
              style={[styles.slot, SLOTS[item.category]]}
              accessible
              accessibilityLabel={item.name}
            >
              {source ? (
                <Image source={source} style={styles.image} contentFit="contain" />
              ) : (
                <Text style={styles.emoji}>{EMOJI[item.category]}</Text>
              )}
            </View>
          );
        })}
      </View>

      {onToggleFavorite ? (
      <Pressable
        onPress={onToggleFavorite}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? "Scoate din favorite" : "Adaugă la favorite"}
        style={styles.heart}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={20}
          color={isFavorite ? colors.primary : colors.muted}
        />
      </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.mist,
    overflow: "hidden",
    height: 340,
  },
  blob: {
    position: "absolute",
    left: "8%",
    top: "10%",
    width: "84%",
    height: "78%",
    borderRadius: 120,
    backgroundColor: colors.sage,
    opacity: 0.3,
    transform: [{ rotate: "-8deg" }],
  },
  collage: { flex: 1 },
  slot: { position: "absolute", alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  emoji: { fontSize: 72 },
  heart: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.mist,
  },
});