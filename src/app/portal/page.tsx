// src/app/portal/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/index";

export default function PortalDashboard() {
    const insights = useSelector((state: RootState) => state.insights?.insights || []);
    const unreadCount = insights.filter((i: any) => !i.isRead).length;
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPatients: 12,
        pendingResponses: 3,
        activeSessions: 2,
    });

    const loadDashboardData = useCallback(async () => {
        // Simular carga
        setLoading(true);
        try {
            // Aquí podrías hacer fetch a la API para obtener estadísticas reales
            await new Promise((resolve) => setTimeout(resolve, 500));
            setStats({
                totalPatients: 12,
                pendingResponses: 3,
                activeSessions: 2,
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    if (loading) {
        return <div className="p-6">Loading dashboard...</div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-8">
                <p className="text-sm text-[#6C757D]">Psychologist Dashboard</p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#333333]">Dashboard</h1>
                <p className="text-sm text-[#6C757D]">Welcome back, Dr. Chen</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-[#F4F4F4] p-6">
                    <p className="text-sm text-[#6C757D]">Total Patients</p>
                    <p className="text-3xl font-bold text-[#333333] mt-1">{stats.totalPatients}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-[#F4F4F4] p-6">
                    <p className="text-sm text-[#6C757D]">Pending Responses</p>
                    <p className="text-3xl font-bold text-[#007BFF] mt-1">{stats.pendingResponses}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-[#F4F4F4] p-6">
                    <p className="text-sm text-[#6C757D]">Unread Insights</p>
                    <p className="text-3xl font-bold text-[#28A745] mt-1">{unreadCount}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-[#F4F4F4] p-6">
                    <p className="text-sm text-[#6C757D]">Active Sessions</p>
                    <p className="text-3xl font-bold text-[#333333] mt-1">{stats.activeSessions}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/portal/community" className="bg-white rounded-2xl shadow-lg border border-[#F4F4F4] p-6 hover:shadow-xl transition-shadow">
                    <h3 className="font-medium text-[#333333]">🌱 Community Needs</h3>
                    <p className="text-sm text-[#6C757D] mt-1">Review anonymous reflections</p>
                    <span className="inline-flex items-center text-sm text-[#007BFF] mt-3">View →</span>
                </Link>
                <Link href="/portal/responses" className="bg-white rounded-2xl shadow-lg border border-[#F4F4F4] p-6 hover:shadow-xl transition-shadow">
                    <h3 className="font-medium text-[#333333]">💬 My Responses</h3>
                    <p className="text-sm text-[#6C757D] mt-1">View your guidance history</p>
                    <span className="inline-flex items-center text-sm text-[#007BFF] mt-3">View →</span>
                </Link>
                <Link href="/portal/verification" className="bg-white rounded-2xl shadow-lg border border-[#F4F4F4] p-6 hover:shadow-xl transition-shadow">
                    <h3 className="font-medium text-[#333333]">✅ Verification Status</h3>
                    <p className="text-sm text-[#6C757D] mt-1">Check your credentials</p>
                    <span className="inline-flex items-center text-sm text-[#007BFF] mt-3">View →</span>
                </Link>
            </div>
        </div>
    );
}