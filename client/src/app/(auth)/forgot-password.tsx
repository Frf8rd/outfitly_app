import { useState } from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import AuthShell from "@/components/auth/AuthShell";
import FormError from "@/components/auth/FormError";
import AppButton from "@/components/ui/AppButton";
import TextField from "@/components/ui/TextField";
import { authErrorMessage, forgotPassword } from "@/services/auth";
import { validateEmail } from "@/utils/validation";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const error = touched ? validateEmail(email) : undefined;

  async function onSubmit() {
    setTouched(true);
    if (validateEmail(email)) return;
    setLoading(true);
    setFormError(null);
    try {
      const clean = email.trim().toLowerCase();
      await forgotPassword(clean);
      router.push({ pathname: "/reset-password", params: { email: clean } });
    } catch (e) {
      setFormError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Ai uitat parola?" subtitle="Îți trimitem un cod de resetare pe email" footer={<Text style={styles.muted}> </Text>}>
      <TextField
        label="Email"
        icon="mail-outline"
        placeholder="ex: nume@exemplu.com"
        value={email}
        onChangeText={(v) => { setEmail(v); setFormError(null); }}
        onBlur={() => setTouched(true)}
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      <FormError message={formError} />
      <AppButton label="Trimite codul" onPress={onSubmit} loading={loading} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({ muted: { color: colors.muted } });
