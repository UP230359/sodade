// app/(user)/layout.tsx (layout para usuarios normales con sidebar)
import Sidebar from "@/components/layout/Sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Sidebar>{children}</Sidebar>;
}