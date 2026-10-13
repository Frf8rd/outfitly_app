import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";

type Props = { title: string; subtitle: string; children: ReactNode; footer: ReactNode };

// Structura comună pentru login și register: săgeată înapoi, titlu, formular, link jos.
export default function AuthShell({ title, subtitle, children, footer }: Props) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Înapoi"
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/welcome"))}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>

          <View style={styles.head}>
            <Text variant="headlineMedium" style={styles.title}>{title}</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.form}>{children}</View>

          <View style={styles.footer}>{footer}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 24 },
  back: { width: 40, height: 40, justifyContent: "center" },
  head: { gap: 6 },
  title: { fontWeight: "800", color: colors.ink },
  subtitle: { color: colors.muted },
  form: { gap: 16 },
  footer: { marginTop: "auto", alignItems: "center", paddingTop: 8 },
});