import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";

export default function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
      <Text variant="bodyMedium" style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: "row", gap: 8, alignItems: "flex-start", padding: 12, borderRadius: radius.md, backgroundColor: "#FBEAE7" },
  text: { flex: 1, color: colors.danger },
});