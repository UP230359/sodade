"use client";

import MoodHistory from "@/components/mood/MoodHistory";
import { useAppSelector } from "@/store";

export default function HistoryPage() {

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <MoodHistory />
    </div>
  );
}
