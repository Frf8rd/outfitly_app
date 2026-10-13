import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import { ApiError } from "@/services/api";

type Props = {
  error?: unknown; // excepția de la useQuery; din ea se alege mesajul
  onRetry?: () => void;
};

// Mesaj prietenos pentru orice eroare de la server. ApiError are deja textul în română.
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "A apărut o eroare. Încearcă din nou.";
}

export default function ErrorState({ error, onRetry }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.emoji}>😕</Text>
      <Text variant="titleMedium" style={styles.title}>
        Ceva n-a mers
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {errorMessage(error)}
      </Text>
      {onRetry ? <AppButton label="Reîncearcă" icon="refresh" onPress={onRetry} style={styles.action} /> : null}
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
