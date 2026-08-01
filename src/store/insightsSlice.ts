// store/insightsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getInsights, createInsight, deleteInsight, Insight, NewInsight } from "@/lib/api";

interface InsightsState {
  insights: Insight[];
  loading: boolean;
  error: string | null;
}

const initialState: InsightsState = {
  insights: [],
  loading: false,
  error: null,
};

export const fetchUserInsights = createAsyncThunk<
  Insight[],
  number,
  { rejectValue: string }
>(
  "insights/fetchUserInsights",
  async (userId: number, { rejectWithValue }) => {
    try {
      const insights = await getInsights({ user_id: userId });
      return insights;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch insights");
    }
  }
);

export const createInsightEntry = createAsyncThunk<
  Insight,
  NewInsight,
  { rejectValue: string }
>(
  "insights/createInsight",
  async (data: NewInsight, { rejectWithValue }) => {
    try {
      const result = await createInsight(data);
      return result.insight;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create insight");
    }
  }
);

export const deleteInsightEntry = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "insights/deleteInsight",
  async (insightId: number, { rejectWithValue }) => {
    try {
      await deleteInsight(insightId);
      return insightId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete insight");
    }
  }
);

const insightsSlice = createSlice({
  name: "insights",
  initialState,
  reducers: {
    setInsights: (state, action) => {
      state.insights = action.payload || [];
    },
    clearInsights: (state) => {
      state.insights = [];
    },
    resetInsights: (state) => {
      state.insights = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload || [];
      })
      .addCase(fetchUserInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch insights";
        state.insights = [];
      })
      .addCase(createInsightEntry.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.insights = [action.payload, ...(state.insights || [])];
        }
      })
      .addCase(createInsightEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create insight";
      })
      .addCase(deleteInsightEntry.fulfilled, (state, action) => {
        state.insights = (state.insights || []).filter((i) => i.insight_id !== action.payload);
      });
  },
});

export const { setInsights, clearInsights, resetInsights } = insightsSlice.actions;

export const selectAllInsights = (state: { insights: InsightsState }) => state.insights.insights || [];
export const selectUnreadCount = (state: { insights: InsightsState }) =>
  (state.insights.insights || []).filter((i) => !i.isRead).length;
export const selectInsightsLoading = (state: { insights: InsightsState }) => state.insights.loading || false;
export const selectInsightsError = (state: { insights: InsightsState }) => state.insights.error || null;

export default insightsSlice.reducer;