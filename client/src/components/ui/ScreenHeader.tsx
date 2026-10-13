import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";

type Props = { title: string; icon?: "arrow-back" | "close"; right?: ReactNode; onBack?: () => void };

// Antet comun pentru paginile care nu sunt tab-uri: buton înapoi/închide + titlu.
export default function ScreenHeader({ title, icon = "arrow-back", right, onBack }: Props) {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={icon === "close" ? "Închide" : "Înapoi"}
        hitSlop={12}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/(tabs)")))}
      >
        <Ionicons name={icon} size={24} color={colors.ink} />
      </Pressable>
      <Text variant="headlineSmall" style={styles.title}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { flex: 1, fontWeight: "800", color: colors.ink },
});