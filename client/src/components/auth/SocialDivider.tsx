import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "@/constants/theme";

export default function SocialDivider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text variant="bodySmall" style={styles.text}>sau</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.mist },
  text: { color: colors.muted },
});	