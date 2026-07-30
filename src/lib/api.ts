import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // NUEVO: necesario para que el navegador envíe/reciba la cookie de sesión del login
});

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

// EDITADO: se agregaron firstName, lastName y accountType porque el login los necesita
// (para saber si redirigir a /dashboard o /portal). name se deja para no romper register.
export interface User {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  accountType?: "personal" | "professional";
}

export interface AuthResponse {
  user: User;
  token: string;
}

// EDITADO: password_hash -> password (el login manda la contraseña en texto plano,
// el backend ya no espera un campo llamado "password_hash")
export interface LoginCredentials {
  email: string;
  password: string;
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

// EDITADO: ya no devuelve token (el backend usa cookie de sesión, no JWT),
// por eso el tipo de retorno es { user: User } en vez de AuthResponse
export const loginUser = async (
  credentials: LoginCredentials,
): Promise<{ user: User }> => {
  const { data } = await api.post("/auth/login", credentials);
  return data;
};

// NUEVO: necesaria para restaurar la sesión al recargar la página (la usa hooks/useAuth.ts)
export const getCurrentUser = async (): Promise<{ user: User | null }> => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const registerUser = async (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  const { data } = await api.post("/auth/register", credentials);
  return data;
};

export default api;