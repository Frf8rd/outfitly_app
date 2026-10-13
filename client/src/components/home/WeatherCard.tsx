import { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";
import type { Weather } from "@/types/models";

type IconName = ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<Weather["condition"], IconName> = {
  clear: "sunny",
  cloudy: "partly-sunny",
  rain: "rainy",
  snow: "snow",
};

export default function WeatherCard({ weather }: { weather: Weather }) {
  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${weather.temperature} grade, ${weather.summary}, ${weather.city}`}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={ICONS[weather.condition]} size={30} color={colors.accent} />
      </View>

      <View style={styles.temp}>
        <Text variant="headlineSmall" style={styles.degrees}>
          {Math.round(weather.temperature)}°C
        </Text>
        <Text variant="bodyMedium" style={styles.summary}>
          {weather.summary}
        </Text>
      </View>

      <View style={styles.city}>
        <Ionicons name="location-outline" size={18} color={colors.primary} />
        <Text variant="labelLarge" style={styles.cityText}>
          {weather.city}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  temp: { flex: 1 },
  degrees: { fontWeight: "800", color: colors.ink },
  summary: { color: colors.muted },
  city: { alignItems: "center", gap: 2 },
  cityText: { color: colors.ink },
});