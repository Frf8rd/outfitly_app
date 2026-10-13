import { ComponentProps, Ref, useState } from "react";
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  secure?: boolean; // câmp de parolă cu buton „arată/ascunde"
  inputRef?: Ref<TextInput>;
} & Pick<
  TextInputProps,
  "placeholder" | "keyboardType" | "autoCapitalize" | "autoComplete" | "textContentType" | "returnKeyType" | "onSubmitEditing"
>;

export default function TextField({
  label, value, onChangeText, onBlur, error, hint, icon, secure, inputRef, ...input
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrap}>
      <Text variant="labelLarge" style={styles.label}>{label}</Text>

      <View style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError]}>
        <Ionicons name={icon} size={20} color={error ? colors.danger : colors.muted} />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          secureTextEntry={secure && hidden}
          placeholderTextColor="#8A958F"
          autoCorrect={false}
          accessibilityLabel={label}
          style={styles.input}
          {...input}
        />
        {secure ? (
          <Pressable
            hitSlop={10}
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Arată parola" : "Ascunde parola"}
          >
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text variant="bodySmall" style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
      ) : hint ? (
        <Text variant="bodySmall" style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: colors.ink, fontWeight: "700" },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.mist,
  },
  fieldFocused: { borderColor: colors.primary },
  fieldError: { borderColor: colors.danger },
  input: { flex: 1, fontSize: 16, color: colors.ink, paddingVertical: 0 },
  error: { color: colors.danger },
  hint: { color: colors.muted },
});