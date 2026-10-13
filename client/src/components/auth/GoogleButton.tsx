import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";

type Props = { onPress: () => void; loading?: boolean; disabled?: boolean };

export default function GoogleButton({ onPress, loading, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continuă cu Google"
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, (pressed || disabled) && { opacity: 0.8 }]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color={colors.ink} />
            <Text variant="titleSmall" style={styles.text}>Continuă cu Google</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.mist,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  text: { color: colors.ink, fontWeight: "700" },
});