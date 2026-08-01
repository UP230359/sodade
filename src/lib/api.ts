import axios from "axios";

// Cliente axios centralizado para todas las llamadas al backend
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

// Login: envía email/password al backend, valida contra MySQL
// y devuelve solo el usuario (sin token, ya que no hay sesión persistente)
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

export default api;