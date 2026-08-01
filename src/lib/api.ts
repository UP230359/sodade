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

// --- Tags ---
export interface Tag {
  tag_id: number;
  name: string;
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
  checkin_id?: number;
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
export interface VerificationStatus {
    verified: boolean;
    user_id?: number;
    professional_cedula?: string;
    institution_name?: string;
    primary_specialty?: string;
    verification_status?: string;
    verification_date?: string;
}

export interface VerificationStatus {
  verified: boolean;
  professional_id?: number;
  user_id?: number;
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
  institution_name?: string;
  primary_specialty?: string;
  verification_status?: string;
  verification_date?: string;
}

// --- Professional ---
export interface Professional {
  professional_id: number;
  user_id: number;
  institution_name: string | null;
  primary_specialty: string;
  verification_status: string;
  verification_date: string;
}

// ============================================
// JOURNAL API
// ============================================

export const getJournals = async (userId: number): Promise<Journal[]> => {
  const { data } = await api.get("/journal", { params: { user_id: userId } });
  return data;
};

export const getJournalById = async (entryId: number): Promise<Journal> => {
  const { data } = await api.get(`/journal/${entryId}`);
  return data;
};

export const createJournal = async (journal: NewJournal): Promise<{ entry: Journal; entry_id: number }> => {
  const { data } = await api.post("/journal", journal);
  return data;
};

export const updateJournal = async (
  entryId: number,
  data: { title?: string; content?: string }
): Promise<{ success: boolean; entry: Journal }> => {
  const { data: response } = await api.put(`/journal/${entryId}`, data);
  return response;
};

export const deleteJournal = async (entryId: number): Promise<{ success: boolean }> => {
    console.log('📤 deleteJournal - ID:', entryId);
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
// TAGS API - Ruta actualizada a /portal/tags
// ============================================

export const getTags = async (): Promise<Tag[]> => {
  const { data } = await api.get("/portal/tags");
  return data;
};

export const createTag = async (name: string): Promise<{ tag_id: number }> => {
  const { data } = await api.post("/portal/tags", { name });
  return data;
};

// ============================================
// REFLECTIONS API - Ruta actualizada a /portal/reflections
// ============================================
export const getReflections = async (params?: {
  category?: string;  // emotion_id
  sort?: "ASC" | "DESC";
}): Promise<Reflection[]> => {
  const { data } = await api.get("/portal/reflections", { 
    params: { 
      emotion_id: params?.category,
      sort: params?.sort 
    } 
  });
  return data.map((item: any) => ({
    ...item,
    category: mapEmotionIdToCategory(item.category)
  }));
};
const mapEmotionIdToCategory = (emotionId: number): string => {
  const emotionMap: { [key: number]: string } = {
    1: 'anxiety',
    2: 'sadness',
    3: 'stress',
    4: 'anger',
    5: 'calm',
  };
  return emotionMap[emotionId] || 'unknown';
};

export const updateReflection = async (
  reflectionId: number,
  data: { draft_recommendation?: string; tag?: string; status?: string }
): Promise<{ success: boolean }> => {
  // Guardar la nota en el checkin
  const { data: response } = await api.put(`/portal/reflections`, {
    id: reflectionId,
    draft_recommendation: data.draft_recommendation,
    tag: data.tag,
    status: data.status,
  });
  return response;
};

// ============================================
// RESPONSES API - Ruta actualizada a /portal/responses
// ============================================

export const getResponses = async (professionalId?: number): Promise<PsychologistResponse[]> => {
  const { data } = await api.get("/portal/responses", { 
    params: { professional_id: professionalId } 
  });
  return data;
};

export const getResponseById = async (responseId: number): Promise<PsychologistResponse> => {
  const { data } = await api.get(`/portal/responses/${responseId}`);
  return data;
};

// ============================================
// VERIFICATION API - Ruta actualizada a /portal/verify
// ============================================

export const getVerificationStatus = async (userId?: number): Promise<VerificationStatus> => {
  const { data } = await api.get("/portal/verify", { 
    params: { user_id: userId } 
  });
  return data;
};

export const submitVerification = async (verificationData: VerificationData): Promise<{ success: boolean; id: number; message: string }> => {
  const { data } = await api.post("/portal/verify", verificationData);
  return data;
};

export const getProfessionalById = async (professionalId: number): Promise<Professional> => {
  const { data } = await api.get(`/portal/professionals/${professionalId}`);
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