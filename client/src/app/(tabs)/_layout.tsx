import { ComponentProps } from "react";
import { ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

const icon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Acasă", tabBarIcon: icon("home-outline") }} />
      <Tabs.Screen name="wardrobe" options={{ title: "Garderoba", tabBarIcon: icon("shirt-outline") }} />
      <Tabs.Screen name="outfits" options={{ title: "Ținute", tabBarIcon: icon("grid-outline") }} />
      <Tabs.Screen name="favorites" options={{ title: "Favorite", tabBarIcon: icon("heart-outline") }} />
    </Tabs>
  );
}