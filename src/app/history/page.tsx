"use client";

import MoodHistory from "@/components/mood/MoodHistory";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMoodEntries } from "@/store/moodSlice";
import { useEffect } from "react";

// Mock data for development
const MOCK_ENTRIES = [
  {
    id: "entry-1",
    mood: "happy" as const,
    level: 4,
    note: "Felt a deep sense of wonder walking through the park. The light was hitting the leaves perfectly.",
    tags: ["nature", "walking"],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "entry-2",
    mood: "neutral" as const,
    level: 3,
    note: "Quiet morning with tea. The house is completely still.",
    tags: ["morning"],
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
  },
  {
    id: "entry-3",
    mood: "excited" as const,
    level: 5,
    note: "Just finished reading an amazing chapter. Couldn't put the book down.",
    tags: ["reading", "inspiration"],
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.mood.entries);

  // Load mock data on first render if no entries exist
  useEffect(() => {
    if (typeof window !== "undefined" && entries.length === 0) {
      const storedEntries = localStorage.getItem("sodade_mood_entries");

      if (!storedEntries) {
        dispatch(setMoodEntries(MOCK_ENTRIES));
      } else {
        try {
          const parsed = JSON.parse(storedEntries);
          dispatch(setMoodEntries(parsed));
        } catch (e) {
          console.error("Failed to load entries from localStorage", e);
        }
      }
    }
  }, [dispatch, entries.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <MoodHistory />
      </div>
    </div>
  );
}
