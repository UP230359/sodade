// app/portal/verification/page.tsx - Verification Status
"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/index";
import Link from "next/link";

// --- Main Component ---
export default function VerificationPage() {
    const [isClient, setIsClient] = useState(false);
    const insights = useSelector((state: RootState) => state.insights?.insights || []);
    const sentInsights = insights.filter((i: any) => i.type === "psychologist").length;

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="min-h-screen bg-[#FFFFFF]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">Verification Status</h1>
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
                        <div className="text-right">
                            <span className="text-sm text-[#6C757D]">Insights sent</span>
                            <p className="text-xl font-bold text-[#007BFF]">{sentInsights}</p>
                        </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex items-center gap-6 mt-4 border-b border-[#F4F4F4] pb-2">
                        <Link href="/portal" className="text-sm text-[#6C757D] hover:text-[#333333] transition-colors">
                            Anonymous Feed
                        </Link>
                        <Link href="/portal/responses" className="text-sm text-[#6C757D] hover:text-[#333333] transition-colors">
                            My Responses
                        </Link>
                        <span className="text-sm text-[#007BFF] border-b-2 border-[#007BFF] pb-2 -mb-[10px]">
                            Verification Status
                        </span>
                    </div>
                </div>

                {/* Verified Status */}
                <div className="bg-[#FFFFFF] rounded-2xl shadow-lg border border-[#F4F4F4] overflow-hidden mb-6">
                    <div className="p-5 md:p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-[#28A745]/10 flex items-center justify-center">
                                <svg className="h-5 w-5 text-[#28A745]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-medium text-[#333333]">Account Verified</h2>
                                <p className="text-sm text-[#6C757D]">Your professional credentials have been successfully reviewed.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Credential Details */}
                <div className="bg-[#FFFFFF] rounded-2xl shadow-lg border border-[#F4F4F4] overflow-hidden">
                    <div className="p-5 md:p-6">
                        <h3 className="text-sm font-medium text-[#6C757D] mb-4">CREDENTIAL DETAILS</h3>
                        
                        <div className="space-y-4">
                            {/* Status */}
                            <div className="flex items-center justify-between pb-4 border-b border-[#F4F4F4]">
                                <span className="text-sm text-[#6C757D]">Status</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#28A745]/10 text-[#28A745] border border-[#28A745]/30">
                                    ACTIVE
                                </span>
                            </div>

                            {/* Professional Cedula */}
                            <div className="flex items-center justify-between pb-4 border-b border-[#F4F4F4]">
                                <span className="text-sm text-[#6C757D]">Professional Cedula</span>
                                <span className="text-sm text-[#333333] font-mono">8945-XYZ-2023</span>
                            </div>

                            {/* Primary Specialty */}
                            <div className="flex items-center justify-between pb-4 border-b border-[#F4F4F4]">
                                <span className="text-sm text-[#6C757D]">Primary Specialty</span>
                                <span className="text-sm text-[#333333]">Clinical Psychology</span>
                            </div>

                            {/* Verification Date */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#6C757D]">Verification Date</span>
                                <span className="text-sm text-[#333333]">July 10, 2026</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Note */}
                <div className="mt-6 bg-[#F4F4F4]/50 rounded-xl p-4 border border-[#6C757D]/10">
                    <p className="text-xs text-[#6C757D] leading-relaxed">
                        Your identity is kept separate from your interactions in the Anonymous Feed. 
                        Users only see that a "Verified Professional" has responded to their reflections.
                    </p>
                </div>
            </div>
        </div>
    );
}