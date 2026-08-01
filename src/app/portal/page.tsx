// app/portal/community/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/index";
import { createInsightEntry } from "@/store/insightsSlice";
import { getReflections, updateReflection, Reflection } from "@/lib/api";
import Textarea from "@/components/ui/Textarea";

const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHr < 24) return `${diffHr} hours ago`;
    if (diffDay < 7) return `${diffDay} days ago`;
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};

const getCategoryColor = (category: string) => {
    switch (category) {
        case "anxiety": return "bg-orange-100 text-orange-700 border-orange-200";
        case "sadness": return "bg-blue-100 text-blue-700 border-blue-200";
        case "stress": return "bg-red-100 text-red-700 border-red-200";
        case "anger": return "bg-rose-100 text-rose-700 border-rose-200";
        case "calm": return "bg-green-100 text-green-700 border-green-200";
        default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

export default function CommunityPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [reflections, setReflections] = useState<Reflection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | Reflection["category"]>("all");
    const [sort, setSort] = useState<"newest" | "oldest">("newest");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [draftText, setDraftText] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [professionalId] = useState(10);
    const [isSending, setIsSending] = useState(false);

    const loadReflections = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getReflections({
                category: filter === "all" ? undefined : filter,
                sort: sort === "newest" ? "DESC" : "ASC",
            });
            setReflections(data);
        } catch (err) {
            console.error("Error loading reflections:", err);
            setError("Failed to load reflections. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [filter, sort]);

    useEffect(() => {
        // Defer so setState inside loadReflections isn't called synchronously in this effect
        Promise.resolve().then(loadReflections);
    }, [loadReflections]);

    const handleSendInsight = async (reflection: Reflection) => {
        if (!draftText.trim()) {
            setError("Please write a recommendation before sending.");
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const payload = {
                checkin_id: reflection.checkin_id || 1,
                professional_id: professionalId,
                tag_id: null,
                content: draftText.trim(),
            };

            await dispatch(createInsightEntry(payload)).unwrap();
            
            await updateReflection(reflection.id, {
                draft_recommendation: draftText.trim(),
                tag: tagInput.trim() || undefined,
                status: "sent",
            });

            await loadReflections();
            setEditingId(null);
            setDraftText("");
            setTagInput("");
            
            alert(`✅ Insight sent to user ${reflection.user_id}`);
        } catch (err) {
            console.error("Error sending insight:", err);
            setError("Failed to send insight. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const handleEditDraft = (reflection: Reflection) => {
        setEditingId(reflection.id);
        setDraftText(reflection.draft_recommendation || "");
        setTagInput(reflection.tag || "");
        setError(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setDraftText("");
        setTagInput("");
        setError(null);
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="mb-6 md:mb-8">
                    <p className="text-sm text-[#6C757D]">Psychologist Dashboard</p>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">Community Needs</h1>
                    <p className="text-sm text-[#6C757D]">Review anonymous reflections and offer guidance.</p>
                </div>
                <div className="text-center py-8 sm:py-12">
                    <p className="text-[#6C757D]">Loading reflections...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-6 md:mb-8">
                <p className="text-sm text-[#6C757D]">Psychologist Dashboard</p>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">Community Needs</h1>
                <p className="text-sm text-[#6C757D]">Review anonymous reflections and offer guidance.</p>
            </div>

            {error && (
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                    <button 
                        onClick={loadReflections}
                        className="ml-3 text-red-600 hover:text-red-800 font-medium"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#6C757D]">Filter:</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as typeof filter)}
                        className="px-2 sm:px-3 py-1.5 rounded-lg border border-[#6C757D]/30 bg-[#FFFFFF] text-[#333333] text-sm focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                    >
                        <option value="all">All</option>
                        <option value="anxiety">High Anxiety</option>
                        <option value="sadness">Sadness</option>
                        <option value="stress">Stress</option>
                        <option value="anger">Anger</option>
                        <option value="calm">Calm</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#6C757D]">Sort:</span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as typeof sort)}
                        className="px-2 sm:px-3 py-1.5 rounded-lg border border-[#6C757D]/30 bg-[#FFFFFF] text-[#333333] text-sm focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
                {reflections.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-[#FFFFFF] rounded-2xl border border-[#F4F4F4]">
                        <p className="text-[#6C757D]">No reflections available</p>
                    </div>
                ) : (
                    reflections.map((reflection) => {
                        const isEditing = editingId === reflection.id;
                        const categoryColor = getCategoryColor(reflection.category);

                        return (
                            <div key={reflection.id} className="bg-[#FFFFFF] rounded-2xl shadow-lg border border-[#F4F4F4] overflow-hidden">
                                <div className="p-4 sm:p-5 md:p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${categoryColor}`}>
                                                {reflection.category.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-[#6C757D]">User ID: {reflection.user_id}</span>
                                            <span className="text-xs text-[#6C757D]">{getTimeAgo(reflection.timestamp)}</span>
                                        </div>
                                        {reflection.status === "sent" && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#28A745]/10 text-[#28A745] border border-[#28A745]/30">
                                                Sent ✓
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-[#333333] leading-relaxed mb-3">
                                        {reflection.content}
                                    </p>

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs text-[#6C757D]">Verification Status</span>
                                        <span className="w-2 h-2 rounded-full bg-[#28A745]"></span>
                                        <span className="text-xs text-[#28A745]">Verified</span>
                                    </div>

                                    {isEditing ? (
                                        <div className="mt-3 space-y-3">
                                            <Textarea
                                                value={draftText}
                                                onChange={(e) => setDraftText(e.target.value)}
                                                placeholder="Write your recommendation..."
                                                className="min-h-[80px]"
                                            />
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                                <input
                                                    type="text"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    placeholder="Attach Tag: Grounding"
                                                    className="flex-1 px-3 py-2 rounded-lg border border-[#6C757D]/30 text-[#333333] text-sm focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                                                />
                                                <div className="flex flex-wrap gap-2">
                                                    <button 
                                                        onClick={handleCancelEdit} 
                                                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg border border-[#6C757D]/30 text-[#6C757D] hover:bg-[#F4F4F4] transition-colors text-sm font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSendInsight(reflection)} 
                                                        disabled={isSending || !draftText.trim()}
                                                        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg bg-[#007BFF] text-white hover:bg-[#007BFF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                                    >
                                                        {isSending ? "Sending..." : "Send Insight"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {reflection.draft_recommendation && (
                                                <div className="bg-[#F4F4F4] rounded-xl p-3 mb-3 border border-[#6C757D]/10">
                                                    <p className="text-xs text-[#6C757D] font-medium mb-1">DRAFT RECOMMENDATION</p>
                                                    <p className="text-sm text-[#333333]">{reflection.draft_recommendation}</p>
                                                    {reflection.tag && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#007BFF]/10 text-[#007BFF] border border-[#007BFF]/30 mt-2">
                                                            {reflection.tag}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {reflection.status !== "sent" && (
                                                <button 
                                                    onClick={() => handleEditDraft(reflection)} 
                                                    className="w-full sm:w-auto px-4 py-2 rounded-lg border border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF]/10 transition-colors text-sm font-medium"
                                                >
                                                    Respond to this reflection
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}