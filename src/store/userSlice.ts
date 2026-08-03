import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accountType?: "personal" | "professional";
  isOnboarded?: boolean;
  cedula?: string;
  name?: string; // Supporting contribution's dummy format
}
import { User } from "@/lib/api";

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
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isOnboarded = false;
    },
  },
});

export const { setUser, login, setOnboarded, logout } = userSlice.actions;
export default userSlice.reducer;
    // Guarda al usuario autenticado en el estado global después de un login exitoso
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    // Limpia el estado del usuario al cerrar sesión
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
