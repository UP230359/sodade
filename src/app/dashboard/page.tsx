"use client";

import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StreakCounter from "@/components/dashboard/StreakCounter";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { useAppSelector } from "@/store";
import { MoodEntry } from "@/store/moodSlice";

const MOOD_LEVELS: Record<string, number> = {
  excited: 5,
  happy: 4,
  neutral: 3,
  sad: 2,
  angry: 1,
};

const moodToAccent: Record<string, "joy" | "calm" | "sadness" | "anger" | "anxiety" | "neutral"> = {
  excited: "joy",
  happy: "calm",
  neutral: "neutral",
  sad: "sadness",
  angry: "anger",
};

const moodLabel: Record<string, string> = {
  excited: "Excited",
  happy: "Happy",
  neutral: "Neutral",
  sad: "Sad",
  angry: "Angry",
};

const moodSquareColor: Record<string, string> = {
  excited: "bg-joy",
  happy: "bg-calm",
  neutral: "bg-neutral",
  sad: "bg-primary",
  angry: "bg-anger",
};

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

const CORE_EMOTIONS: { key: string; label: string; cls: string }[] = [
  { key: "joy", label: "Joy", cls: "bg-joy/20 text-joy border-joy" },
  { key: "calm", label: "Calm", cls: "bg-calm/20 text-calm border-calm" },
  { key: "sadness", label: "Sadness", cls: "bg-primary/20 text-primary border-primary" },
  { key: "anger", label: "Anger", cls: "bg-anger/20 text-anger border-anger" },
  { key: "fear", label: "Fear", cls: "bg-anxiety/20 text-anxiety border-anxiety" },
  { key: "disgust", label: "Disgust", cls: "bg-neutral/30 text-secondary border-neutral" },
  { key: "surprise", label: "Surprise", cls: "bg-orange-100 text-orange-600 border-orange-300" },
  { key: "trust", label: "Trust", cls: "bg-pink-100 text-pink-600 border-pink-300" },
];

const coreEmotionToEntryMood: Record<string, MoodEntry["mood"]> = {
  joy: "excited",
  calm: "happy",
  sadness: "sad",
  anger: "angry",
  fear: "sad",
  disgust: "angry",
  surprise: "excited",
  trust: "happy",
};

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function CheckInPlaceholder() {
  return <div className="text-center text-secondary py-8">Check-in flow coming soon.</div>;
}

function MoodChartPlaceholder() {
  return (
    <div className="h-40 flex items-center justify-center border border-dashed border-neutral/30 rounded-xl text-secondary/50 text-sm mb-6">
      Emotion Timeline Chart UI
    </div>
  );
}

