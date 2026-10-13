import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";
import { CLOTHES } from "@/constants/clothes";
import AppButton from "@/components/ui/AppButton";
import OutfitPreview from "@/components/outfit/OutfitPreview";

const SHOWCASE = [
  { id: "1", name: "Pulover verde", category: "TOP", image: CLOTHES.pulover },
  { id: "2", name: "Pantaloni crem", category: "BOTTOM", image: CLOTHES.pantaloni },
  { id: "3", name: "Sneakers", category: "SHOES", image: CLOTHES.adidasi },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.skipRow}>
          <Pressable accessibilityRole="button" hitSlop={12} onPress={() => router.push("/login")}>
            <Text variant="labelLarge" style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.head}>
          <Text variant="headlineLarge" style={styles.title}>Bine ai venit la Stilora!</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Descoperă ținute perfecte din hainele pe care le ai deja.
          </Text>
        </View>

        <OutfitPreview items={[...SHOWCASE]} isFavorite={false} />

        <View style={styles.actions}>
          <AppButton label="Începe" onPress={() => router.push("/register")} />
          <View style={styles.footerRow}>
            <Text variant="bodyMedium" style={styles.muted}>Ai deja cont? </Text>
            <Pressable accessibilityRole="link" onPress={() => router.push("/login")} hitSlop={8}>
              <Text variant="bodyMedium" style={styles.link}>Autentificare</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, gap: 24 },
  skipRow: { alignItems: "flex-end" },
  skip: { color: colors.muted },
  head: { gap: 8, alignItems: "center" },
  title: { fontWeight: "800", color: colors.ink, textAlign: "center" },
  subtitle: { color: colors.muted, textAlign: "center" },
  actions: { gap: 16, marginTop: "auto" },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  link: { color: colors.primary, fontWeight: "700" },
  muted: { color: colors.muted },
});