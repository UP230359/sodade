// store/journalSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getJournals, createJournal, updateJournal, deleteJournal, Journal } from "@/lib/api";

// --- State ---
interface JournalState {
    entries: Journal[];
    loading: boolean;
    error: string | null;
    lastFetched: string | null;
}

// ✅ Estado inicial con entries como array vacío
const initialState: JournalState = {
    entries: [],  // <-- Asegurar que siempre sea un array
    loading: false,
    error: null,
    lastFetched: null,
};

// --- Async Thunks ---
export const fetchJournalEntries = createAsyncThunk(
    'journal/fetchEntries',
    async (userId: number) => {
        const entries = await getJournals(userId);
        return entries || [];  // <-- Asegurar que siempre retorne un array
    }
);

export const createJournalEntry = createAsyncThunk(
    'journal/createEntry',
    async (data: { user_id: number; title: string; content: string }) => {
        const result = await createJournal(data);
        return result.entry;
    }
);

export const updateJournalEntry = createAsyncThunk(
    'journal/updateEntry',
    async ({ entry_id, title, content }: { entry_id: number; title?: string; content?: string }) => {
        const result = await updateJournal(entry_id, { title, content });
        return result.entry;
    }
);

export const deleteJournalEntry = createAsyncThunk(
    'journal/deleteEntry',
    async (entry_id: number) => {
        await deleteJournal(entry_id);
        return entry_id;
    }
);

// --- Slice ---
const journalSlice = createSlice({
    name: "journal",
    initialState,
    reducers: {
        resetJournal: (state) => {
            state.entries = [];
            state.loading = false;
            state.error = null;
            state.lastFetched = null;
        },
        clearJournal: (state) => {
            state.entries = [];
        },
        // ✅ Reducer para setear entradas manualmente (fallback)
        setJournalEntries: (state, action) => {
            state.entries = action.payload || [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all
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
                state.error = action.error.message || 'Failed to fetch entries';
                state.entries = [];  // <-- Asegurar array vacío en error
            })
            // Create
            .addCase(createJournalEntry.fulfilled, (state, action) => {
                if (action.payload) {
                    state.entries = [action.payload, ...(state.entries || [])];
                }
            })
            .addCase(createJournalEntry.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to create entry';
            })
            // Update
            .addCase(updateJournalEntry.fulfilled, (state, action) => {
                if (action.payload) {
                    const index = (state.entries || []).findIndex((e) => e.entry_id === action.payload.entry_id);
                    if (index !== -1) {
                        state.entries[index] = action.payload;
                    }
                }
            })
            .addCase(updateJournalEntry.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to update entry';
            })
            // Delete
            .addCase(deleteJournalEntry.fulfilled, (state, action) => {
                state.entries = (state.entries || []).filter((e) => e.entry_id !== action.payload);
            })
            .addCase(deleteJournalEntry.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete entry';
            });
    },
});

// --- Actions ---
export const { resetJournal, clearJournal, setJournalEntries } = journalSlice.actions;

// --- Selectors ---
// ✅ Selector con valor por defecto
export const selectAllEntries = (state: { journal: JournalState }) => state.journal.entries || [];
export const selectJournalLoading = (state: { journal: JournalState }) => state.journal.loading || false;
export const selectJournalError = (state: { journal: JournalState }) => state.journal.error || null;
export const selectJournalLastFetched = (state: { journal: JournalState }) => state.journal.lastFetched || null;

// --- Reducer ---
export default journalSlice.reducer;