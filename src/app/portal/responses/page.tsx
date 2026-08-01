// app/portal/responses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/index";
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
    const [professionalId] = useState(10); // TODO: Obtener del usuario logueado
    const insights = useSelector((state: RootState) => state.insights?.insights || []);
    const sentInsights = insights.filter((i) => i.type === "psychologist");

    useEffect(() => {
        const loadResponses = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getResponses(professionalId);
                setResponses(data);
            } catch (err) {
                console.error("Error loading responses:", err);
                setError("Failed to load responses. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        loadResponses();
    }, [professionalId]);

    const allResponses = [
        ...responses,
        ...sentInsights.map((insight) => ({
            id: parseInt(insight.id || String(insight.insight_id)) || 0,
            reflection_id: insight.checkin_id || 0,
            user_id: insight.user_id || "Unknown",
            reflection_text: insight.content?.split("\n\n")[0]?.replace("**User Reflection:**\n", "") || "",
            insight_text: insight.content || "",
            category: insight.category?.toUpperCase() || "GENERAL",
            response_date: insight.timestamp || new Date().toISOString(),
        })),
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1C1A17]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                    <p className="text-white/40">Loading responses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1C1A17]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-sm text-amber-500/60">Sodade Pro</p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                                Dr. Verified Provider
                            </h1>
                            <p className="text-sm text-white/40">My Responses</p>
                        </div>
                        <span className="text-sm text-white/40">{allResponses.length} responses</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                        <button onClick={loadResponses} className="ml-3 text-red-400 hover:text-red-300 font-medium">
                            Retry
                        </button>
                    </div>
                )}

                {/* Responses List */}
                <div className="space-y-4 md:space-y-6">
                    {allResponses.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 bg-[#2A2824] rounded-2xl border border-white/10">
                            <p className="text-white/40">No responses yet. Start by sending insights from Community Needs.</p>
                        </div>
                    ) : (
                        allResponses.map((response) => (
                            <div key={response.id} className="bg-[#2A2824] rounded-2xl border border-white/10 overflow-hidden">
                                <div className="p-4 sm:p-5 md:p-6">
                                    {/* Original Reflection */}
                                    <div className="mb-4">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-amber-400/60">ORIGINAL REFLECTION</span>
                                            <span className="text-xs text-white/20">•</span>
                                            <span className="text-xs text-white/30">{formatDate(response.response_date)}</span>
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">
                                            {response.reflection_text || "No reflection text available"}
                                        </p>
                                    </div>

                                    {/* Your Insight */}
                                    <div className="bg-[#1C1A17] rounded-xl p-3 sm:p-4 border border-white/5">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-amber-400/80">YOUR INSIGHT</span>
                                            <span className="text-[10px] font-medium text-amber-400/60 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                {response.category || "GENERAL"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed">
                                            {response.insight_text || "No insight text available"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}