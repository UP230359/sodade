import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getCheckins,
  createCheckin,
  Checkin as ApiCheckin,
  NewCheckin,
} from "@/lib/api";

//Esta es la forma que tiene cada emocion guardada
//aqui defino los datos que necesita cada checkin
export interface MoodEntry {
  id: string;
  mood: "joy" | "calm" | "sadness" | "anger" | "fear" | "disgust" | "surprise" | "trust";
  level: number; // 1 to 5
  note: string;
  tags: string[];
  timestamp: string; // ISO String
}

type MoodType = MoodEntry["mood"];

//Este es el estado que va a manejar redux
//tiene los checkins, si esta cargando y si hubo error
interface MoodState {
  entries: MoodEntry[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  submitError: string | null;
}

//Aqui le doy un numero del 1 al 5 a cada emocion
//esto es solo para mostrarlo en la grafica y el historial
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

//En la base de datos las emociones estan con mayuscula (Joy, Calm)
//pero aqui en el frontend las uso en minuscula, por eso hago este cambio
//asi me aseguro que siempre haga match bien sin importar la base de datos
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

//Esta funcion agarra lo que regresa la api y lo convierte
//al formato que ya usan los componentes (MoodHistory, MoodChart)
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

//Esta funcion trae los checkins del usuario usando axios
//y los deja listos para usarse en la interfaz
export const fetchMoodEntries = createAsyncThunk(
  "mood/fetchMoodEntries",
  async (userId: number) => {
    const checkins = await getCheckins(userId);
    return checkins.map(mapApiCheckinToMoodEntry);
  },
);

//Esta funcion guarda un checkin nuevo en la base de datos
//no actualiza el estado a mano, despues se vuelve a pedir la lista completa
//asi me aseguro que redux siempre tenga lo mismo que la base de datos
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

//Este es el estado inicial, antes de que se pida nada
const initialState: MoodState = {
  entries: [],
  loading: false,
  error: null,
  submitting: false,
  submitError: null,
};

//Aqui se crea el slice de redux con su nombre, estado inicial
//y los cambios que puede tener ese estado
const moodSlice = createSlice({
  name: "mood",
  initialState,
  reducers: {
    setMoodEntries: (state, action: PayloadAction<MoodEntry[]>) => {
      state.entries = action.payload;
    },
  },
  //Aqui manejo lo que pasa en cada momento de las funciones de arriba
  //pending es cuando empieza, fulfilled cuando termina bien
  //y rejected cuando algo sale mal
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

//Exporto la accion para poder usarla si hace falta en otro lado
export const { setMoodEntries } = moodSlice.actions;
export default moodSlice.reducer;
