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

const moodSlice = createSlice({
  name: "mood",
  initialState,
  reducers: {
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
        id: Math.random().toString(36).substring(2, 9),
        mood,
        level: MOOD_LEVELS[mood] || 3,
        note,
        tags,
        timestamp: new Date().toISOString(),
      };
      state.entries.unshift(newEntry);
      
      // Persist to localStorage if window exists
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("sodade_mood_entries", JSON.stringify(state.entries));
        } catch (e) {
          console.error("Failed to persist mood entries", e);
        }
      }
    },
    setMoodEntries: (state, action: PayloadAction<MoodEntry[]>) => {
      state.entries = action.payload;
    },
  },
});

export const { addMoodEntry, setMoodEntries } = moodSlice.actions;
export default moodSlice.reducer;
