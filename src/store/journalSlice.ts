// src/store/journalSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getJournals, createJournal, updateJournal, deleteJournal, Journal } from "@/lib/api";

interface JournalState {
    entries: Journal[];
    loading: boolean;
    error: string | null;
    lastFetched: string | null;
}

const initialState: JournalState = {
    entries: [],
    loading: false,
    error: null,
    lastFetched: null,
};

export const fetchJournalEntries = createAsyncThunk<
    Journal[],
    number,
    { rejectValue: string }
>(
    "journal/fetchEntries",
    async (userId: number, { rejectWithValue }) => {
        try {
            const entries = await getJournals(userId);
            return entries;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || "Failed to fetch journal entries");
        }
    }
);

export const createJournalEntry = createAsyncThunk<
    Journal,
    { user_id: number; title: string; content: string },
    { rejectValue: string }
>(
    "journal/createEntry",
    async (data, { rejectWithValue }) => {
        try {
            const result = await createJournal(data);
            return result.entry;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || "Failed to create journal entry");
        }
    }
);

export const updateJournalEntry = createAsyncThunk<
    Journal,
    { entry_id: number; title?: string; content?: string },
    { rejectValue: string }
>(
    "journal/updateEntry",
    async ({ entry_id, title, content }, { rejectWithValue }) => {
        try {
            const result = await updateJournal(entry_id, { title, content });
            return result.entry;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || "Failed to update journal entry");
        }
    }
);

export const deleteJournalEntry = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>(
    "journal/deleteEntry",
    async (entry_id: number, { rejectWithValue }) => {
        try {
            await deleteJournal(entry_id);
            return entry_id;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || "Failed to delete journal entry");
        }
    }
);

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
        setJournalEntries: (state, action: PayloadAction<Journal[]>) => {
            state.entries = action.payload || [];
            state.lastFetched = new Date().toISOString();
        },
    },
    extraReducers: (builder) => {
        builder
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
            .addCase(updateJournalEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateJournalEntry.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    const index = state.entries.findIndex((e) => e.entry_id === action.payload.entry_id);
                    if (index !== -1) {
                        state.entries[index] = action.payload;
                    }
                }
            })
            .addCase(updateJournalEntry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to update journal entry";
            })
            .addCase(deleteJournalEntry.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteJournalEntry.fulfilled, (state, action) => {
                state.loading = false;
                state.entries = state.entries.filter((e) => e.entry_id !== action.payload);
            })
            .addCase(deleteJournalEntry.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to delete journal entry";
            });
    },
});

export const { resetJournal, clearJournal, setJournalEntries } = journalSlice.actions;

export const selectAllEntries = (state: { journal: JournalState }) => state.journal.entries || [];
export const selectJournalLoading = (state: { journal: JournalState }) => state.journal.loading || false;
export const selectJournalError = (state: { journal: JournalState }) => state.journal.error || null;
export const selectJournalLastFetched = (state: { journal: JournalState }) => state.journal.lastFetched || null;

export default journalSlice.reducer;