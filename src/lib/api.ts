// lib/api.ts
import axios from "axios";

// Cliente axios centralizado para todas las llamadas al backend
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ============================================
// TIPOS
// ============================================

// --- Journal ---
export interface Journal {
  entry_id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NewJournal {
  user_id: number;
  title: string;
  content: string;
}

export interface UpdateJournal {
  entry_id: number;
  title?: string;
  content?: string;
}

// --- Checkins ---
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

// --- Insights ---
export interface Insight {
  insight_id: number;
  checkin_id: number;
  professional_id: number;
  tag_id: number | null;
  content: string;
  created_at: string;
  title?: string;
  preview?: string;
  category?: string;
  isRead?: boolean;
  isNew?: boolean;
  type?: "system" | "ai" | "psychologist";
}

export interface NewInsight {
  checkin_id: number;
  professional_id: number;
  tag_id?: number | null;
  content: string;
}

// Representa al usuario autenticado, con los campos reales de la tabla users
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  accountType: "personal" | "professional";
}

// Datos que se mandan al hacer login: email y password en texto plano
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

export const getCheckins = async (userId: number): Promise<Checkin[]> => {
  const { data } = await api.get("/checkins", { params: { userId } });
  return data;
};

export const getCheckinById = async (checkinId: number): Promise<Checkin> => {
  const { data } = await api.get(`/checkins/${checkinId}`);
  return data;
};

export const createCheckin = async (checkin: NewCheckin): Promise<{ checkinId: number }> => {
  const { data } = await api.post("/checkins", checkin);
  return data;
};

export const updateCheckin = async (
  checkinId: number,
  data: { note?: string; shared_anonymously?: boolean }
): Promise<{ success: boolean }> => {
  const { data: response } = await api.put(`/checkins/${checkinId}`, data);
  return response;
};

export const deleteCheckin = async (checkinId: number): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/checkins/${checkinId}`);
  return data;
};

// ============================================
// INSIGHTS API
// ============================================

export const getInsights = async (params?: {
  professional_id?: number;
  checkin_id?: number;
  limit?: number;
}): Promise<Insight[]> => {
  const { data } = await api.get("/insights", { params });
  return data;
};

export const getInsightById = async (insightId: number): Promise<Insight> => {
  const { data } = await api.get(`/insights/${insightId}`);
  return data;
};

export const createInsight = async (insight: NewInsight): Promise<{ success: boolean; insight: Insight; insight_id: number }> => {
  const { data } = await api.post("/insights", insight);
  return data;
};

// Login: envía email/password al backend, valida contra MySQL
// y devuelve solo el usuario (sin token, ya que no hay sesión persistente)
export const loginUser = async (
  credentials: LoginCredentials,
): Promise<{ user: User }> => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const { data } = await api.post("/auth/register", credentials);
  return data;
};

export default api;