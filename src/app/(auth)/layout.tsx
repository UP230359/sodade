import FloatingThemeToggle from "@/components/ui/FloatingThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-center items-center">
      {children}
      <FloatingThemeToggle />
    </div>
  );
}
