// app/portal/community/page.tsx - Community Needs
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addInsight } from "@/store/insightsSlice";
import { RootState } from "@/store/index";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

// --- Types ---
interface Reflection {
    id: string;
    userId: string;
    content: string;
    category: "anxiety" | "sadness" | "stress" | "anger" | "calm";
    timestamp: string;
    status: "pending" | "draft" | "sent";
    draftRecommendation?: string;
    tag?: string;
}

// --- Helper Functions ---
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

const getCategoryColor = (category: Reflection["category"]) => {
    switch (category) {
        case "anxiety": return "bg-[#28A745]/10 text-[#28A745] border-[#28A745]/30";
        case "sadness": return "bg-[#007BFF]/10 text-[#007BFF] border-[#007BFF]/30";
        case "stress": return "bg-[#DC3545]/10 text-[#DC3545] border-[#DC3545]/30";
        case "anger": return "bg-[#DC3545]/10 text-[#DC3545] border-[#DC3545]/30";
        case "calm": return "bg-[#28A745]/10 text-[#28A745] border-[#28A745]/30";
        default: return "bg-[#6C757D]/10 text-[#6C757D] border-[#6C757D]/30";
    }
};

const getCategoryLabel = (category: Reflection["category"]) => {
    switch (category) {
        case "anxiety": return "Anxiety";
        case "sadness": return "Sadness";
        case "stress": return "Stress";
        case "anger": return "Anger";
        case "calm": return "Calm";
        default: return "General";
    }
};

// --- Mock Data ---
const mockReflections: Reflection[] = [
    {
        id: "1",
        userId: "88849",
        content: 'I have been feeling completely overwhelmed at work lately. No matter how much I get done, it feels like the pile just gets bigger. I am having trouble sleeping because my mind won\'t shut off."',
        category: "anxiety",
        timestamp: "2026-07-23T10:30:00Z",
        status: "pending",
        draftRecommendation: "Try grounding techniques when feeling overwhelmed...",
        tag: "Grounding",
    },
    {
        id: "2",
        userId: "81022",
        content: 'I feel so sad and lonely. I moved to a new city and haven\'t made any friends yet. I feel guilty for feeling this way."',
        category: "sadness",
        timestamp: "2026-07-23T08:15:00Z",
        status: "pending",
        draftRecommendation: "",
    },
];

