"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const links = user?.accountType === "professional" ? professionalLinks : personalLinks;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-muted
          transform transition-transform duration-300 ease-in-out flex flex-col md:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4 flex-1 overflow-y-auto mt-16">
          <ul className="flex flex-col gap-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-secondary hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
