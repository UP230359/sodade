// lib/api.ts
import axios from "axios";

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

// --- Users ---
export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password_hash: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password_hash: string;
}

// --- Reflections (Community Needs) ---
export interface Reflection {
  id: number;
  user_id: string;
  content: string;
  category: "anxiety" | "sadness" | "stress" | "anger" | "calm";
  timestamp: string;
  status: "pending" | "draft" | "sent";
  draft_recommendation?: string;
  tag?: string;
}

// --- Responses (My Responses) ---
export interface PsychologistResponse {
  id: number;
  reflection_id: number;
  user_id: string;
  reflection_text: string;
  insight_text: string;
  category: string;
  response_date: string;
}

// --- Verification ---
export interface VerificationData {
  fullName: string;
  licenseNumber: string;
  specialty: string;
  yearsExperience: number;
  clinicName?: string;
  clinicAddress?: string;
  phoneNumber: string;
  email: string;
  bio?: string;
}

export interface VerificationStatus {
  verified: boolean;
  fullName?: string;
  licenseNumber?: string;
  specialty?: string;
  yearsExperience?: number;
  clinicName?: string;
  clinicAddress?: string;
  phoneNumber?: string;
  email?: string;
  bio?: string;
  status?: string;
  verificationDate?: string;
}

// ============================================
// JOURNAL API
// ============================================

// GET - Obtener todas las entradas de un usuario
export const getJournals = async (userId: number): Promise<Journal[]> => {
  const { data } = await api.get("/journal", { params: { user_id: userId } });
  return data;
};

// GET - Obtener una entrada específica por ID
export const getJournalById = async (entryId: number): Promise<Journal> => {
  const { data } = await api.get(`/journal/${entryId}`);
  return data;
};

// POST - Crear una nueva entrada
export const createJournal = async (journal: NewJournal): Promise<{ entry: Journal; entry_id: number }> => {
  const { data } = await api.post("/journal", journal);
  return data;
};

// PUT - Actualizar una entrada existente
export const updateJournal = async (
  entryId: number,
  data: { title?: string; content?: string }
): Promise<{ success: boolean; entry: Journal }> => {
  const { data: response } = await api.put(`/journal/${entryId}`, data);
  return response;
};

// DELETE - Eliminar una entrada
export const deleteJournal = async (entryId: number): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/journal/${entryId}`);
  return data;
};

// ============================================
// CHECKINS API
// ============================================

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

export const updateInsight = async (
  insightId: number,
  data: { content?: string; tag_id?: number | null }
): Promise<{ success: boolean }> => {
  const { data: response } = await api.put(`/insights/${insightId}`, data);
  return response;
};

export const deleteInsight = async (insightId: number): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/insights/${insightId}`);
  return data;
};

export const markInsightAsRead = async (insightId: number): Promise<{ success: boolean }> => {
  const { data } = await api.put(`/insights/${insightId}/read`);
  return data;
};

export const markAllInsightsAsRead = async (professionalId: number): Promise<{ success: boolean }> => {
  const { data } = await api.put("/insights/read-all", { professional_id: professionalId });
  return data;
};

// ============================================
// REFLECTIONS API (Community Needs)
// ============================================

export const getReflections = async (params?: {
  category?: string;
  sort?: "ASC" | "DESC";
}): Promise<Reflection[]> => {
  const { data } = await api.get("/reflections", { params });
  return data;
};

export const updateReflection = async (
  reflectionId: number,
  data: { draft_recommendation?: string; tag?: string; status?: string }
): Promise<{ success: boolean }> => {
  const { data: response } = await api.put(`/reflections/${reflectionId}`, data);
  return response;
};

// ============================================
// RESPONSES API (My Responses)
// ============================================

export const getResponses = async (): Promise<PsychologistResponse[]> => {
  const { data } = await api.get("/responses");
  return data;
};

export const getResponseById = async (responseId: number): Promise<PsychologistResponse> => {
  const { data } = await api.get(`/responses/${responseId}`);
  return data;
};

// ============================================
// VERIFICATION API
// ============================================

export const getVerificationStatus = async (): Promise<VerificationStatus> => {
  const { data } = await api.get("/verification");
  return data;
};

export const submitVerification = async (verificationData: VerificationData): Promise<{ success: boolean; id: number; message: string }> => {
  const { data } = await api.post("/verification", verificationData);
  return data;
};

// ============================================
// AUTH API
// ============================================

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const { data } = await api.post("/auth/register", credentials);
  return data;
};

export const logoutUser = async (): Promise<{ success: boolean }> => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await api.get("/auth/me");
  return data;
};

// ============================================
// INTERCEPTORES
// ============================================

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// EXPORT DEFAULT
// ============================================

export default api;