// app/portal/responses/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectAllInsights } from "@/store/insightsSlice";
import { getResponses, PsychologistResponse } from "@/lib/api";

// --- Helper Functions ---
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

// --- Main Component ---
export default function MyResponsesPage() {
    const [responses, setResponses] = useState<PsychologistResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [professionalId] = useState(10); // user_id del profesional
    // Minimal shape for insights items from the store to avoid `any`
    type MinimalInsight = {
        id?: string | number;
        insight_id?: string | number;
        checkin_id?: number;
        user_id?: number | string;
        content?: string;
        category?: string;
        timestamp?: string;
        type?: string;
    };

    // ✅ Obtener insights de Redux
    const insights = useSelector(selectAllInsights) as MinimalInsight[];
    const sentInsights = insights.filter((i) => i.type === "psychologist");

     
    const loadResponses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getResponses(professionalId);
            setResponses(data);
        } catch (err: unknown) {
            console.error('Error loading responses:', err);
            setError('Failed to load responses. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [professionalId]);

    useEffect(() => {
        // Defer so loadResponses doesn't synchronously call setState in the effect
        Promise.resolve().then(loadResponses);
    }, [loadResponses]);

    // ✅ Combinar respuestas de la API con insights de Redux
    const allResponses = [
        ...responses,
        ...sentInsights.map((insight: MinimalInsight) => ({
            id: parseInt(String(insight.id ?? insight.insight_id ?? 0)) || 0,
            reflection_id: insight.checkin_id ?? 0,
            user_id: insight.user_id ?? "Unknown",
            reflection_text: (insight.content ?? "").toString().split("\n\n")[0]?.replace("**User Reflection:**\n", "") || "",
            insight_text: (insight.content ?? "").toString(),
            category: (insight.category ?? "GENERAL").toString().toUpperCase(),
            response_date: insight.timestamp ?? new Date().toISOString(),
        })),

    ];

    console.log('📊 Total responses:', allResponses.length);
    console.log('📊 From API:', responses.length);
    console.log('📊 From Insights:', sentInsights.length);

    if (loading) {
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="mb-6 md:mb-8">
                    <p className="text-sm text-[#6C757D]">Sodade Pro</p>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">My Responses</h1>
                    <p className="text-sm text-[#6C757D]">A history of the guidance you have provided.</p>
                </div>
                <div className="text-center py-8 sm:py-12">
                    <p className="text-[#6C757D]">Loading responses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <p className="text-sm text-[#6C757D]">Sodade Pro</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">
                            Dr. Verified Provider
                        </h1>
                        <p className="text-sm text-[#6C757D]">My Responses</p>
                    </div>
                    <span className="text-sm text-[#6C757D]">{allResponses.length} responses</span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                    <button 
                        onClick={loadResponses}
                        className="ml-3 text-red-600 hover:text-red-800 font-medium"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Responses List */}
            <div className="space-y-4 md:space-y-6">
                {allResponses.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-[#FFFFFF] rounded-2xl border border-[#F4F4F4]">
                        <p className="text-[#6C757D]">No responses yet. Start by sending insights from Community Needs.</p>
                    </div>
                ) : (
                    allResponses.map((response) => (
                        <div key={response.id} className="bg-[#FFFFFF] rounded-2xl shadow-lg border border-[#F4F4F4] overflow-hidden">
                            <div className="p-4 sm:p-5 md:p-6">
                                {/* Original Reflection */}
                                <div className="mb-4">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-xs font-medium text-[#6C757D]">ORIGINAL REFLECTION</span>
                                        <span className="text-xs text-[#6C757D]/30">•</span>
                                        <span className="text-xs text-[#6C757D]">{formatDate(response.response_date)}</span>
                                    </div>
                                    <p className="text-sm text-[#333333] leading-relaxed">
                                        {response.reflection_text || "No reflection text available"}
                                    </p>
                                </div>

                                {/* Your Insight */}
                                <div className="bg-[#F4F4F4] rounded-xl p-3 sm:p-4 border border-[#6C757D]/10">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-xs font-medium text-[#007BFF]">YOUR INSIGHT</span>
                                        <span className="text-[10px] font-medium text-[#007BFF] bg-[#007BFF]/10 px-2 py-0.5 rounded-full border border-[#007BFF]/30">
                                            {response.category || "GENERAL"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#333333] leading-relaxed">
                                        {response.insight_text || "No insight text available"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}