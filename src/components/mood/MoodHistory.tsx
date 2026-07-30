"use client";

import { useAppSelector } from "@/store";
import { MoodEntry } from "@/store/moodSlice";
import { useMemo } from "react";

const MOOD_COLORS: Record<MoodEntry["mood"], string> = {
  joy: "bg-yellow-100 text-yellow-700",
  calm: "bg-green-100 text-green-700",
  sadness: "bg-blue-100 text-blue-700",
  anger: "bg-red-100 text-red-700",
  fear: "bg-purple-100 text-purple-700",
  disgust: "bg-emerald-100 text-emerald-700",
  surprise: "bg-orange-100 text-orange-700",
  trust: "bg-indigo-100 text-indigo-700",
};

const MOOD_ICONS: Record<MoodEntry["mood"], string> = {
  joy: "😊",
  calm: "😌",
  sadness: "😢",
  anger: "😠",
  fear: "😨",
  disgust: "🤢",
  surprise: "😲",
  trust: "🤝",
};

const MOOD_LABELS: Record<MoodEntry["mood"], string> = {
  joy: "Joy",
  calm: "Calm",
  sadness: "Sadness",
  anger: "Anger",
  fear: "Fear",
  disgust: "Disgust",
  surprise: "Surprise",
  trust: "Trust",
};

export default function MoodHistory() {
  const entries = useAppSelector((state) => state.mood.entries);

  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [entries]);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (sortedEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-serif text-gray-800 mb-4">History</h2>
        <p className="text-gray-500">
          No mood entries yet. Start tracking your emotions to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold text-orange-600 tracking-wide uppercase">
          Past Reflections
        </p>
        <h2 className="text-3xl font-serif text-gray-900">History</h2>
      </div>

      <div className="space-y-4">
        {sortedEntries.map((entry) => (
          <div
            key={entry.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Header: Icon, Mood Label, and Timestamp */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{MOOD_ICONS[entry.mood]}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {MOOD_LABELS[entry.mood]}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
              </div>

              {/* Mood Level Badge */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${MOOD_COLORS[entry.mood]}`}>
                {entry.level}/5
              </div>
            </div>

            {/* Note */}
            {entry.note && (
              <p className="text-gray-700 mb-3 leading-relaxed">{entry.note}</p>
            )}

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
