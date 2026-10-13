import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import AuthShell from "@/components/auth/AuthShell";
import FormError from "@/components/auth/FormError";
import GoogleButton from "@/components/auth/GoogleButton";
import SocialDivider from "@/components/auth/SocialDivider";
import AppButton from "@/components/ui/AppButton";
import TextField from "@/components/ui/TextField";
import { authErrorMessage, login, signInWithGoogle } from "@/services/auth";
import { validateEmail, validateLoginPassword } from "@/utils/validation";

type Field = "email" | "password";

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);

  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [loading, setLoading] = useState<"form" | "google" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const errors = {
    email: validateEmail(values.email),
    password: validateLoginPassword(values.password),
  };
  const shown = (f: Field) => (touched[f] ? errors[f] : undefined);
  const set = (f: Field) => (v: string) => {
    setValues((s) => ({ ...s, [f]: v }));
    setFormError(null);
  };
  const blur = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  async function onSubmit() {
    setTouched({ email: true, password: true });
    if (errors.email || errors.password) return;

    setLoading("form");
    setFormError(null);
    try {
      await login(values.email.trim().toLowerCase(), values.password);
      router.replace("/(tabs)");
    } catch (e) {
      setFormError(authErrorMessage(e));
    } finally {
      setLoading(null);
    }
  }

  async function onGoogle() {
    setLoading("google");
    setFormError(null);
    try {
      await signInWithGoogle();
      router.replace("/(tabs)");
    } catch (e) {
      setFormError(authErrorMessage(e));
    } finally {
      setLoading(null);
    }
  }

  return (
    <AuthShell
      title="Autentificare"
      subtitle="Conectează-te pentru a continua"
      footer={
        <View style={styles.footerRow}>
          <Text variant="bodyMedium" style={styles.muted}>Nu ai cont? </Text>
          <Pressable accessibilityRole="link" onPress={() => router.replace("/register")} hitSlop={8}>
            <Text variant="bodyMedium" style={styles.link}>Înregistrează-te</Text>
          </Pressable>
        </View>
      }
    >
      <TextField
        label="Email"
        icon="mail-outline"
        placeholder="ex: nume@exemplu.com"
        value={values.email}
        onChangeText={set("email")}
        onBlur={blur("email")}
        error={shown("email")}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <View style={{ gap: 8 }}>
        <TextField
          label="Parolă"
          icon="lock-closed-outline"
          placeholder="Introdu parola"
          secure
          inputRef={passwordRef}
          value={values.password}
          onChangeText={set("password")}
          onBlur={blur("password")}
          error={shown("password")}
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        <Pressable
          accessibilityRole="link"
          hitSlop={8}
          style={styles.forgot}
          onPress={() => Alert.alert("Resetare parolă", "Această funcție va fi disponibilă în curând.")}
        >
          <Text variant="labelLarge" style={styles.link}>Ai uitat parola?</Text>
        </Pressable>
      </View>

      <FormError message={formError} />

      <AppButton label="Conectează-te" onPress={onSubmit} loading={loading === "form"} disabled={loading === "google"} />
      <SocialDivider />
      <GoogleButton onPress={onGoogle} loading={loading === "google"} disabled={loading === "form"} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: "flex-end" },
  link: { color: colors.primary, fontWeight: "700" },
  muted: { color: colors.muted },
  footerRow: { flexDirection: "row", alignItems: "center" },
});