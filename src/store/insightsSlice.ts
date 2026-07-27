// lib/features/insights/insightsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Insight } from "@/app/insights/page";

interface InsightsState {
    insights: Insight[];
}

const loadInitialState = (): InsightsState => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("insights");
        if (saved) {
            try {
                return { insights: JSON.parse(saved) };
            } catch (e) {}
        }
    }
    return { insights: [] };
};

const initialState: InsightsState = loadInitialState();

const insightsSlice = createSlice({
    name: "insights",
    initialState,
    reducers: {
        setInsights: (state, action: PayloadAction<Insight[]>) => {
            state.insights = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("insights", JSON.stringify(state.insights));
            }
        },
        markInsightAsRead: (state, action: PayloadAction<string>) => {
            const index = state.insights.findIndex((i) => i.id === action.payload);
            if (index !== -1) {
                state.insights[index].isRead = true;
                if (typeof window !== "undefined") {
                    localStorage.setItem("insights", JSON.stringify(state.insights));
                }
            }
        },
        deleteInsight: (state, action: PayloadAction<string>) => {
            state.insights = state.insights.filter((i) => i.id !== action.payload);
            if (typeof window !== "undefined") {
                localStorage.setItem("insights", JSON.stringify(state.insights));
            }
        },
    },
});

export const { setInsights, markInsightAsRead, deleteInsight } = insightsSlice.actions;
export default insightsSlice.reducer;