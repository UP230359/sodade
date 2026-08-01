// store/journalSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getJournals, createJournal, updateJournal, deleteJournal, Journal } from "@/lib/api";

// --- Types ---
export interface JournalEntry extends Journal {
    // Podemos extender si es necesario
}

interface JournalState {
    entries: JournalEntry[];
    loading: boolean;
    error: string | null;
    lastFetched: string | null;
}

// --- Estado inicial ---
const initialState: JournalState = {
    entries: [],
    loading: false,
    error: null,
    lastFetched: null,
};

// --- Async Thunks ---

// Obtener todas las entradas de un usuario
export const fetchJournalEntries = createAsyncThunk<
    JournalEntry[], // tipo de retorno
    number,          // argumento (userId)
    { rejectValue: string }
>(
    "journal/fetchEntries",
    async (userId: number, { rejectWithValue }) => {
        try {
            console.log('📤 fetchJournalEntries - userId:', userId);
            const entries = await getJournals(userId);
            console.log('✅ fetchJournalEntries - entries:', entries.length);
            return entries;
        } catch (error: any) {
            console.error('❌ fetchJournalEntries - Error:', error);
            return rejectWithValue(error.message || "Failed to fetch journal entries");
        }
    }
);

// Crear una nueva entrada
export const createJournalEntry = createAsyncThunk<
    JournalEntry,
    { user_id: number; title: string; content: string },
    { rejectValue: string }
>(
    "journal/createEntry",
    async (data, { rejectWithValue }) => {
        try {
            console.log('📤 createJournalEntry - data:', data);
            const result = await createJournal(data);
            console.log('✅ createJournalEntry - result:', result);
            return result.entry;
        } catch (error: any) {
            console.error('❌ createJournalEntry - Error:', error);
            return rejectWithValue(error.message || "Failed to create journal entry");
        }
    }
);

// Actualizar una entrada existente
export const updateJournalEntry = createAsyncThunk<
    JournalEntry,
    { entry_id: number; title?: string; content?: string },
    { rejectValue: string }
>(
    "journal/updateEntry",
    async ({ entry_id, title, content }, { rejectWithValue }) => {
        try {
            console.log('📤 updateJournalEntry - entry_id:', entry_id);
            const result = await updateJournal(entry_id, { title, content });
            console.log('✅ updateJournalEntry - result:', result);
            return result.entry;
        } catch (error: any) {
            console.error('❌ updateJournalEntry - Error:', error);
            return rejectWithValue(error.message || "Failed to update journal entry");
        }
    }
);

// Eliminar una entrada
export const deleteJournalEntry = createAsyncThunk<
    number,               // retorna el entry_id eliminado
    number,               // argumento (entry_id)
    { rejectValue: string }
>(
    "journal/deleteEntry",
    async (entry_id: number, { rejectWithValue }) => {
        try {
            console.log('📤 deleteJournalEntry - entry_id:', entry_id);
            await deleteJournal(entry_id);
            console.log('✅ deleteJournalEntry - eliminado:', entry_id);
            return entry_id;
        } catch (error: any) {
            console.error('❌ deleteJournalEntry - Error:', error);
            return rejectWithValue(error.message || "Failed to delete journal entry");
        }
    }
);

// --- Slice ---
const journalSlice = createSlice({
    name: "journal",
    initialState,
    reducers: {
        // Reducer para resetear el estado
        resetJournal: (state) => {
            state.entries = [];
            state.loading = false;
            state.error = null;
            state.lastFetched = null;
        },
        // Reducer para limpiar todas las entradas
        clearJournal: (state) => {
            state.entries = [];
        },
        // Reducer para establecer entradas manualmente
        setJournalEntries: (state, action: PayloadAction<JournalEntry[]>) => {
            state.entries = action.payload || [];
            state.lastFetched = new Date().toISOString();
        },
    },
    extraReducers: (builder) => {
        builder
            // --- fetchJournalEntries ---
            .addCase(fetchJournalEntries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJournalEntries.fulfilled, (state, action) => {
                state.loading = false;
                state.entries = action.payload || [];
                state.lastFetched = new Date().toISOString();
            })
            .addCase(fetchJournalEntries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch journal entries";
                state.entries = [];
            })
            // --- createJournalEntry ---
            .addCase(createJournalEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createJournalEntry.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.entries = [action.payload, ...(state.entries || [])];
                }
            })
            .addCase(createJournalEntry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to create journal entry";
            })
            // --- updateJournalEntry ---
            .addCase(updateJournalEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateJournalEntry.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    const index = (state.entries || []).findIndex(
                        (e) => e.entry_id === action.payload.entry_id
                    );
                    if (index !== -1) {
                        state.entries[index] = action.payload;
                    }
                }
            })
            .addCase(updateJournalEntry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update journal entry";
            })
            // --- deleteJournalEntry ---
            .addCase(deleteJournalEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteJournalEntry.fulfilled, (state, action) => {
                state.loading = false;
                state.entries = (state.entries || []).filter(
                    (e) => e.entry_id !== action.payload
                );
            })
            .addCase(deleteJournalEntry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete journal entry";
            });
    },
});

// --- Actions ---
export const { resetJournal, clearJournal, setJournalEntries } = journalSlice.actions;

// --- Selectors ---
export const selectAllEntries = (state: { journal: JournalState }) => state.journal.entries || [];
export const selectJournalLoading = (state: { journal: JournalState }) => state.journal.loading || false;
export const selectJournalError = (state: { journal: JournalState }) => state.journal.error || null;
export const selectJournalLastFetched = (state: { journal: JournalState }) => state.journal.lastFetched || null;

// --- Reducer ---
export default journalSlice.reducer;