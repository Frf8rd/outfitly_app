import { api, qs } from "@/services/api";
import type { Challenge, Stats, WearLog } from "@/types/models";

export const getStats = () => api<Stats>("/stats");

export const getWearLogs = (from: Date, to: Date) =>
  api<{ items: WearLog[] }>(`/wear-logs${qs({ from: from.toISOString(), to: to.toISOString() })}`).then((r) => r.items);

export const getChallenges = () => api<{ items: Challenge[] }>("/challenges/current").then((r) => r.items);
export const joinChallenge = (id: string) => api<Challenge>(`/challenges/${id}/join`, { method: "POST" });
export const completeChallenge = (id: string) => api<Challenge>(`/challenges/${id}/complete`, { method: "POST" });
