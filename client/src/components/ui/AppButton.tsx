import { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "filled" | "outline";
  icon?: ComponentProps<typeof Ionicons>["name"];
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function AppButton({ label, onPress, variant = "filled", icon, loading, disabled, style }: Props) {
  const filled = variant === "filled";
  const fg = filled ? "#FFFFFF" : colors.primary;
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        filled ? styles.filled : styles.outline,
        (pressed || disabled) && { opacity: 0.8 },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
            <Text variant="titleSmall" style={{ color: fg, fontWeight: "700" }}>
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  filled: { backgroundColor: colors.primary },
  outline: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});