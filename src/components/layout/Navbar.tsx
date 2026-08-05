"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/index";
import { logout } from "@/store/userSlice";
import { useEffect, useState } from "react";

const personalLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/journal", label: "Journal" },
  { href: "/insights", label: "Insights" },
  { href: "/resources", label: "Resources" },
];

const professionalLinks = [
  { href: "/portal", label: "Anonymous Feed" },
  { href: "/portal/responses", label: "My Responses" },
  { href: "/portal/verification", label: "Verification Status" },
];

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  const links = user?.accountType === "professional" ? professionalLinks : personalLinks;

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("sodade_user");
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-muted bg-background z-20 sticky top-0">
      <div className="flex items-center gap-6">
        {isAuthenticated && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-foreground hover:bg-muted rounded-lg focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link href="/" className="font-serif text-xl font-bold text-foreground tracking-tight">
          Sodade
        </Link>

        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-secondary hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-secondary hover:text-foreground hover:bg-muted transition-colors text-sm flex items-center justify-center cursor-pointer"
          aria-label="Toggle theme"
          title="Toggle light/dark mode"
        >
          {isDark ? (
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {isAuthenticated && user && (
          <>
            <span className="text-sm text-secondary hidden sm:inline-flex items-center">
              {user.firstName} {user.lastName}
              {user.accountType === "professional" && (
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs uppercase tracking-wide font-bold">
                  Pro
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Log out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
