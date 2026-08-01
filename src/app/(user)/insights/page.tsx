// app/insights/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/index";
import { deleteInsightEntry, setInsights } from "@/store/insightsSlice";
import { getInsights } from "@/lib/api";

// --- Types ---
export interface Insight {
    id: string;
    type: "system" | "ai" | "psychologist";
    title: string;
    preview: string;
    content: string;
    category: string;
    timestamp: string;
    isRead: boolean;
    isNew?: boolean;
}

// --- Helper Functions ---
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDate(dateString);
};

const mockInsights: Insight[] = [];

// --- Main Component ---
export default function InsightsPage() {
    const dispatch = useDispatch<AppDispatch>(); // ✅ Usar AppDispatch
    const insights = useSelector((state: RootState) => state.insights?.insights || []);
    const isClient = typeof window !== 'undefined';
    const [userId] = useState(1);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Hoisted function so it can be called from useEffect without being accessed before declaration.
    async function loadInsightsFromAPI() {
        try {
            const data = await getInsights({ user_id: userId });
            
            const formattedInsights = Array.isArray(data) ? data.map((item: unknown) => {
                const row = item as Record<string, unknown>;
                return {
                    id: String(row['insight_id']),
                    type: "psychologist",
                    title: `Insight from ${String(row['first_name'] || 'Professional')}`,
                    preview: row['content'] ? String(row['content']).slice(0, 150) + '...' : 'No content',
                    content: String(row['content'] || ''),
                    category: String(row['category'] || 'General'),
                    timestamp: String(row['created_at'] || new Date().toISOString()),
                    isRead: false,
                    isNew: true,
                } as Insight;
            }) : [];

            if (formattedInsights.length > 0) {
                dispatch(setInsights(formattedInsights));
            } else if (insights.length === 0) {
                dispatch(setInsights(mockInsights));
            }
        } catch (error) {
            console.error("Error loading insights:", error);
            if (insights.length === 0) {
                dispatch(setInsights(mockInsights));
            }
        }
    }

     
    useEffect(() => {
        // Schedule the loader asynchronously to avoid synchronous setState inside the effect
        Promise.resolve().then(loadInsightsFromAPI);
    }, []);

    // ✅ Función para eliminar un insight - Corregida
    const handleDeleteInsight = async (id: string) => {
        if (isDeleting) return;
        
        if (!window.confirm("Are you sure you want to delete this insight?")) {
            return;
        }

        setIsDeleting(true);
        setDeleteError(null);

        try {
            const insightId = parseInt(id);
            // ✅ Despachar correctamente
            await dispatch(deleteInsightEntry(insightId)).unwrap();
            
            // ✅ Recargar la lista después de eliminar
            await loadInsightsFromAPI();
            
            alert("✅ Insight deleted successfully");
        } catch (error: any) {
            console.error("Error deleting insight:", error);
            setDeleteError(error.message || "Failed to delete insight. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // ✅ Asegurar que displayInsights siempre sea un array
    const displayInsights = Array.isArray(insights) && insights.length > 0 ? insights : mockInsights;

    const getTypeLabel = (type: Insight["type"]) => {
        switch (type) {
            case "psychologist": return "Psychologist";
            case "ai": return "AI Insight";
            case "system": return "System";
            default: return "Update";
        }
    };

    const sortedInsights = [...displayInsights].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                        Insights Inbox
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                <div className="mb-8">
                    <h2 className="text-naranja-Title">Professional Guidance</h2>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                            Insights Inbox
                        </h1>
                        {displayInsights.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                {displayInsights.length}
                            </span>
                        )}
                    </div>
                </div>

                {deleteError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {deleteError}
                        <button 
                            onClick={() => setDeleteError(null)}
                            className="ml-3 text-red-600 hover:text-red-800 font-medium"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
                    {sortedInsights.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-slate-400">No insights yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {sortedInsights.map((insight) => (
                                <div key={insight.id} className="card-dark">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-naranja-brillante">
                                                    {insight.title}
                                                </h2>
                                            </div>
                                            <p className="text-sm line-clamp-2 mt-0.5 text-white/80">
                                                {insight.preview}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-xs text-white/40">
                                                    {getTypeLabel(insight.type)}
                                                </span>
                                                <span className="text-xs text-white/40">
                                                    {getTimeAgo(insight.timestamp)}
                                                </span>
                                                <span className="text-xs text-white/40">
                                                    {insight.category}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteInsight(insight.id)}
                                            disabled={isDeleting}
                                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Delete insight"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}