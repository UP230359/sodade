// store/insightsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getInsights, createInsight, deleteInsight, markInsightAsRead, Insight, NewInsight } from "@/lib/api";

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

// ✅ Asegurar que el tipo de retorno sea correcto
export const fetchInsights = createAsyncThunk<
  Insight[], // Tipo de retorno
  number, // Tipo del argumento
  { rejectValue: string } // Tipo de error
>(
  "insights/fetchInsights",
  async (professionalId: number, { rejectWithValue }) => {
    try {
      const insights = await getInsights({ professional_id: professionalId });
      return insights;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch insights");
    }
  }
);

export const createInsightEntry = createAsyncThunk<
  Insight, // Tipo de retorno
  NewInsight, // Tipo del argumento
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

export const markInsightAsReadThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "insights/markAsRead",
  async (insightId: number, { rejectWithValue }) => {
    try {
      await markInsightAsRead(insightId);
      return insightId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark as read");
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
      .addCase(fetchInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload || [];
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch insights";
        state.insights = [];
      })
      .addCase(createInsightEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
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
      .addCase(markInsightAsReadThunk.fulfilled, (state, action) => {
        const index = (state.insights || []).findIndex((i) => i.insight_id === action.payload);
        if (index !== -1) {
          state.insights[index].isRead = true;
        }
      })
      .addCase(deleteInsightEntry.fulfilled, (state, action) => {
        state.insights = (state.insights || []).filter((i) => i.insight_id !== action.payload);
      });
  },
});

export const { clearInsights, resetInsights } = insightsSlice.actions;

export const selectAllInsights = (state: { insights: InsightsState }) => state.insights.insights || [];
export const selectUnreadInsights = (state: { insights: InsightsState }) =>
  (state.insights.insights || []).filter((i) => !i.isRead);
export const selectUnreadCount = (state: { insights: InsightsState }) =>
  (state.insights.insights || []).filter((i) => !i.isRead).length;
export const selectInsightsLoading = (state: { insights: InsightsState }) => state.insights.loading || false;
export const selectInsightsError = (state: { insights: InsightsState }) => state.insights.error || null;

export default insightsSlice.reducer;