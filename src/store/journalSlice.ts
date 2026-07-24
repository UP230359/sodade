// lib/features/journal/journalSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { JournalEntry } from "@/app/journal/page";

interface JournalState {
    entries: JournalEntry[];
}

const initialState: JournalState = {
    entries: [],
};

const journalSlice = createSlice({
    name: "journal",
    initialState,
    reducers: {
        setJournalEntries: (state, action: PayloadAction<JournalEntry[]>) => {
            state.entries = action.payload;
        },
        addJournalEntry: (state, action: PayloadAction<JournalEntry>) => {
            state.entries.push(action.payload);
            if (typeof window !== "undefined") {
                localStorage.setItem("journalEntries", JSON.stringify(state.entries));
            }
        },
        updateJournalEntry: (state, action: PayloadAction<JournalEntry>) => {
            const index = state.entries.findIndex((e) => e.id === action.payload.id);
            if (index !== -1) {
                state.entries[index] = action.payload;
                if (typeof window !== "undefined") {
                    localStorage.setItem("journalEntries", JSON.stringify(state.entries));
                }
            }
        },
        deleteJournalEntry: (state, action: PayloadAction<string>) => {
            state.entries = state.entries.filter((e) => e.id !== action.payload);
            if (typeof window !== "undefined") {
                localStorage.setItem("journalEntries", JSON.stringify(state.entries));
            }
        },
    },
});

export const { setJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = journalSlice.actions;
export default journalSlice.reducer;