export default function DashboardPage() {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [emotionFilter, setEmotionFilter] = useState<string | null>(null);
  const entries = useAppSelector((state) => state.mood.entries);

  const { dominant, secondary, momentsLogged, streak, latest } = useMemo(() => {
    if (entries.length === 0) {
      return { dominant: null, secondary: null, momentsLogged: 0, streak: 0, latest: null };
    }

    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });

    const sortedMoods = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    const days = new Set(entries.map((entry) => new Date(entry.timestamp).toDateString()));
    let streakCount = 0;
    const cursor = new Date();
    while (days.has(cursor.toDateString())) {
      streakCount += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const latestEntry = [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    return {
      dominant: sortedMoods[0]?.[0] ?? null,
      secondary: sortedMoods[1]?.[0] ?? null,
      momentsLogged: entries.length,
      streak: streakCount,
      latest: latestEntry,
    };
  }, [entries]);

  const now = new Date();
  const monthGrid = getMonthGrid(now.getFullYear(), now.getMonth());

  const moodByDay: Record<number, string> = {};
  entries.forEach((entry) => {
    const d = new Date(entry.timestamp);
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      const day = d.getDate();
      if (!moodByDay[day]) moodByDay[day] = entry.mood;
    }
  });

  const weekEntries = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    cutoff.setHours(0, 0, 0, 0);
    return entries.filter((entry) => new Date(entry.timestamp) >= cutoff);
  }, [entries]);

  const filteredWeekEntries = useMemo(() => {
    if (!emotionFilter) return weekEntries;
    const targetMood = coreEmotionToEntryMood[emotionFilter];
    return weekEntries.filter((entry) => entry.mood === targetMood);
  }, [weekEntries, emotionFilter]);

  const weeklyPatterns = useMemo(() => {
    if (entries.length === 0) return [];

    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const patterns: { letter: string; text: string }[] = [];

    const timeBuckets: Record<string, number[]> = { morning: [], afternoon: [], evening: [] };
    entries.forEach((entry) => {
      const hour = new Date(entry.timestamp).getHours();
      const level = MOOD_LEVELS[entry.mood];
      if (hour < 12) timeBuckets.morning.push(level);
      else if (hour < 18) timeBuckets.afternoon.push(level);
      else timeBuckets.evening.push(level);
    });
    const bestTime = Object.entries(timeBuckets)
      .filter(([, arr]) => arr.length > 0)
      .sort((a, b) => avg(b[1]) - avg(a[1]))[0];
    if (bestTime) {
      patterns.push({ letter: "M", text: `You tend to feel your best in the ${bestTime[0]}.` });
    }

    const dayBuckets: Record<number, number[]> = {};
    entries.forEach((entry) => {
      const day = new Date(entry.timestamp).getDay();
      if (!dayBuckets[day]) dayBuckets[day] = [];
      dayBuckets[day].push(MOOD_LEVELS[entry.mood]);
    });
    const dayNames = [
      "Sundays",
      "Mondays",
      "Tuesdays",
      "Wednesdays",
      "Thursdays",
      "Fridays",
      "Saturdays",
    ];
    const bestDay = Object.entries(dayBuckets).sort((a, b) => avg(b[1]) - avg(a[1]))[0];
    if (bestDay) {
      patterns.push({ letter: "D", text: `${dayNames[Number(bestDay[0])]} tend to be your most positive days.` });
    }

    const tagCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    if (topTag) {
      patterns.push({ letter: "I", text: `"${topTag[0]}" comes up most often as what's influencing your mood.` });
    }

    const startOfThisWeek = new Date();
    startOfThisWeek.setDate(startOfThisWeek.getDate() - 6);
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const thisWeekCount = entries.filter((e) => new Date(e.timestamp) >= startOfThisWeek).length;
    const lastWeekCount = entries.filter((e) => {
      const d = new Date(e.timestamp);
      return d >= startOfLastWeek && d < startOfThisWeek;
    }).length;

    if (lastWeekCount > 0) {
      const change = Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);
      patterns.push({
        letter: "W",
        text:
          change >= 0
            ? `You reflected ${change}% more this week than last week.`
            : `You reflected ${Math.abs(change)}% less this week than last week.`,
      });
    } else if (thisWeekCount > 0) {
      patterns.push({
        letter: "W",
        text: `You logged ${thisWeekCount} reflection${thisWeekCount === 1 ? "" : "s"} this week — keep it up.`,
      });
    }

    return patterns.slice(0, 4);
  }, [entries]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 relative">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-wider text-joy uppercase mb-2">
            Weekly Reflection
          </p>
          <h1 className="font-serif text-4xl font-normal text-foreground leading-tight">
            Your Emotional
            <br />
            Journey
          </h1>
          <p className="text-secondary mt-2">
            Observe your inner landscape and track your daily feelings.
          </p>
        </div>

        <Card className="w-56 !p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-foreground text-sm">
              {now.toLocaleString("en-US", { month: "long" })}
            </span>
            <span className="text-xs text-secondary tracking-wide">MOOD MAP</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {WEEKDAY_LETTERS.map((letter, i) => (
              <span key={i} className="text-[10px] text-secondary text-center">
                {letter}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {monthGrid.map((day, i) => {
              const isToday = day === now.getDate();
              return (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-md ${isToday ? "border-2 border-foreground" : ""} ${day === null ? "" : moodByDay[day] ? moodSquareColor[moodByDay[day]] : "bg-muted"
                    }`}
                />
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-foreground">Emotion Timeline</h2>
            <p className="text-sm text-secondary">Your feelings, traced through the week</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-muted text-secondary flex items-center justify-center">
              &lt;
            </button>
            <button className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center">
              &gt;
            </button>
          </div>
        </div>

        <MoodChartPlaceholder />

        <div className="flex items-center gap-4 bg-calm/10 rounded-xl p-4">
          <button className="w-9 h-9 rounded-full bg-calm flex items-center justify-center text-white">
            +
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {latest ? moodLabel[latest.mood] : "No entries yet"}
              </span>
              {latest?.tags?.[0] && (
                <span className="text-xs bg-calm/20 text-calm px-2 py-0.5 rounded-full">
                  {latest.tags[0]}
                </span>
              )}
            </div>
            <p className="text-sm text-secondary">
              {latest?.note || "Log your first mood to see it here."}
            </p>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <p className="text-xs font-semibold tracking-wider text-joy uppercase mb-3">
          This Week&apos;s Reflection
        </p>
        <p className="text-foreground mb-4">
          You began with curiosity and joy, found deep peace midweek, then navigated through
          unease before returning to stillness and connection. Mindfulness reminds us —{" "}
          <em>every emotion is a messenger, not a residence.</em>
        </p>
        <Button
          variant="joy"
          className="!bg-background !text-joy !border !border-joy hover:!bg-joy/5"
        >
          Read Related Insight
        </Button>
      </Card>

      <div className="mb-2">
        <h2 className="font-semibold text-foreground">Emotional Balance</h2>
        <p className="text-sm text-secondary">Your emotional composition this week</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <SummaryCard
          title="Dominant Emotion"
          value={dominant ? moodLabel[dominant] : "No data yet"}
          subtitle={dominant ? `${momentsLogged} total entries` : undefined}
          moodAccent={dominant ? moodToAccent[dominant] : "neutral"}
        />
        <SummaryCard
          title="Secondary Emotion"
          value={secondary ? moodLabel[secondary] : "No data yet"}
          subtitle={secondary ? "recurring" : undefined}
          moodAccent={secondary ? moodToAccent[secondary] : "neutral"}
        />
        <SummaryCard title="Moments Logged" value={`${momentsLogged}`} subtitle="reflections" moodAccent="joy" />
        <SummaryCard title="Streak" value={`${streak}`} subtitle={streak === 1 ? "day" : "days"} moodAccent="anger">
          <StreakCounter days={streak} />
        </SummaryCard>
      </div>

      <Card className="!bg-foreground !border-none mb-6">
        <p className="text-xs font-semibold tracking-wider text-joy uppercase mb-3">
          Wisdom of the Week
        </p>
        <p className="italic text-background text-lg mb-4">
          &quot;Between stimulus and response there is a space. In that space is our power to
          choose our response.&quot;
        </p>
        <p className="text-background/60 text-sm mb-4">— Viktor E. Frankl</p>
        <Button
          variant="joy"
          className="!bg-transparent !text-joy !border !border-joy hover:!bg-joy/10"
        >
          Explore Practice →
        </Button>
      </Card>

      <Card className="mb-6">
        <h2 className="font-semibold text-foreground">Weekly Patterns</h2>
        <p className="text-sm text-secondary mb-4">What your emotions are revealing</p>

        <div className="space-y-3">
          {weeklyPatterns.length === 0 ? (
            <p className="text-sm text-secondary/70">Log a few reflections to see your patterns here.</p>
          ) : (
            weeklyPatterns.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-serif text-foreground">
                  {item.letter}
                </div>
                <p className="text-sm text-foreground">{item.text}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="mb-24">
        <h2 className="font-semibold text-foreground">Core Emotions</h2>
        <div className="flex flex-wrap gap-2 mt-4">
          {CORE_EMOTIONS.map((emotion) => {
            const isActive = emotionFilter === emotion.key;
            return (
              <button
                key={emotion.key}
                type="button"
                onClick={() => setEmotionFilter(isActive ? null : emotion.key)}
                className={`text-xs font-semibold uppercase px-4 py-2 rounded-full border transition-colors ${emotion.cls
                  } ${isActive ? "border-2" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                {emotion.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-secondary mt-4">
          {emotionFilter
            ? `Showing reflections tagged ${CORE_EMOTIONS.find((emotion) => emotion.key === emotionFilter)?.label
            } this week.`
            : "Tap any emotion to filter your reflections for the week."}
        </p>

        <div className="mt-4 space-y-2">
          {filteredWeekEntries.length === 0 ? (
            <p className="text-sm text-secondary/70">No reflections found for this filter.</p>
          ) : (
            filteredWeekEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-2"
              >
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    {moodLabel[entry.mood]}
                  </span>
                  {entry.note && <p className="text-xs text-secondary">{entry.note}</p>}
                </div>
                <span className="text-xs text-secondary">
                  {new Date(entry.timestamp).toLocaleDateString("en-US", { weekday: "short" })}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      <button
        onClick={() => setIsCheckInOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full font-medium shadow-lg hover:bg-foreground/90 transition-colors"
      >
        Start Today&apos;s Reflection
      </button>

      <Modal isOpen={isCheckInOpen} onClose={() => setIsCheckInOpen(false)}>
        <CheckInPlaceholder />
      </Modal>
    </div>
  );
}