// app/portal/verification/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getVerificationStatus } from "@/lib/api";

export default function VerificationPage() {
    type Verification = {
        verified?: boolean;
        verification_status?: string;
        professional_cedula?: string;
        primary_specialty?: string;
        verification_date?: string;
    } | null;

    const [verification, setVerification] = useState<Verification>(null);
    const [loading, setLoading] = useState(true);
    const [userId] = useState(10); // Temporal: usuario profesional de prueba

    // Hoisted to avoid "accessed before it is declared" when used in useEffect.
    async function loadVerification() {
        setLoading(true);
        try {
            const data = await getVerificationStatus(userId);
            setVerification(data as Verification);
        } catch (error) {
            console.error("Error loading verification:", error);
        } finally {
            setLoading(false);
        }
    }

     
    useEffect(() => {
        // Defer to avoid synchronous setState in the effect body
        Promise.resolve().then(loadVerification);
    }, []);

    if (loading) {
        return (
            <div className="p-6 md:p-8">
                <p className="text-[#6C757D]">Loading verification status...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <p className="text-sm text-[#6C757D]">Sodade Pro</p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">
                    Dr. Verified Provider
                </h1>
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
                            <h2 className="text-lg font-medium text-[#333333]">
                                {verification?.verified ? "Account Verified" : "Account Not Verified"}
                            </h2>
                            <p className="text-sm text-[#6C757D]">
                                {verification?.verified 
                                    ? "Your professional credentials have been successfully reviewed." 
                                    : "Your professional credentials are pending review."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credential Details */}
            {verification?.verified && (
                <div className="bg-[#FFFFFF] rounded-2xl shadow-lg border border-[#F4F4F4] overflow-hidden">
                    <div className="p-5 md:p-6">
                        <h3 className="text-sm font-medium text-[#6C757D] mb-4">CREDENTIAL DETAILS</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-[#F4F4F4]">
                                <span className="text-sm text-[#6C757D]">Status</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#28A745]/10 text-[#28A745] border border-[#28A745]/30">
                                    {verification?.verification_status?.toUpperCase() || "PENDING"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pb-4 border-b border-[#F4F4F4]">
                                <span className="text-sm text-[#6C757D]">Professional Cedula</span>
                                <span className="text-sm text-[#333333] font-mono">
                                    {verification?.professional_cedula || "Not specified"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pb-4 border-b border-[#F4F4F4]">
                                <span className="text-sm text-[#6C757D]">Primary Specialty</span>
                                <span className="text-sm text-[#333333]">
                                    {verification?.primary_specialty || "Not specified"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#6C757D]">Verification Date</span>
                                <span className="text-sm text-[#333333]">
                                    {verification?.verification_date 
                                        ? new Date(verification.verification_date).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "Not verified yet"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Note */}
            <div className="mt-6 bg-[#F4F4F4]/50 rounded-xl p-4 border border-[#6C757D]/10">
                <p className="text-xs text-[#6C757D] leading-relaxed">
                    Your identity is kept separate from your interactions in the Anonymous Feed.
                    Users only see that a &quot;Verified Professional&quot; has responded to their reflections.
                </p>
            </div>
        </div>
    );
}