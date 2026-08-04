// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ============================================
// TIPOS
// ============================================

export interface Checkin {
  checkin_id: number;
  user_id: number;
  emotion_id: number;
  note: string | null;
  shared_anonymously: boolean;
  created_at: string;
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

export interface Insight {
  insight_id: number;
  checkin_id: number;
  professional_id: number;
  tag_id: number | null;
  content: string;
  created_at: string;
  user_id?: number;
  first_name?: string;
  category?: string;
  is_read?: boolean;
}

export interface NewInsight {
  checkin_id: number;
  professional_id: number;
  tag_id?: number | null;
  content: string;
}

export interface PsychologistResponse {
  id: number;
  reflection_id: number;
  user_id: string;
  reflection_text: string;
  insight_text: string;
  category: string;
  response_date: string;
}

export interface VerificationStatus {
  verified: boolean;
  user_id?: number;
  professional_cedula?: string;
  institution_name?: string;
  primary_specialty?: string;
  verification_status?: string;
  verification_date?: string;
}

export interface Reflection {
  id: number;
  user_id: string;
  content: string;
  category: string;
  timestamp: string;
  status: string;
  draft_recommendation?: string;
  tag?: string;
  checkin_id?: number;
}

// ============================================
// FUNCIONES DE CHECKINS
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
// FUNCIONES DE JOURNAL
// ============================================

export const getJournals = async (userId: number): Promise<Journal[]> => {
  const { data } = await api.get("/journal", { params: { user_id: userId } });
  return data;
};

export const createJournal = async (journal: { user_id: number; title: string; content: string }): Promise<{ entry: Journal; entry_id: number }> => {
  const { data } = await api.post("/journal", journal);
  return data;
};

export const updateJournal = async (entryId: number, data: { title?: string; content?: string }): Promise<{ success: boolean; entry: Journal }> => {
  const { data: response } = await api.put(`/journal/${entryId}`, data);
  return response;
};

export const deleteJournal = async (entryId: number): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/journal/${entryId}`);
  return data;
};

// ============================================
// FUNCIONES DE INSIGHTS
// ============================================

export const getInsights = async (params?: {
  user_id?: number;
  professional_id?: number;
  checkin_id?: number;
  limit?: number;
}): Promise<Insight[]> => {
  const { data } = await api.get("/insights", { params });
  return data;
};

export const createInsight = async (insight: NewInsight): Promise<{ success: boolean; insight: Insight; insight_id: number }> => {
  const { data } = await api.post("/insights", insight);
  return data;
};

export const deleteInsight = async (insightId: number): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/insights/${insightId}`);
  return data;
};

export const markInsightAsRead = async (insightId: number): Promise<{ success: boolean }> => {
  const { data } = await api.put(`/insights/${insightId}/read`);
  return data;
};

// ============================================
// FUNCIONES DE REFLECTIONS
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
// FUNCIONES DE RESPONSES (Portal)
// ============================================

export const getResponses = async (professionalId?: number): Promise<PsychologistResponse[]> => {
  const { data } = await api.get("/portal/responses", { params: { professional_id: professionalId } });
  return data;
};

// ============================================
// FUNCIONES DE VERIFICATION (Portal)
// ============================================

export const getVerificationStatus = async (userId?: number): Promise<VerificationStatus> => {
  const { data } = await api.get("/portal/verify", { params: { user_id: userId } });
  return data;
};

// ============================================
// INTERCEPTORES
// ============================================

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
  (error) => Promise.reject(error)
);

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