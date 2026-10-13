import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeChallenge, getChallenges, getStats, getWearLogs, joinChallenge } from "@/services/stats";

export const useStats = () => useQuery({ queryKey: ["stats"], queryFn: getStats });

export const useWearLogs = (from: Date, to: Date) =>
  useQuery({ queryKey: ["wearlogs", from.toISOString(), to.toISOString()], queryFn: () => getWearLogs(from, to) });

export const useChallenges = () => useQuery({ queryKey: ["challenges"], queryFn: getChallenges });

function useRefreshChallenges() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["challenges"] });
}
export const useJoinChallenge = () => useMutation({ mutationFn: joinChallenge, onSuccess: useRefreshChallenges() });
export const useCompleteChallenge = () => useMutation({ mutationFn: completeChallenge, onSuccess: useRefreshChallenges() });
