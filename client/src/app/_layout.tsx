import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { theme } from "@/constants/theme";

// Deocamdată aplicația pornește în (auth). Când avem token salvat, aici se pune
// protecția rutelor (Stack.Protected) și se pornește direct în (tabs) dacă ești logat.
export const unstable_settings = { initialRouteName: "(auth)" };

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}