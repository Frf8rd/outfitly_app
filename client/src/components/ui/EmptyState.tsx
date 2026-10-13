import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";

type Props = {
  emoji: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

// Lista e goală (ex. „Garderoba e goală"). Emoji-ul se potrivește cu restul aplicației (vezi wardrobe/outfits).
export default function EmptyState({ emoji, title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text variant="bodyMedium" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 60, paddingHorizontal: 24 },
  emoji: { fontSize: 48 },
  title: { fontWeight: "800", color: colors.ink, textAlign: "center" },
  message: { color: colors.muted, textAlign: "center" },
  action: { alignSelf: "stretch", marginTop: 8 },
});
