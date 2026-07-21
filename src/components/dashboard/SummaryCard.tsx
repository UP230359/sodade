import { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  moodAccent?: "joy" | "calm" | "sadness" | "anger" | "anxiety" | "neutral";
  children?: ReactNode;
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  moodAccent,
  children
}: SummaryCardProps) {

  const accentStyles = moodAccent ? {
    joy: "bg-joy/10 border-joy/30 text-joy-dark",
    calm: "bg-calm/10 border-calm/30 text-calm-dark",
    sadness: "bg-sadness/10 border-sadness/30 text-sadness-dark",
    anger: "bg-anger/10 border-anger/30 text-anger-dark",
    anxiety: "bg-anxiety/10 border-anxiety/30 text-anxiety-dark",
    neutral: "bg-neutral/10 border-neutral/30 text-neutral-dark",
  }[moodAccent] : "bg-muted/30 border-neutral/10";

  return (
    <div className={`p-6 rounded-2xl border transition-all ${accentStyles}`}>
      <span className="text-xs uppercase tracking-wider font-semibold opacity-70">{title}</span>
      <h3 className="text-2xl font-bold mt-1 text-foreground">{value}</h3>
      {subtitle && <p className="text-sm opacity-80 mt-1">{subtitle}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
