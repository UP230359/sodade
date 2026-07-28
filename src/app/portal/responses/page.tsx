// app/portal/responses/page.tsx - My Responses
"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/index";
import Link from "next/link";

// --- Types ---
interface Response {
    id: string;
    reflection: string;
    insight: string;
    category: string;
    date: string;
    userId: string;
}

// --- Helper Functions ---
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

// --- Mock Data ---
const mockResponses: Response[] = [
    {
        id: "mock-1",
        userId: "88934",
        reflection: '"I keep snapping at my family even though I don\'t mean to. The stress from my new job is spilling over and I feel terrible about it."',
        insight: "It is very common for professional stress to bleed into our safe spaces. Acknowledge this transition period. Try implementing a 10-minute 'buffer' routine between finishing work and engaging with your family—like a short walk or simply sitting quietly. This helps signal to your nervous system that the work day is over.",
        category: "BOUNDARY SETTING",
        date: "2026-07-18T10:00:00Z",
    },
    {
        id: "mock-2",
        userId: "77421",
        reflection: '"Woke up feeling completely paralyzed by anxiety today. Couldn\'t even bring myself to check my emails."',
        insight: "When anxiety feels paralyzing, the mind is moving too far into the future. Bring it back to the immediate present. Try the 5-4-3-2-1 technique right where you are sitting, or simply focus on the physical sensation of your feet on the floor. You don't have to tackle the whole day right now, just the next five minutes.",
        category: "GROUNDING",
        date: "2026-07-15T14:30:00Z",
    },
];

// --- Main Component ---
export default function MyResponsesPage() {
    const [isClient, setIsClient] = useState(false);
    const insights = useSelector((state: RootState) => state.insights?.insights || []);
    const sentInsights = insights.filter((i: any) => i.type === "psychologist");

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="min-h-screen bg-[#FFFFFF]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">My Responses</h1>
                </div>
            </div>
        );
    }

    // Combine mock responses with insights from Redux - usando keys únicas
    const allResponses = [
        ...mockResponses,
        ...sentInsights.map((insight: any) => ({
            id: `insight-${insight.id}`,
            userId: insight.title.replace("Response to User ", ""),
            reflection: insight.content.split("\n\n")[0]?.replace("**User Reflection:**\n", "") || "",
            insight: insight.content.split("\n\n")[1]?.replace("**Psychologist Response:**\n", "") || "",
            category: insight.category.toUpperCase(),
            date: insight.timestamp,
        })),
    ];

    return (
        <div className="min-h-screen bg-[#FFFFFF]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#6C757D]">Sodade Pro</p>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">
                                    Dr. Verified Provider
                                </h1>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#28A745]/10 text-[#28A745] border border-[#28A745]/30">
                                    Verified
                                </span>
                            </div>
                        </div>
                        <Link 
                            href="/insights"
                            className="text-sm text-[#007BFF] hover:text-[#007BFF]/80 transition-colors"
                        >
                            View Insights Inbox →
                        </Link>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex items-center gap-6 mt-4 border-b border-[#F4F4F4] pb-2">
                        <Link href="/portal" className="text-sm text-[#6C757D] hover:text-[#333333] transition-colors">
                            Anonymous Feed
                        </Link>
                        <span className="text-sm text-[#007BFF] border-b-2 border-[#007BFF] pb-2 -mb-[10px]">
                            My Responses
                        </span>
                        <Link href="/portal/verification" className="text-sm text-[#6C757D] hover:text-[#333333] transition-colors">
                            Verification Status
                        </Link>
                    </div>
                </div>

                {/* Title */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-medium text-[#333333]">My Responses</h2>
                            <p className="text-sm text-[#6C757D]">A history of the guidance you have provided.</p>
                        </div>
                        <span className="text-sm text-[#6C757D]">{allResponses.length} responses</span>
                    </div>
                </div>

                {/* Responses List */}
                <div className="space-y-6">
                    {allResponses.length === 0 ? (
                        <div className="text-center py-12 bg-[#F4F4F4] rounded-2xl border border-[#6C757D]/10">
                            <p className="text-[#6C757D]">No responses yet. Start by sending insights from Community Needs.</p>
                        </div>
                    ) : (
                        allResponses.map((response) => (
                            <div key={response.id} className="bg-[#FFFFFF] rounded-2xl shadow-lg border border-[#F4F4F4] overflow-hidden">
                                <div className="p-5 md:p-6">
                                    {/* Original Reflection */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-[#6C757D]">ORIGINAL REFLECTION</span>
                                            <span className="text-xs text-[#6C757D]/30">•</span>
                                            <span className="text-xs text-[#6C757D]">{formatDate(response.date)}</span>
                                        </div>
                                        <p className="text-sm text-[#333333] leading-relaxed">
                                            {response.reflection}
                                        </p>
                                    </div>

                                    {/* Your Insight */}
                                    <div className="bg-[#F4F4F4] rounded-xl p-4 border border-[#6C757D]/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-[#007BFF]">YOUR INSIGHT</span>
                                            <span className="text-[10px] font-medium text-[#007BFF] bg-[#007BFF]/10 px-2 py-0.5 rounded-full border border-[#007BFF]/30">
                                                {response.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#333333] leading-relaxed">
                                            {response.insight}
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