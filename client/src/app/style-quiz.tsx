import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius } from "@/constants/theme";
import AppButton from "@/components/ui/AppButton";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { saveStyleQuiz } from "@/services/users";
import { useAuthStore } from "@/store/auth";

type Style = "CASUAL" | "SPORT" | "ELEGANT" | "STREETWEAR" | "COQUETTE";

const RESULTS: Record<Style, { label: string; emoji: string; text: string }> = {
  CASUAL: { label: "Casual", emoji: "👖", text: "Comod, simplu și mereu pregătită pentru orice zi. Blugii și tricourile sunt prietenii tăi." },
  SPORT: { label: "Sport", emoji: "👟", text: "Practic și plin de energie. Ție îți place să te miști liber, în orice ținută." },
  ELEGANT: { label: "Elegant", emoji: "🧥", text: "Linii curate, culori neutre și piese clasice care arată bine oricând." },
  STREETWEAR: { label: "Streetwear", emoji: "🧢", text: "Oversize, atitudine și combinații îndrăznețe. Stilul tău nu seamănă cu al nimănui." },
  COQUETTE: { label: "Coquette", emoji: "🎀", text: "Delicat și romantic: fundițe, pastelate și detalii dulci." },
};

const QUESTIONS: { q: string; options: { t: string; s: Style }[] }[] = [
  { q: "Ce porți cel mai des?", options: [
    { t: "Blugi și tricou", s: "CASUAL" }, { t: "Trening și adidași", s: "SPORT" }, { t: "Cămașă și pantaloni eleganți", s: "ELEGANT" },
    { t: "Hanorac oversize", s: "STREETWEAR" }, { t: "Rochie cu volănașe", s: "COQUETTE" } ] },
  { q: "Încălțămintea ta preferată?", options: [
    { t: "Sneakers albi", s: "CASUAL" }, { t: "Adidași de alergare", s: "SPORT" }, { t: "Pantofi clasici", s: "ELEGANT" },
    { t: "Sneakers voluminoși", s: "STREETWEAR" }, { t: "Balerini cu fundiță", s: "COQUETTE" } ] },
  { q: "Ce culori alegi?", options: [
    { t: "Albastru, alb, nuanțe calde", s: "CASUAL" }, { t: "Negru și culori vii", s: "SPORT" }, { t: "Negru, alb, bej", s: "ELEGANT" },
    { t: "Kaki, gri, negru", s: "STREETWEAR" }, { t: "Roz, crem, pastelate", s: "COQUETTE" } ] },
  { q: "Cum arată weekendul ideal?", options: [
    { t: "O plimbare prin oraș", s: "CASUAL" }, { t: "Sală sau alergare", s: "SPORT" }, { t: "Cină la un restaurant", s: "ELEGANT" },
    { t: "Concert sau skatepark", s: "STREETWEAR" }, { t: "Picnic în parc", s: "COQUETTE" } ] },
  { q: "Accesoriul tău preferat?", options: [
    { t: "Un rucsac simplu", s: "CASUAL" }, { t: "O brățară fitness", s: "SPORT" }, { t: "O poșetă clasică", s: "ELEGANT" },
    { t: "Șapcă și lanțuri", s: "STREETWEAR" }, { t: "Fundițe și perle", s: "COQUETTE" } ] },
];

