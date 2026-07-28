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
        // Set all insights (used for loading from localStorage or API)
        setInsights: (state, action: PayloadAction<Insight[]>) => {
            state.insights = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("insights", JSON.stringify(state.insights));
            }
        },

        // Add a single insight (used when sending from Community Needs)
        addInsight: (state, action: PayloadAction<Insight>) => {
            state.insights.unshift(action.payload); // Add to beginning (newest first)
            if (typeof window !== "undefined") {
                localStorage.setItem("insights", JSON.stringify(state.insights));
            }
        },

        // Mark an insight as read
        markInsightAsRead: (state, action: PayloadAction<string>) => {
            const index = state.insights.findIndex((i) => i.id === action.payload);
            if (index !== -1) {
                state.insights[index].isRead = true;
                if (typeof window !== "undefined") {
                    localStorage.setItem("insights", JSON.stringify(state.insights));
                }
            }
        },

        // Mark all insights as read
        markAllInsightsAsRead: (state) => {
            state.insights.forEach((insight) => {
                insight.isRead = true;
            });
            if (typeof window !== "undefined") {
                localStorage.setItem("insights", JSON.stringify(state.insights));
            }
        },

        // Delete a single insight
        deleteInsight: (state, action: PayloadAction<string>) => {
            state.insights = state.insights.filter((i) => i.id !== action.payload);
            if (typeof window !== "undefined") {
                localStorage.setItem("insights", JSON.stringify(state.insights));
            }
        },

        // Clear all insights
        clearInsights: (state) => {
            state.insights = [];
            if (typeof window !== "undefined") {
                localStorage.removeItem("insights");
            }
        },

        // Update an existing insight
        updateInsight: (state, action: PayloadAction<Insight>) => {
            const index = state.insights.findIndex((i) => i.id === action.payload.id);
            if (index !== -1) {
                state.insights[index] = action.payload;
                if (typeof window !== "undefined") {
                    localStorage.setItem("insights", JSON.stringify(state.insights));
                }
            }
        },
    },
});

// --- Actions ---
export const {
    setInsights,
    addInsight,
    markInsightAsRead,
    markAllInsightsAsRead,
    deleteInsight,
    clearInsights,
    updateInsight,
} = insightsSlice.actions;

// --- Selectors ---
export const selectAllInsights = (state: { insights: InsightsState }) => state.insights.insights;
export const selectUnreadInsights = (state: { insights: InsightsState }) =>
    state.insights.insights.filter((i) => !i.isRead);
export const selectUnreadCount = (state: { insights: InsightsState }) =>
    state.insights.insights.filter((i) => !i.isRead).length;

// --- Reducer ---
export default insightsSlice.reducer;