// --- Main Component ---
export default function CommunityPage() {
    const dispatch = useDispatch();
    const insights = useSelector((state: RootState) => state.insights?.insights || []);
    const [isClient, setIsClient] = useState(false);
    const [reflections, setReflections] = useState<Reflection[]>(mockReflections);
    const [filter, setFilter] = useState<"all" | Reflection["category"]>("all");
    const [sort, setSort] = useState<"newest" | "oldest">("newest");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftText, setDraftText] = useState("");
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        setIsClient(true);
    }, []);

    const unreadCount = insights.filter((i: any) => !i.isRead).length;

    const filteredReflections = reflections
        .filter((r) => filter === "all" || r.category === filter)
        .sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return sort === "newest" ? dateB - dateA : dateA - dateB;
        });

    const handleSaveDraft = (id: string) => {
        setReflections((prev) =>
            prev.map((r) =>
                r.id === id
                    ? { ...r, draftRecommendation: draftText, status: "draft", tag: tagInput || r.tag }
                    : r
            )
        );
        setEditingId(null);
        setDraftText("");
        setTagInput("");
    };

    const handleSendInsight = (id: string) => {
        const reflection = reflections.find((r) => r.id === id);
        if (!reflection || !reflection.draftRecommendation) return;

        const newInsight = {
            id: `insight-${Date.now()}`,
            type: "psychologist" as const,
            title: `Response to User ${reflection.userId}`,
            preview: reflection.draftRecommendation.slice(0, 150) + "...",
            content: `**User Reflection:**\n${reflection.content}\n\n**Psychologist Response:**\n${reflection.draftRecommendation}\n\n— ${reflection.tag ? `Tag: ${reflection.tag}` : ""}`,
            category: getCategoryLabel(reflection.category),
            timestamp: new Date().toISOString(),
            isRead: false,
            isNew: true,
        };

        dispatch(addInsight(newInsight));

        setReflections((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, status: "sent" } : r
            )
        );
        setEditingId(null);
        setDraftText("");
        setTagInput("");
    };

    const handleEditDraft = (reflection: Reflection) => {
        setEditingId(reflection.id);
        setDraftText(reflection.draftRecommendation || "");
        setTagInput(reflection.tag || "");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setDraftText("");
        setTagInput("");
    };

    if (!isClient) {
        return (
            <div className="min-h-screen bg-[#FFFFFF]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">Community Needs</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#6C757D]">Psychologist Dashboard</p>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">Community Needs</h1>
                            </div>
                            <p className="text-sm text-[#6C757D]">Review anonymous reflections and offer guidance.</p>
                        </div>
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#007BFF]/10 text-[#007BFF] border border-[#007BFF]/30">
                                {unreadCount} insights sent
                            </span>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[#6C757D]">Filter:</span>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as typeof filter)}
                            className="px-3 py-1.5 rounded-lg border border-[#6C757D]/30 bg-[#FFFFFF] text-[#333333] text-sm focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
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
                            className="px-3 py-1.5 rounded-lg border border-[#6C757D]/30 bg-[#FFFFFF] text-[#333333] text-sm focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                    </div>
                </div>

                {/* Reflections List */}
                <div className="space-y-4">
                    {filteredReflections.map((reflection) => {
                        const isEditing = editingId === reflection.id;
                        const categoryColor = getCategoryColor(reflection.category);

                        return (
                            <div key={reflection.id} className="bg-[#FFFFFF] rounded-2xl shadow-lg border border-[#F4F4F4] overflow-hidden">
                                <div className="p-5 md:p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColor}`}>
                                                {reflection.category.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-[#6C757D]">User ID: {reflection.userId}</span>
                                            <span className="text-xs text-[#6C757D]">{getTimeAgo(reflection.timestamp)}</span>
                                        </div>
                                        {reflection.status === "sent" && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#28A745]/10 text-[#28A745] border border-[#28A745]/30">
                                                Sent
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <p className="text-sm text-[#333333] leading-relaxed mb-3">{reflection.content}</p>

                                    {/* Verification Status */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs text-[#6C757D]">Verification Status</span>
                                        <span className="w-2 h-2 rounded-full bg-[#28A745]"></span>
                                        <span className="text-xs text-[#28A745]">Verified</span>
                                    </div>

                                    {/* Draft Recommendation */}
                                    {isEditing ? (
                                        <div className="mt-3 space-y-3">
                                            <Textarea
                                                value={draftText}
                                                onChange={(e) => setDraftText(e.target.value)}
                                                placeholder="Write your recommendation..."
                                                className="min-h-[80px]"
                                            />
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    placeholder="Attach Tag: Grounding"
                                                    className="flex-1 px-3 py-2 rounded-lg border border-[#6C757D]/30 text-[#333333] text-sm focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={handleCancelEdit} className="px-4 py-2 rounded-lg border border-[#6C757D]/30 text-[#6C757D] hover:bg-[#F4F4F4] transition-colors text-sm font-medium">
                                                        Cancel
                                                    </button>
                                                    <button onClick={() => handleSaveDraft(reflection.id)} className="px-4 py-2 rounded-lg border border-[#6C757D]/30 text-[#6C757D] hover:bg-[#F4F4F4] transition-colors text-sm font-medium">
                                                        Save Draft
                                                    </button>
                                                    <button onClick={() => handleSendInsight(reflection.id)} className="px-4 py-2 rounded-lg bg-[#007BFF] text-white hover:bg-[#007BFF]/90 transition-colors text-sm font-medium">
                                                        Send Insight
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {reflection.draftRecommendation && (
                                                <div className="bg-[#F4F4F4] rounded-xl p-3 mb-3 border border-[#6C757D]/10">
                                                    <p className="text-xs text-[#6C757D] font-medium mb-1">DRAFT RECOMMENDATION</p>
                                                    <p className="text-sm text-[#333333]">{reflection.draftRecommendation}</p>
                                                    {reflection.tag && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#007BFF]/10 text-[#007BFF] border border-[#007BFF]/30 mt-2">
                                                            {reflection.tag}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {reflection.status !== "sent" && (
                                                <button onClick={() => handleEditDraft(reflection)} className="px-4 py-2 rounded-lg border border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF]/10 transition-colors text-sm font-medium">
                                                    Respond to this reflection
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}