export default function StyleQuiz() {
  const router = useRouter();
  const { first } = useLocalSearchParams<{ first?: string }>(); // first=1: deschis automat după înregistrare
  const hadStyle = useRef(!!useAuthStore.getState().user?.mainStyle);
  const [step, setStep] = useState(-1); // -1 = început, 0..n-1 = întrebări, n = rezultat
  const [answers, setAnswers] = useState<Style[]>([]);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Gard „doar o dată”: fluxul de după înregistrare nu mai arată testul dacă stilul e deja salvat
  // (ex: revii la ecran după ce l-ai făcut). Din Profil testul se poate reface oricând.
  useEffect(() => {
    if (first && hadStyle.current) router.replace("/(tabs)");
  }, [first, router]);

  const total = QUESTIONS.length;
  const goHome = () => router.replace("/(tabs)");

  async function submit(list: Style[]) {
    setSave("saving");
    try {
      await saveStyleQuiz(list); // serverul calculează și salvează stilul principal
      setSave("saved");
      return true;
    } catch {
      setSave("error");
      return false;
    }
  }

  function answer(s: Style) {
    const next = [...answers.slice(0, step), s];
    setAnswers(next);
    setStep(step + 1);
    if (next.length === total) void submit(next);
  }

  async function onContinue() {
    if (save === "error" && !(await submit(answers))) {
      Alert.alert("Nu am putut salva stilul", "Poți reface testul oricând din Profil.", [{ text: "Continuă", onPress: goHome }]);
      return;
    }
    goHome();
  }

  function back() {
    if (step <= -1 || step === total) return goHome();
    setStep(step - 1);
  }

  // Cel mai frecvent stil; la egalitate câștigă primul întâlnit.
  const winner = (() => {
    const counts = answers.reduce<Record<string, number>>((a, s) => ({ ...a, [s]: (a[s] ?? 0) + 1 }), {});
    return (Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] ?? "CASUAL") as Style;
  })();

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={step === -1 ? "Test de stil" : step === total ? "Rezultat" : `Întrebarea ${step + 1} din ${total}`} onBack={back} />

      {step >= 0 && step < total ? (
        <View style={styles.progress} accessibilityLabel={`Progres ${step + 1} din ${total}`}>
          <View style={[styles.bar, { width: `${((step + 1) / total) * 100}%` }]} />
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === -1 && (
          <View style={styles.center}>
            <View style={styles.circle}><Text style={styles.big}>✨</Text></View>
            <Text variant="headlineSmall" style={styles.title}>Care este stilul tău?</Text>
            <Text variant="bodyLarge" style={[styles.muted, styles.centerText]}>
              Răspunde la {total} întrebări și află ce stil ți se potrivește cel mai bine.
            </Text>
            <AppButton label="Începe testul" onPress={() => setStep(0)} style={styles.full} />
            <Pressable accessibilityRole="button" hitSlop={10} onPress={goHome}>
              <Text variant="labelLarge" style={styles.muted}>Sari peste</Text>
            </Pressable>
          </View>
        )}

        {step >= 0 && step < total && (
          <View style={{ gap: 12 }}>
            <Text variant="headlineSmall" style={styles.title}>{QUESTIONS[step].q}</Text>
            {QUESTIONS[step].options.map((o) => (
              <Pressable
                key={o.t}
                accessibilityRole="button"
                onPress={() => answer(o.s)}
                style={({ pressed }) => [styles.option, pressed && { borderColor: colors.primary }]}
              >
                <Text variant="titleSmall" style={styles.optionText}>{o.t}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {step === total && (
          <View style={styles.center}>
            <View style={styles.circle}><Text style={styles.big}>{RESULTS[winner].emoji}</Text></View>
            <Text variant="bodyLarge" style={styles.muted}>Stilul tău principal este</Text>
            <Text variant="displaySmall" style={styles.title}>{RESULTS[winner].label}</Text>
            <Text variant="bodyLarge" style={[styles.muted, styles.centerText]}>{RESULTS[winner].text}</Text>
            {save === "error" ? (
              <Text variant="bodySmall" style={[styles.muted, styles.centerText]}>Nu s-a salvat încă. Apasă „Continuă” ca să reîncerc.</Text>
            ) : null}
            <AppButton label="Continuă" loading={save === "saving"} onPress={onContinue} style={styles.full} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 20, paddingTop: 12 },
  progress: { height: 6, marginHorizontal: 20, borderRadius: 3, backgroundColor: colors.mist, overflow: "hidden" },
  bar: { height: 6, backgroundColor: colors.accent },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingBottom: 40 },
  centerText: { textAlign: "center" },
  full: { alignSelf: "stretch" },
  title: { fontWeight: "800", color: colors.ink, textAlign: "center" },
  muted: { color: colors.muted },
  circle: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.sage, opacity: 0.9, alignItems: "center", justifyContent: "center" },
  big: { fontSize: 56 },
  option: { padding: 16, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.mist },
  optionText: { color: colors.ink },
});