import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as SecureStore from "expo-secure-store";

type NotificationsModule = typeof import("expo-notifications");

// Notificare locală zilnică „Ținuta ta de azi e gata”. Nu are nevoie de server; pe web nu există.
const PREF_KEY = "stilora.dailyReminder";
const REMINDER_ID = "daily-outfit";
const HOUR = 8;
const MINUTE = 0;

// În Expo Go pe Android, simplul import al lui expo-notifications aruncă eroare (din SDK 53) și strică toată aplicația.
// De aceea îl încărcăm doar la nevoie și doar unde merge (build de dezvoltare/preview/producție, iOS, Android nativ).
// Expo Go = executionEnvironment "storeClient" (sau appOwnership "expo", pe versiunile vechi).
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient || Constants.appOwnership === "expo";
export const remindersSupported = Platform.OS !== "web" && !(Platform.OS === "android" && isExpoGo);

let cached: NotificationsModule | null | undefined;
function notifications(): NotificationsModule | null {
  if (cached !== undefined) return cached;
  cached = null;
  if (!remindersSupported) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("expo-notifications") as NotificationsModule;
    mod.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });
    cached = mod;
  } catch {
    cached = null;
  }
  return cached;
}

// Tap pe notificare -> callback. Întoarce funcția de dezabonare.
export function onNotificationTap(cb: () => void): () => void {
  const N = notifications();
  if (!N) return () => {};
  const sub = N.addNotificationResponseReceivedListener(() => cb());
  return () => sub.remove();
}

async function setPref(on: boolean) {
  try {
    if (Platform.OS === "web") localStorage.setItem(PREF_KEY, on ? "1" : "0");
    else await SecureStore.setItemAsync(PREF_KEY, on ? "1" : "0");
  } catch {}
}

export async function isReminderEnabled(): Promise<boolean> {
  try {
    const v = Platform.OS === "web" ? localStorage.getItem(PREF_KEY) : await SecureStore.getItemAsync(PREF_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

// true = programată; false = utilizatorul a refuzat permisiunea (sau platforma nu o suportă)
export async function enableReminder(): Promise<boolean> {
  const Notifications = notifications();
  if (!Notifications) return false;
  let perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily", { name: "Ținuta zilei", importance: Notifications.AndroidImportance.DEFAULT });
  }
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: { title: "Ținuta ta de azi e gata ✨", body: "Vezi ce ți-am pregătit pentru astăzi.", data: { url: "/today" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: HOUR, minute: MINUTE, channelId: "daily" },
  });
  await setPref(true);
  return true;
}

export async function disableReminder(): Promise<void> {
  await notifications()?.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await setPref(false);
}

export const REMINDER_TIME = `${String(HOUR).padStart(2, "0")}:${String(MINUTE).padStart(2, "0")}`; 