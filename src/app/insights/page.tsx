"use client";

import MoodChart from "@/components/mood/MoodChart";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMoodEntries } from "@/store/moodSlice";
import { useEffect } from "react";

const MOCK_7DAY_ENTRIES = [
  {
    id: "mock-1",
    mood: "happy" as const,
    level: 4,
    note: "Returned to peace through evening practice.",
    tags: ["peaceful"],
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-2",
    mood: "neutral" as const,
    level: 3,
    note: "Average day",
    tags: ["routine"],
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-3",
    mood: "sad" as const,
    level: 2,
    note: "Feeling a bit down",
    tags: ["rest"],
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-4",
    mood: "excited" as const,
    level: 5,
    note: "Amazing news today!",
    tags: ["celebration"],
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-5",
    mood: "happy" as const,
    level: 4,
    note: "Spent time with friends",
    tags: ["social"],
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-6",
    mood: "neutral" as const,
    level: 3,
    note: "Back to routine",
    tags: ["work"],
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-7",
    mood: "happy" as const,
    level: 4,
    note: "Good day overall",
    tags: ["positive"],
    timestamp: new Date().toISOString(),
  },
];

export default function InsightsPage() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.mood.entries);

  useEffect(() => {
    if (typeof window !== "undefined" && entries.length === 0) {
      const storedEntries = localStorage.getItem("sodade_mood_entries");

      if (!storedEntries) {
        dispatch(setMoodEntries(MOCK_7DAY_ENTRIES));
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <MoodChart />
      </div>
    </div>
  );
}
