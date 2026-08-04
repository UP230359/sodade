// components/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { 
    href: "/check-in", 
    label: "Check-in",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  { 
    href: "/dashboard", 
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  { 
    href: "/history", 
    label: "History",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  { 
    href: "/journal", 
    label: "Journal",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  { 
    href: "/insights", 
    label: "Insights Inbox",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <div className="flex h-screen">
      {/* Overlay para móvil */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - Fondo blanco */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white text-[#333333] shadow-lg transition-all duration-300 z-50 ${
          isSidebarOpen ? "w-64" : "w-16"
        } ${isMobile ? "shadow-2xl" : ""}`}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`absolute -right-3 top-6 bg-white text-[#333333] rounded-full p-1 border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors ${
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
            className="absolute top-4 right-4 text-[#6B7280] hover:text-[#333333] transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <div className={`p-4 border-b border-[#E5E7EB] ${isSidebarOpen ? "" : "text-center"}`}>
          {isSidebarOpen ? (
            <div>
              <h1 className="text-lg font-bold text-[#1C1A17]">Sodade</h1>
              <p className="text-xs text-[#6B7280]">Your Journal</p>
            </div>
          ) : (
            <span className="text-xl">📖</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#007BFF] text-white"
                    : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#333333]"
                } ${!isSidebarOpen ? "justify-center" : ""}`}
                title={!isSidebarOpen ? link.label : ""}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                {isSidebarOpen && (
                  <span className="text-sm flex-1">{link.label}</span>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="border-t border-[#E5E7EB] my-4"></div>

          {/* Profile Section */}
          <Link
            href="/profile"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[#6B7280] hover:text-[#333333] hover:bg-[#F3F4F6] ${
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
            href="/login"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[#6B7280] hover:text-red-600 hover:bg-red-50 ${
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
          <div className="border-t border-[#E5E7EB] pt-4">
            {isSidebarOpen ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#9CA3AF]">v1.0.0</p>
                <span className="text-xs text-[#9CA3AF]">User</span>
              </div>
            ) : (
              <span className="text-xs text-[#9CA3AF]">⚙️</span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        } ${isMobile ? "ml-0" : ""}`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors"
            >
              <svg className="h-6 w-6 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-medium text-[#333333]">Sodade</h1>
              <p className="text-xs text-[#6B7280]">User</p>
            </div>
            <div className="w-10" />
          </div>
        )}

        {/* Children */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}