import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "@/constants/theme";

type Props = { label?: string };

export default function Loading({ label }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={label ?? "Se încarcă"}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? (
        <Text variant="bodyMedium" style={styles.label}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 60 },
  label: { color: colors.muted },
});
