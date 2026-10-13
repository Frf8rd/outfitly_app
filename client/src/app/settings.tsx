import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { colors, radius } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import TextField from "@/components/ui/TextField";
import { disableReminder, enableReminder, isReminderEnabled, REMINDER_TIME, remindersSupported } from "@/services/notifications";
import { authErrorMessage, changePassword, deleteAccount as removeAccount, logout as signOut, updateName } from "@/services/auth";
import { useAuthStore } from "@/store/auth";
import { validateName, validateNewPassword } from "@/utils/validation";

export default function Settings() {
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(user?.name ?? "");
  const [nameTouched, setNameTouched] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [passSubmitted, setPassSubmitted] = useState(false);
  const [notifications, setNotifications] = useState(false);
  // conturile create cu Google nu au parolă: nu cerem „parola actuală”
  const hasPassword = user?.hasPassword !== false;

  useEffect(() => {
    isReminderEnabled().then(setNotifications);
  }, []);

  async function toggleNotifications(on: boolean) {
    if (!remindersSupported) {
      Alert.alert("Indisponibil aici", "Notificările locale nu funcționează în Expo Go pe Android. Folosește un build de dezvoltare sau `eas build --profile preview`.");
      return;
    }
    if (!on) {
      setNotifications(false);
      await disableReminder();
      return;
    }
    const ok = await enableReminder();
    setNotifications(ok);
    if (!ok) Alert.alert("Notificările sunt oprite", "Permite notificările din setările telefonului ca să primești ținuta zilei.");
  }

  const nameError = nameTouched ? validateName(name) : undefined;
  const currentError = hasPassword && passSubmitted && !current ? "Introdu parola actuală." : undefined;
  const nextError = passSubmitted ? validateNewPassword(next) : undefined;

  async function saveName() {
    setNameTouched(true);
    if (validateName(name)) return;
    try {
      await updateName(name.trim());
      Alert.alert("Salvat", "Numele a fost actualizat.");
    } catch (e) {
      Alert.alert("Eroare", authErrorMessage(e));
    }
  }

  async function savePassword() {
    setPassSubmitted(true);
    if ((hasPassword && !current) || validateNewPassword(next)) return;
    try {
      await changePassword(hasPassword ? current : undefined, next);
      Alert.alert("Salvat", hasPassword ? "Parola a fost schimbată." : "Parola a fost setată.");
      setCurrent("");
      setNext("");
      setPassSubmitted(false);
    } catch (e) {
      Alert.alert("Eroare", authErrorMessage(e));
    }
  }

  function logout() {
    Alert.alert("Te deconectezi?", undefined, [
      { text: "Anulează", style: "cancel" },
      {
        text: "Deconectează-mă",
        onPress: () => signOut(), // gardul de rute din _layout te duce singur la /welcome
      },
    ]);
  }

  function deleteAccount() {
    Alert.alert(
      "Ștergi contul?",
      "Toate hainele și ținutele tale vor fi șterse definitiv. Nu se poate anula.",
      [
        { text: "Anulează", style: "cancel" },
        {
          text: "Șterge definitiv",
          style: "destructive",
          onPress: () => {
            removeAccount().catch((e) => Alert.alert("Eroare", authErrorMessage(e)));
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Setări" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text variant="titleMedium" style={styles.section}>Contul meu</Text>
            <TextField
              label="Nume"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              onBlur={() => setNameTouched(true)}
              error={nameError}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <AppButton label="Salvează numele" variant="outline" onPress={saveName} />
          </View>

          <View style={styles.card}>
            <Text variant="titleMedium" style={styles.section}>{hasPassword ? "Schimbă parola" : "Setează o parolă"}</Text>
            {hasPassword ? (
            <TextField
              label="Parola actuală"
              icon="lock-closed-outline"
              secure
              value={current}
              onChangeText={setCurrent}
              error={currentError}
              autoCapitalize="none"
              autoComplete="current-password"
            />
            ) : (
              <Text variant="bodySmall" style={styles.muted}>Te-ai înregistrat cu Google. Poți seta o parolă ca să te conectezi și cu email.</Text>
            )}
            <TextField
              label="Parola nouă"
              icon="lock-closed-outline"
              secure
              hint="Cel puțin 8 caractere, cu litere și cifre."
              value={next}
              onChangeText={setNext}
              error={nextError}
              autoCapitalize="none"
              autoComplete="new-password"
            />
            <AppButton label={hasPassword ? "Schimbă parola" : "Setează parola"} variant="outline" onPress={savePassword} />
          </View>

          <View style={[styles.card, styles.switchRow]}>
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={styles.switchLabel}>Notificări</Text>
              <Text variant="bodySmall" style={styles.muted}>„Ținuta ta de azi e gata” în fiecare dimineață la {REMINDER_TIME}</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ true: colors.accent, false: colors.mist }}
              thumbColor="#fff"
              accessibilityLabel="Notificări"
            />
          </View>

          <AppButton label="Deconectare" icon="log-out-outline" onPress={logout} />
          <AppButton label="Șterge contul" variant="outline" style={styles.danger} onPress={deleteAccount} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16 },
  card: { gap: 14, padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.mist },
  section: { fontWeight: "700", color: colors.ink },
  muted: { color: colors.muted },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  switchLabel: { color: colors.ink, fontWeight: "700" },
  danger: { borderColor: colors.danger },
});