interface StreakCounterProps {
  days: number;
}

export default function StreakCounter({ days }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">🔥</span>
      <span className="text-sm text-secondary">
        {days > 0 ? `${days} day${days === 1 ? "" : "s"} in a row` : "Start your streak today"}
      </span>
    </div>
  );
}