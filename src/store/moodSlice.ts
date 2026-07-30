import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getCheckins,
  createCheckin,
  Checkin as ApiCheckin,
  NewCheckin,
} from "@/lib/api";

export interface MoodEntry {
  id: string;
  mood: "joy" | "calm" | "sadness" | "anger" | "fear" | "disgust" | "surprise" | "trust";
  level: number; // 1 to 5
  note: string;
  tags: string[];
  timestamp: string; // ISO String
}

type MoodType = MoodEntry["mood"];

interface MoodState {
  entries: MoodEntry[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  submitError: string | null;
}

const MOOD_LEVELS: Record<MoodType, number> = {
  joy: 5,
  calm: 4,
  sadness: 2,
  anger: 1,
  fear: 2,
  disgust: 1,
  surprise: 3,
  trust: 4,
};

// La BD guarda los nombres capitalizados (tabla `emotions`: "Joy", "Calm"...)
// mientras que el frontend maneja el MoodType en minúsculas. Este mapeo evita
// depender del collation de MySQL para que el match sea exacto siempre.
const EMOTION_DB_NAMES: Record<MoodType, string> = {
  joy: "Joy",
  calm: "Calm",
  sadness: "Sadness",
  anger: "Anger",
  fear: "Fear",
  disgust: "Disgust",
  surprise: "Surprise",
  trust: "Trust",
};

const mapApiCheckinToMoodEntry = (checkin: ApiCheckin): MoodEntry => {
  const mood = checkin.emotion.toLowerCase() as MoodType;
  return {
    id: String(checkin.checkin_id),
    mood,
    level: MOOD_LEVELS[mood] ?? 3,
    note: checkin.note ?? "",
    tags: checkin.tags ? checkin.tags.split(",") : [],
    timestamp: checkin.created_at,
  };
};

// Trae los checkins reales del usuario desde la API (Axios) y los normaliza
// al shape de MoodEntry que ya usa toda la UI (MoodHistory, MoodChart...).
export const fetchMoodEntries = createAsyncThunk(
  "mood/fetchMoodEntries",
  async (userId: number) => {
    const checkins = await getCheckins(userId);
    return checkins.map(mapApiCheckinToMoodEntry);
  },
);

// Crea un checkin en la BD real vía Axios. No actualiza el estado local a
// mano: al resolver, el componente vuelve a hacer fetchMoodEntries para
// mantener Redux como espejo fiel de la BD.
export const submitMoodEntry = createAsyncThunk(
  "mood/submitMoodEntry",
  async (payload: {
    userId: number;
    mood: MoodType;
    note: string;
    tags: string[];
  }) => {
    const body: NewCheckin = {
      userId: payload.userId,
      emotionName: EMOTION_DB_NAMES[payload.mood],
      note: payload.note,
      sharedAnonymously: false,
      influences: payload.tags,
    };
    return createCheckin(body);
  },
);

const initialState: MoodState = {
  entries: [],
  loading: false,
  error: null,
  submitting: false,
  submitError: null,
};

const moodSlice = createSlice({
  name: "mood",
  initialState,
  reducers: {
    setMoodEntries: (state, action: PayloadAction<MoodEntry[]>) => {
      state.entries = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMoodEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMoodEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchMoodEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load checkins";
      })
      .addCase(submitMoodEntry.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitMoodEntry.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitMoodEntry.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.error.message ?? "Failed to save checkin";
      });
  },
});

export const { setMoodEntries } = moodSlice.actions;
export default moodSlice.reducer;
