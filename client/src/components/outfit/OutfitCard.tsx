import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";
import { OCCASIONS } from "@/components/home/OccasionPicker";
import { CATEGORY_EMOJI } from "@/components/wardrobe/CategoryChips";
import type { OutfitSuggestion } from "@/types/models";

export type SavedOutfit = OutfitSuggestion & { id: string };

type Props = { outfit: SavedOutfit; onPress?: () => void; onToggleFavorite?: () => void };

// Card mic de ținută (colaj 2x2 + nume + ocazie + ❤️), folosit în Ținute și Favorite.
export default function OutfitCard({ outfit, onPress, onToggleFavorite }: Props) {
  const occasion = OCCASIONS.find((o) => o.value === outfit.occasion)?.label ?? "";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${outfit.name}, ${occasion}`}
      style={styles.card}
    >
      <View style={styles.preview}>
        {outfit.items.slice(0, 4).map((item) => {
          const source = item.image ?? (item.imageUrl ? { uri: item.imageUrl } : undefined);
          return (
            <View key={item.id} style={styles.tile}>
              {source ? (
                <Image source={source} style={styles.image} contentFit="contain" />
              ) : (
                <Text style={styles.emoji}>{CATEGORY_EMOJI[item.category]}</Text>
              )}
            </View>
          );
        })}

        <Pressable
          hitSlop={10}
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityLabel={outfit.isFavorite ? "Scoate din favorite" : "Adaugă la favorite"}
          style={styles.heart}
        >
          <Ionicons
            name={outfit.isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={outfit.isFavorite ? colors.primary : colors.muted}
          />
        </Pressable>
      </View>

      <Text variant="labelLarge" style={styles.name} numberOfLines={1}>{outfit.name}</Text>
      <Text variant="bodySmall" style={styles.muted}>{occasion}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.mist, padding: 10, gap: 2 },
  preview: { aspectRatio: 1, borderRadius: radius.sm, backgroundColor: colors.background, flexDirection: "row", flexWrap: "wrap", alignContent: "center", justifyContent: "center", padding: 6, marginBottom: 6 },
  tile: { width: "50%", aspectRatio: 1, alignItems: "center", justifyContent: "center", padding: 4 },
  image: { width: "100%", height: "100%" },
  emoji: { fontSize: 30 },
  heart: { position: "absolute", top: 6, right: 6, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.mist },
  name: { color: colors.ink },
  muted: { color: colors.muted },
});