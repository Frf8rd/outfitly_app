import { MD3LightTheme } from "react-native-paper";

export const colors = {
  primary: "#9B7EDE",    // lavandă / mov
  pink: "#F8C8DC",       // roz pastel
  lavender: "#E6DDFB",
  background: "#FFF9FC",
  text: "#3B2F4A",
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.pink,
    primaryContainer: colors.lavender,
    secondaryContainer: colors.pink,
    background: colors.background,
    surface: "#FFFFFF",
    onSurface: colors.text,
  },
};