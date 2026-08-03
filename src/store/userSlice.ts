import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/lib/api";

// Se re-exporta User para no romper los imports existentes que hacen
// `import { User } from "@/store/userSlice"` (ej. register/page.tsx).
export type { User };

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isOnboarded: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Guarda al usuario autenticado en el estado global después de un login exitoso
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isOnboarded = action.payload ? (action.payload.isOnboarded ?? false) : false;
    },
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isOnboarded = action.payload.isOnboarded ?? true; // Default to true if not specified
    },
    setOnboarded: (state) => {
      state.isOnboarded = true;
      if (state.user) {
        state.user.isOnboarded = true;
      }
    },
    // Limpia el estado del usuario al cerrar sesión
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isOnboarded = false;
    },
  },
});

export const { setUser, login, setOnboarded, logout } = userSlice.actions;
export default userSlice.reducer;
