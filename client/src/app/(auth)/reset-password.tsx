import { useRef, useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import AuthShell from "@/components/auth/AuthShell";
import FormError from "@/components/auth/FormError";
import AppButton from "@/components/ui/AppButton";
import TextField from "@/components/ui/TextField";
import { authErrorMessage, resetPassword } from "@/services/auth";
import { validateNewPassword } from "@/utils/validation";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email = "" } = useLocalSearchParams<{ email?: string }>();
  const passwordRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const codeError = submitted && !/^\d{6}$/.test(code) ? "Codul are 6 cifre." : undefined;
  const passError = submitted ? validateNewPassword(password) : undefined;

  async function onSubmit() {
    setSubmitted(true);
    if (!/^\d{6}$/.test(code) || validateNewPassword(password)) return;
    setLoading(true);
    setFormError(null);
    try {
      await resetPassword(email, code, password);
      router.replace("/login"); // utilizatorul se autentifică cu parola nouă
    } catch (e) {
      setFormError(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Parolă nouă" subtitle={`Introdu codul trimis la ${email}`} footer={<Text style={styles.muted}> </Text>}>
      <TextField
        label="Cod din email"
        icon="keypad-outline"
        placeholder="6 cifre"
        value={code}
        onChangeText={(v) => { setCode(v.replace(/\D/g, "").slice(0, 6)); setFormError(null); }}
        error={codeError}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        label="Parolă nouă"
        icon="lock-closed-outline"
        placeholder="Minim 8 caractere"
        hint="Cel puțin 8 caractere, cu litere și cifre."
        secure
        inputRef={passwordRef}
        value={password}
        onChangeText={(v) => { setPassword(v); setFormError(null); }}
        error={passError}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      <FormError message={formError} />
      <AppButton label="Schimbă parola" onPress={onSubmit} loading={loading} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({ muted: { color: colors.muted } });
