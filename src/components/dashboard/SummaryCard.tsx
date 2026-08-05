import { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  moodAccent?: "joy" | "calm" | "sadness" | "anger" | "anxiety" | "neutral" | "surprise" | "trust";
  children?: ReactNode;
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  moodAccent,
  children
}: SummaryCardProps) {

  // Uses the global variables defined in globals.css for text and borders
  const accentStyles = moodAccent ? {
    joy: "bg-joy/10 border-joy/30 text-joy",
    calm: "bg-calm/10 border-calm/30 text-calm",
    sadness: "bg-sadness/10 border-sadness/30 text-sadness",
    anger: "bg-anger/10 border-anger/30 text-anger",
    anxiety: "bg-anxiety/10 border-anxiety/30 text-anxiety",
    neutral: "bg-neutral/10 border-neutral/30 text-neutral",
    surprise: "bg-surprise/10 border-surprise/30 text-surprise",
    trust: "bg-trust/10 border-trust/30 text-trust",
  }[moodAccent] : "bg-muted/30 border-muted text-foreground";

  return (
    <div className={`p-6 rounded-2xl border transition-all ${accentStyles}`}>
      <span className="text-xs uppercase tracking-wider font-semibold opacity-70">{title}</span>
      <h3 className="text-2xl font-bold mt-1 text-foreground">{value}</h3>
      {subtitle && <p className="text-sm opacity-80 mt-1">{subtitle}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
