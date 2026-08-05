"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { MoodEntry, fetchMoodEntries } from "@/store/moodSlice";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo } from "react";

// Utilizamos los colores semánticos definidos en globals.css
const MOOD_COLORS: Record<MoodEntry["mood"], string> = {
  joy: "bg-joy/10 text-joy",
  calm: "bg-calm/10 text-calm",
  sadness: "bg-sadness/10 text-sadness",
  anger: "bg-anger/10 text-anger",
  fear: "bg-anxiety/10 text-anxiety", // Fear mapeado a anxiety
  disgust: "bg-neutral/10 text-neutral", // Disgust mapeado a neutral
  surprise: "bg-surprise/10 text-surprise",
  trust: "bg-trust/10 text-trust",
};

// Colores sólidos para los puntitos indicadores
const MOOD_DOT_COLORS: Record<MoodEntry["mood"], string> = {
  joy: "bg-joy",
  calm: "bg-calm",
  sadness: "bg-sadness",
  anger: "bg-anger",
  fear: "bg-anxiety",
  disgust: "bg-neutral",
  surprise: "bg-surprise",
  trust: "bg-trust",
};

// Nombres para mostrar en la interfaz
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
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.mood.entries);
  const loading = useAppSelector((state) => state.mood.loading);
  const error = useAppSelector((state) => state.mood.error);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      dispatch(fetchMoodEntries(user.id));
    }
  }, [dispatch, user]);

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

  if (loading) {
    return (
      <div className="bg-background rounded-2xl shadow-lg border border-muted p-8 text-center">
        <h2 className="text-2xl font-serif text-foreground mb-4">History</h2>
        <p className="text-secondary">Loading your checkins...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background rounded-2xl shadow-lg border border-muted p-8 text-center">
        <h2 className="text-2xl font-serif text-foreground mb-4">History</h2>
        <p className="text-anger">
          Couldn&apos;t load your checkins. Please try again later.
        </p>
      </div>
    );
  }

  if (sortedEntries.length === 0) {
    return (
      <div className="bg-background rounded-2xl shadow-lg border border-muted p-8 text-center">
        <h2 className="text-2xl font-serif text-foreground mb-4">History</h2>
        <p className="text-secondary">
          No mood entries yet. Start tracking your emotions to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl shadow-lg border border-muted p-4 md:p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold text-primary tracking-wide uppercase">
          Past Reflections
        </p>
        <h2 className="text-2xl md:text-3xl font-serif text-foreground">History</h2>
      </div>

      <div className="space-y-4">
        {sortedEntries.map((entry) => (
          <div
            key={entry.id}
            className="border border-muted rounded-xl p-4 hover:shadow-md transition-shadow bg-muted/10"
          >
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="flex items-start md:items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 mt-1 md:mt-0 ${MOOD_DOT_COLORS[entry.mood]}`}
                />
                <div>
                  <h3 className="font-semibold text-foreground">
                    {MOOD_LABELS[entry.mood]}
                  </h3>
                  <p className="text-xs md:text-sm text-secondary">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium shrink-0 ${MOOD_COLORS[entry.mood]}`}>
                {entry.level}/5
              </div>
            </div>

            {entry.note && (
              <p className="text-sm md:text-base text-foreground mb-3 leading-relaxed">&quot;{entry.note}&quot;</p>
            )}

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-muted text-secondary px-2.5 py-1 rounded-full border border-muted"
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
