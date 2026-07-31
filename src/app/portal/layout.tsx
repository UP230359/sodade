// app/portal/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PortalLayoutProps {
    children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // ✅ CORREGIDO: Sin setState directo en el efecto
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLinkClick = () => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    const navItems = [
        { 
            path: "/portal", 
            label: "Dashboard", 
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
        },
        { 
            path: "/journal", 
            label: "Journal", 
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
        },
        { 
            path: "/portal/responses", 
            label: "My Responses", 
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
        },
        { 
            path: "/portal/verification", 
            label: "Verification", 
            icon: (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#FFFFFF] flex">
            {/* Overlay para móvil */}
            {isMobile && isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full bg-[#1C1A17] text-white transition-all duration-300 z-50 ${
                    isSidebarOpen ? "w-64" : "w-16"
                } ${isMobile ? "shadow-2xl" : ""}`}
            >
                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className={`absolute -right-3 top-6 bg-[#1C1A17] text-white rounded-full p-1 border border-white/20 hover:bg-[#2A2824] transition-colors ${
                        isMobile ? "hidden" : ""
                    }`}
                >
                    {isSidebarOpen ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    )}
                </button>

                {/* Mobile Close Button */}
                {isMobile && isSidebarOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Logo */}
                <div className={`p-4 border-b border-white/10 ${isSidebarOpen ? "" : "text-center"}`}>
                    {isSidebarOpen ? (
                        <div>
                            <h1 className="text-lg font-bold text-amber-400">Sodade</h1>
                            <p className="text-xs text-white/40">Psychologist Portal</p>
                        </div>
                    ) : (
                        <span className="text-xl">🧠</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                    isActive
                                        ? "bg-[#007BFF] text-white"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                } ${!isSidebarOpen ? "justify-center" : ""}`}
                                title={!isSidebarOpen ? item.label : ""}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                {isSidebarOpen && (
                                    <span className="text-sm flex-1">{item.label}</span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className="border-t border-white/10 my-4"></div>

                    {/* Profile Section */}
                    <Link
                        href="/portal/profile"
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-white/50 hover:text-white hover:bg-white/10 ${
                            !isSidebarOpen ? "justify-center" : ""
                        }`}
                        title={!isSidebarOpen ? "Profile" : ""}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {isSidebarOpen && <span className="text-sm">Profile</span>}
                    </Link>

                    <Link
                        href="/api/auth/logout"
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-white/40 hover:text-red-400 hover:bg-red-500/10 ${
                            !isSidebarOpen ? "justify-center" : ""
                        }`}
                        title={!isSidebarOpen ? "Logout" : ""}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {isSidebarOpen && <span className="text-sm">Logout</span>}
                    </Link>
                </nav>

                {/* Footer */}
                <div className={`absolute bottom-4 left-0 right-0 px-4 ${isSidebarOpen ? "" : "text-center"}`}>
                    <div className="border-t border-white/10 pt-4">
                        {isSidebarOpen ? (
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-white/30">v1.0.0</p>
                                <span className="text-xs text-white/30">Professional</span>
                            </div>
                        ) : (
                            <span className="text-xs text-white/30">⚙️</span>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main 
                className={`flex-1 transition-all duration-300 ${
                    isSidebarOpen ? "ml-64" : "ml-16"
                } ${isMobile ? "ml-0" : ""}`}
            >
                {isMobile && (
                    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#F4F4F4] px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-[#F4F4F4] transition-colors"
                        >
                            <svg className="h-6 w-6 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-sm font-medium text-[#333333]">Sodade Pro</h1>
                            <p className="text-xs text-[#6C757D]">Dr. Verified Provider</p>
                        </div>
                        <div className="w-10" />
                    </div>
                )}

                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}