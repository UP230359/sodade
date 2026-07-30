import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

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

export interface User {
  id: number;
  name: string;
  email: string;
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

export const getJournals = async (userId: number): Promise<Journal[]> => {
  const { data } = await api.get("/journal", { params: { userId } });
  return data;
};

export const createJournal = async (
  journal: NewJournal,
): Promise<{ entry_id: number }> => {
  const { data } = await api.post("/journal", journal);
  return data;
};

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

export const registerUser = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  const { data } = await api.post("/auth/register", credentials);
  return data;
};

export default api;
