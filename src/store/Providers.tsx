// ----------------------------------------------------
// Comentarios automáticos agregados en español por Copilot CLI runtime en VS Code
// Archivo: Providers.tsx
// ----------------------------------------------------

"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { setMoodEntries } from "./moodSlice";

// Función 'Providers': comentario automático en español
export default function Providers({ children }: { children: React.ReactNode }) {
  // Función 'useEffect': comentario automático en español
  useEffect(() => {
    // Hydrate state from localStorage on client-side mount
    if (typeof window !== "undefined") {
      try {
        // Función 'getItem': comentario automático en español
        const stored = localStorage.getItem("sodade_mood_entries");
        // Función 'if': comentario automático en español
        if (stored) {
          // Función 'dispatch': comentario automático en español
          store.dispatch(setMoodEntries(JSON.parse(stored)));
        }
      // Función 'catch': comentario automático en español
      } catch (e) {
        // Función 'error': comentario automático en español
        console.error("Failed to load mood entries from localStorage", e);
      }
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

