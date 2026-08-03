import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
    // Guarda al usuario autenticado en el estado global después de un login exitoso
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    // Se dispara cuando el usuario acepta el "Sacred Space Agreement" en el
    // modal de onboarding. El registro por sí solo no cuenta como sesión
    // activa: solo al aceptar el acuerdo se marca como authenticated + onboarded.
    completeOnboarding: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isOnboarded = true;
    },
    // Limpia el estado del usuario al cerrar sesión
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isOnboarded = false;
    },
  },
});

export const { setUser, completeOnboarding, logout } = userSlice.actions;
export default userSlice.reducer;