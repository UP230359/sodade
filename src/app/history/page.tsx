"use client";

import MoodHistory from "@/components/mood/MoodHistory";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMoodEntries } from "@/store/moodSlice";
import { useEffect } from "react";

const MOCK_ENTRIES = [
  {
    id: "entry-1",
    mood: "happy" as const,
    level: 4,
    note: "Felt a deep sense of wonder walking through the park.",
    tags: ["nature", "walking"],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.mood.entries);

  useEffect(() => {
    if (entries.length === 0) {
      dispatch(setMoodEntries(MOCK_ENTRIES));
    }
  }, [dispatch, entries.length]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <MoodHistory />
    </div>
  );
}
