import axios from "axios";

// Cliente axios centralizado para todas las llamadas al backend
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ============================================
// INTERFACES
// ============================================

export interface Checkin {
  checkin_id: number;
  emotion: string;
  note: string | null;
  shared_anonymously: boolean;
  created_at: string;
  tags: string | null;
}

export interface NewCheckin {
  userId: number;
  emotionName: string;
  note?: string;
  sharedAnonymously?: boolean;
  influences?: string[];
}

export interface Journal {
  entry_id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NewJournal {
  userId: number;
  title: string;
  content: string;
}

// Representa al usuario autenticado, con los campos reales de la tabla users
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  accountType: "personal" | "professional";
  isOnboarded?: boolean;
  cedula?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password_hash: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface FeedCheckin {
  checkin_id: number;
  emotion: string;
  note: string | null;
  created_at: string;
}

export interface InsightTag {
  tag_id: number;
  name: string;
}

export interface NewInsight {
  checkinId: number;
  professionalId: number;
  tagId: number | null;
  content: string;
}

export interface ResponseInsight {
  insight_id: number;
  content: string;
  created_at: string;
  tag_name: string | null;
  checkin_note: string | null;
  checkin_created_at: string;
  checkin_emotion: string;
}

export interface ProfessionalProfile {
  user_id: number;
  professional_cedula: string;
  institution_name: string | null;
  primary_specialty: string | null;
  verification_status: "pending" | "active";
  verification_date: string | null;
}

export interface NewProfessionalProfile {
  userId: number;
  cedula: string;
  institutionName?: string;
  primarySpecialty?: string;
}

// ============================================
// AUTH & USERS API
// ============================================

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<{ user: User }> => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const registerUser = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  const { data } = await api.post("/auth/register", credentials);
  return data;
};

// ============================================
// CHECKINS API
// ============================================

export const getCheckins = async (userId: number): Promise<Checkin[]> => {
  const { data } = await api.get("/checkins", { params: { userId } });
  return data;
};

export const createCheckin = async (
  checkin: NewCheckin,
): Promise<{ checkinId: number }> => {
  const { data } = await api.post("/checkins", checkin);
  return data;
};

// ============================================
// JOURNAL API
// ============================================

export const getJournals = async (userId: number): Promise<Journal[]> => {
  const { data } = await api.get("/journal", { params: { user_id: userId } });
  return data;
};

export const createJournal = async (journal: {
  user_id: number;
  title: string;
  content: string;
}): Promise<{ success: boolean; entry: Journal; entry_id: number }> => {
  const { data } = await api.post("/journal", journal);
  return data;
};

export const updateJournal = async (
  entry_id: number,
  journal: { title?: string; content?: string },
): Promise<{ success: boolean; entry: Journal }> => {
  const { data } = await api.put(`/journal/${entry_id}`, journal);
  return data;
};

export const deleteJournal = async (
  entry_id: number,
): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/journal/${entry_id}`);
  return data;
};

// ============================================
// INSIGHTS API
// ============================================

export const getInsights = async (params: {
  user_id?: number;
  professional_id?: number;
}) => {
  const { data } = await api.get("/insights", { params });
  return data;
};

export const createInsight = async (
  insight: NewInsight,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ success: boolean; insight: any; insight_id: number }> => {
  const payload = {
    checkin_id: insight.checkinId,
    professional_id: insight.professionalId,
    tag_id: insight.tagId,
    content: insight.content,
  };
  const { data } = await api.post("/insights", payload);
  return data;
};

export const deleteInsight = async (
  insight_id: number,
): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/insights/${insight_id}`);
  return data;
};

export const markInsightAsRead = async (
  insight_id: number,
): Promise<{ success: boolean }> => {
  const { data } = await api.put(`/insights/${insight_id}`, { is_read: true });
  return data;
};

// ============================================
// PORTAL & PROFESSIONAL API
// ============================================

export const getFeed = async (): Promise<{
  checkins: FeedCheckin[];
  tags: InsightTag[];
}> => {
  const { data } = await api.get("/portal/feed");
  return data;
};

export const submitInsight = async (
  insight: NewInsight,
): Promise<{ insightId: number }> => {
  const { data } = await api.post("/portal/feed", insight);
  return data;
};

export const getResponses = async (
  professionalId: number,
): Promise<ResponseInsight[]> => {
  const { data } = await api.get("/portal/responses", {
    params: { professionalId },
  });
  return data;
};

export const getProfessionalProfile = async (
  userId: number,
): Promise<ProfessionalProfile | null> => {
  const { data } = await api.get("/portal/verify", { params: { userId } });
  return data.profile;
};

export const submitProfessionalProfile = async (
  profile: NewProfessionalProfile,
): Promise<ProfessionalProfile> => {
  const { data } = await api.post("/portal/verify", profile);
  return data.profile;
};

export default api;
