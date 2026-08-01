// ----------------------------------------------------
// Comentarios automáticos agregados en español por Copilot CLI runtime en VS Code
// Archivo: index.ts
// ----------------------------------------------------

import { configureStore } from "@reduxjs/toolkit";
import moodReducer from "./moodSlice";
import userReducer from "./userSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Función 'configureStore': comentario automático en español
export const store = configureStore({
  reducer: {
    mood: moodReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Función 'useAppDispatch': comentario automático en español
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

