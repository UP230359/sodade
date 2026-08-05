import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getInsights,
  createInsight,
  deleteInsight,
  markInsightAsRead,
  NewInsight,
} from "@/lib/api";

export interface Insight {
  insight_id: number;
  checkin_id: number;
  professional_id: number;
  tag_id: number | null;
  content: string;
  created_at: string;
  user_id?: number | string;
  id: string;
  type: "system" | "ai" | "psychologist";
  title: string;
  preview: string;
  category: string;
  isRead: boolean;
  isNew?: boolean;
}

interface APIInsightItem {
  insight_id: number;
  checkin_id: number;
  professional_id: number;
  tag_id: number | null;
  content: string;
  created_at: string;
  user_id?: number;
  first_name?: string;
  category?: string;
  is_read?: boolean;
}

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
>("insights/fetchUserInsights", async (userId: number, { rejectWithValue }) => {
  try {
    const insights = await getInsights({ user_id: userId });
    return insights.map((item: APIInsightItem) => ({
      id: String(item.insight_id),
      insight_id: item.insight_id,
      checkin_id: item.checkin_id,
      professional_id: item.professional_id,
      tag_id: item.tag_id,
      content: item.content,
      created_at: item.created_at,
      user_id: item.user_id || userId,
      type: "psychologist",
      title: `Insight from ${item.first_name || "Professional"}`,
      preview: item.content ? item.content.slice(0, 150) + "..." : "No content",
      category: item.category || "General",
      isRead: item.is_read || false,
      isNew: true,
    }));
  } catch (error: unknown) {
    return rejectWithValue(
      (error as Error).message || "Failed to fetch insights",
    );
  }
});

export const fetchProfessionalInsights = createAsyncThunk<
  Insight[],
  number,
  { rejectValue: string }
>(
  "insights/fetchProfessionalInsights",
  async (professionalId: number, { rejectWithValue }) => {
    try {
      const insights = await getInsights({ professional_id: professionalId });
      return insights.map((item: APIInsightItem) => ({
        id: String(item.insight_id),
        insight_id: item.insight_id,
        checkin_id: item.checkin_id,
        professional_id: item.professional_id,
        tag_id: item.tag_id,
        content: item.content,
        created_at: item.created_at,
        user_id: item.user_id,
        type: "psychologist",
        title: `Insight sent to user`,
        preview: item.content
          ? item.content.slice(0, 150) + "..."
          : "No content",
        category: item.category || "General",
        isRead: true,
        isNew: false,
      }));
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || "Failed to fetch insights",
      );
    }
  },
);

export const createInsightEntry = createAsyncThunk<
  Insight,
  NewInsight,
  { rejectValue: string }
>("insights/createInsight", async (data: NewInsight, { rejectWithValue }) => {
  try {
    const result = await createInsight(data);
    const item = result.insight;
    return {
      id: String(item.insight_id),
      insight_id: item.insight_id,
      checkin_id: item.checkin_id,
      professional_id: item.professional_id,
      tag_id: item.tag_id,
      content: item.content,
      created_at: item.created_at,
      user_id: item.user_id,
      type: "psychologist",
      title: "New Insight",
      preview: item.content ? item.content.slice(0, 150) + "..." : "No content",
      category: item.category || "General",
      isRead: false,
      isNew: true,
    };
  } catch (error: unknown) {
    return rejectWithValue(
      (error as Error).message || "Failed to create insight",
    );
  }
});

export const markInsightAsReadThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("insights/markAsRead", async (insightId: number, { rejectWithValue }) => {
  try {
    await markInsightAsRead(insightId);
    return insightId;
  } catch (error: unknown) {
    return rejectWithValue(
      (error as Error).message || "Failed to mark as read",
    );
  }
});

export const deleteInsightEntry = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("insights/deleteInsight", async (insightId: number, { rejectWithValue }) => {
  try {
    await deleteInsight(insightId);
    return insightId;
  } catch (error: unknown) {
    return rejectWithValue(
      (error as Error).message || "Failed to delete insight",
    );
  }
});

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
    markInsightRead: (state, action) => {
      const index = state.insights.findIndex(
        (i) =>
          i.id === action.payload || i.insight_id === parseInt(action.payload),
      );
      if (index !== -1) {
        state.insights[index].isRead = true;
      }
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
      .addCase(fetchProfessionalInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfessionalInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload || [];
      })
      .addCase(fetchProfessionalInsights.rejected, (state, action) => {
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
        const index = state.insights.findIndex(
          (i) => i.insight_id === action.payload,
        );
        if (index !== -1) {
          state.insights[index].isRead = true;
        }
      })
      .addCase(deleteInsightEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInsightEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = state.insights.filter(
          (i) => i.insight_id !== action.payload,
        );
      })
      .addCase(deleteInsightEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete insight";
      });
  },
});

export const { setInsights, clearInsights, resetInsights, markInsightRead } =
  insightsSlice.actions;

export const selectAllInsights = (state: { insights: InsightsState }) =>
  state.insights.insights || [];

export const selectUnreadInsights = (state: { insights: InsightsState }) =>
  (state.insights.insights || []).filter((i) => !i.isRead);

export const selectUnreadCount = (state: { insights: InsightsState }) =>
  (state.insights.insights || []).filter((i) => !i.isRead).length;

export const selectInsightsLoading = (state: { insights: InsightsState }) =>
  state.insights.loading || false;

export const selectInsightsError = (state: { insights: InsightsState }) =>
  state.insights.error || null;

export default insightsSlice.reducer;
