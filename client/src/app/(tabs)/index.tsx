import { useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Chip, Text } from "react-native-paper";
import { colors } from "@/constants/theme";

const OCCASIONS = ["Școală", "Întâlnire", "Petrecere", "Vacanță"];

export default function HomeScreen() {
  const [occasion, setOccasion] = useState("Școală");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Salut */}
        <Text variant="headlineMedium" style={styles.title}>
          Salut! 👋
        </Text>
        <Text variant="bodyMedium">Stilul tău, regulile tale!</Text>

        {/* Vremea (date fixe deocamdată) */}
        <Card mode="contained" style={styles.card}>
          <Card.Content style={styles.row}>
            <Text style={styles.bigEmoji}>🌤️</Text>
            <View>
              <Text variant="titleMedium">18°C, parțial noros</Text>
              <Text variant="bodySmall">Ia o jachetă ușoară</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Ocazie */}
        <Text variant="titleMedium" style={styles.section}>
          Pentru ce ocazie?
        </Text>
        <View style={styles.chips}>
          {OCCASIONS.map((o) => (
            <Chip
              key={o}
              selected={occasion === o}
              onPress={() => setOccasion(o)}
            >
              {o}
            </Chip>
          ))}
        </View>

        {/* Ținuta zilei */}
        <Text variant="titleMedium" style={styles.section}>
          Ținuta zilei
        </Text>
        <Card mode="contained" style={styles.card}>
          <Card.Content>
            <Text style={styles.outfitEmoji}>👚 👖 👟</Text>
            <Text variant="bodyMedium">
              Bluză + blugi + adidași, potrivit pentru: {occasion}
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button icon="heart-outline">Salvează</Button>
          </Card.Actions>
        </Card>

        {/* Surprinde-mă */}
        <Button
          mode="contained"
          icon="auto-fix"
          style={styles.surprise}
          onPress={() => console.log("Surprinde-mă!")}
        >
          Surprinde-mă!
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 12 },
  title: { fontWeight: "700", color: colors.text },
  card: { backgroundColor: colors.lavender },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  bigEmoji: { fontSize: 38 },
  section: { marginTop: 8, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  outfitEmoji: { fontSize: 42, textAlign: "center", marginVertical: 8 },
  surprise: { marginTop: 8, paddingVertical: 4 },
});