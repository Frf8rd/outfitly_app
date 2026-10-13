import { ComponentProps } from "react";
import { ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

const icon =
  (outline: IconName, filled: IconName) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? filled : outline} color={color} size={size} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.mist,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Acasă", tabBarIcon: icon("home-outline", "home") }} />
      <Tabs.Screen name="wardrobe" options={{ title: "Garderobă", tabBarIcon: icon("shirt-outline", "shirt") }} />
      <Tabs.Screen name="outfits" options={{ title: "Ținute", tabBarIcon: icon("star-outline", "star") }} />
      <Tabs.Screen name="favorites" options={{ title: "Favorite", tabBarIcon: icon("heart-outline", "heart") }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: icon("person-outline", "person") }} />
    </Tabs>
  );
}