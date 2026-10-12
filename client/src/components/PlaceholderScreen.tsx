import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";

export default function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text variant="headlineMedium">{title}</Text>
    </SafeAreaView>
  );
}