// ----------------------------------------------------
// Comentarios automáticos agregados en español por Copilot CLI runtime en VS Code
// Archivo: moodSlice.ts
// ----------------------------------------------------

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MoodEntry {
  id: string;
  mood: "excited" | "happy" | "neutral" | "sad" | "angry";
  level: number; // 1 to 5
  note: string;
  tags: string[];
  timestamp: string; // ISO String
}

interface MoodState {
  entries: MoodEntry[];
}

const MOOD_LEVELS: Record<MoodEntry["mood"], number> = {
  excited: 5,
  happy: 4,
  neutral: 3,
  sad: 2,
  angry: 1,
};

const initialState: MoodState = {
  entries: [],
};

// Función 'createSlice': comentario automático en español
const moodSlice = createSlice({
  name: "mood",
  initialState,
  reducers: {
    // Función o bloque: comentario automático en español
    addMoodEntry: (
      state,
      action: PayloadAction<{
        mood: MoodEntry["mood"];
        note: string;
        tags: string[];
      }>
    ) => {
      const { mood, note, tags } = action.payload;
      const newEntry: MoodEntry = {
        // Función 'random': comentario automático en español
        id: Math.random().toString(36).substring(2, 9),
        mood,
        level: MOOD_LEVELS[mood] || 3,
        note,
        tags,
        // Función 'Date': comentario automático en español
        timestamp: new Date().toISOString(),
      };
      // Función 'unshift': comentario automático en español
      state.entries.unshift(newEntry);
      
      // Persist to localStorage if window exists
      if (typeof window !== "undefined") {
        try {
          // Función 'setItem': comentario automático en español
          localStorage.setItem("sodade_mood_entries", JSON.stringify(state.entries));
        // Función 'catch': comentario automático en español
        } catch (e) {
          // Función 'error': comentario automático en español
          console.error("Failed to persist mood entries", e);
        }
      }
    },
    // Función o bloque: comentario automático en español
    setMoodEntries: (state, action: PayloadAction<MoodEntry[]>) => {
      state.entries = action.payload;
    },
  },
});

export const { addMoodEntry, setMoodEntries } = moodSlice.actions;
export default moodSlice.reducer;

