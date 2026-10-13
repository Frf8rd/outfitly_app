import { MOCK_AUTH } from "@/constants/config";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import type { Style } from "@/types/models";

// Trimite răspunsurile la server (el calculează și salvează stilul principal) și actualizează utilizatorul din aplicație.
export async function saveStyleQuiz(answers: Style[]): Promise<Style | null> {
  if (MOCK_AUTH) return null;
  const res = await api<{ user: { mainStyle: Style | null } }>("/users/me/style-quiz", { method: "PUT", body: { answers } });
  useAuthStore.getState().updateUser({ mainStyle: res.user.mainStyle });
  return res.user.mainStyle;
}
