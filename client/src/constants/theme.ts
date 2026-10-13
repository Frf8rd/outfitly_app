import { MD3LightTheme } from "react-native-paper";

// Paleta Stilora (din design): 1F2421 · 216869 · 49A078 · 9CC5A1 · DCE1DE
export const colors = {
  ink: "#1F2421",        // text principal, splash
  primary: "#216869",    // butoane, titluri accentuate, tab activ
  accent: "#49A078",     // verde mediu: iconițe, bifări, accente
  sage: "#9CC5A1",       // verde pal: pete decorative, chips selectate soft
  mist: "#DCE1DE",       // gri-verzui: borduri, fundaluri de carduri
  background: "#F4F7F5", // fundal ecrane (tentă foarte deschisă din mist)
  surface: "#FFFFFF",
  muted: "#5F6B65",      // text secundar
  danger: "#C0392B",
};

export const radius = { sm: 12, md: 16, lg: 24, pill: 999 };

export const theme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: "#FFFFFF",
    secondary: colors.accent,
    primaryContainer: colors.sage,
    onPrimaryContainer: colors.ink,
    secondaryContainer: colors.mist,
    onSecondaryContainer: colors.ink,
    background: colors.background,
    surface: colors.surface,
    onSurface: colors.ink,
    outline: colors.mist,
  },
};