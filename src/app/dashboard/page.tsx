"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import StreakCounter from "@/components/dashboard/StreakCounter";
import SummaryCard from "@/components/dashboard/SummaryCard";
import CheckInForm from "@/components/mood/CheckInForm";
import MoodChart from "@/components/mood/MoodChart";
import { useAuth } from "@/hooks/useAuth";
import { useCheckins } from "@/hooks/useCheckins";
import {
  CORE_EMOTIONS,
  emotionAccent,
  emotionChipClass,
  emotionSquareClass,
  getCheckinsThisWeek,
  getDominantEmotions,
  getMoodByDay,
  getStreak,
  getWeeklyPatterns,
} from "@/lib/moodStats";

const WEEKDAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  return cells;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAuth();
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [emotionFilter, setEmotionFilter] = useState<string | null>(null);

  const [dailyReflection, setDailyReflection] = useState<string>("Loading your personalized reflection...");
  const [wisdom, setWisdom] = useState<{ quote: string; author: string } | null>(null);

  const { checkins, error, refetch } = useCheckins(user?.id ?? null);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/insights/daily?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reflection) setDailyReflection(data.reflection);
      })
      .catch(() => setDailyReflection("Every emotion is a messenger, not a residence."));

    fetch("/api/insights/wisdom")
      .then((res) => res.json())
      .then((data) => {
        if (data.quote) setWisdom(data);
      })
      .catch(() => setWisdom({
        quote: "Between stimulus and response there is a space. In that space is our power to choose our response.",
        author: "Viktor E. Frankl"
      }));
  }, [user?.id]);

  const { dominant, secondary } = useMemo(() => getDominantEmotions(checkins), [checkins]);
  const streak = useMemo(() => getStreak(checkins), [checkins]);
  const weeklyPatterns = useMemo(() => getWeeklyPatterns(checkins), [checkins]);

  const now = useMemo(() => new Date(), []);
  const monthGrid = getMonthGrid(now.getFullYear(), now.getMonth());
  const moodByDay = useMemo(
    () => getMoodByDay(checkins, now.getFullYear(), now.getMonth()),
    [checkins, now],
  );

  const weekCheckins = useMemo(() => getCheckinsThisWeek(checkins), [checkins]);
  const filteredWeekCheckins = useMemo(() => {
    if (!emotionFilter) return weekCheckins;
    return weekCheckins.filter((c) => c.emotion.toLowerCase() === emotionFilter);
  }, [weekCheckins, emotionFilter]);

  if (!hydrated || !isAuthenticated) return null;

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 relative px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6 md:gap-0">
        <div>
          <span className="text-xs font-bold tracking-widest text-primary uppercase mb-2 block">
            Daily Reflection
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground leading-tight">
            Your Emotional
            <br />
            Journey
          </h1>
          <p className="text-secondary mt-2">
            Observe your inner landscape and track your daily feelings.
          </p>
        </div>

        <Card className="w-full md:w-56 !p-4">
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
              const emotion = day ? moodByDay[day] : undefined;
              return (
                <div
                  key={i}
                  className={`w-full aspect-square rounded-md ${isToday ? "border-2 border-foreground" : ""
                    } ${day === null ? "" : emotion ? emotionSquareClass(emotion) : "bg-muted"}`}
                />
              );
            })}
          </div>
        </Card>
      </div>

      {error && (
        <Card className="mb-6 border-anger/40 bg-anger/10">
          <p className="text-sm text-anger">{error}</p>
          <button
            className="mt-3 text-sm font-medium text-foreground hover:underline cursor-pointer"
            onClick={refetch}
          >
            Try again
          </button>
        </Card>
      )}

      <Card className="mb-6">
        <MoodChart />
      </Card>

      <Card className="mb-6">
        <span className="text-xs font-bold tracking-widest text-primary uppercase mb-3 block">
          Reflection of the Day
        </span>
        <p className="text-foreground leading-relaxed">
          {dailyReflection}
        </p>
      </Card>

      <div className="mb-2 mt-8">
        <h2 className="font-semibold text-foreground">Emotional Balance</h2>
        <p className="text-sm text-secondary">Your emotional composition this week</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <SummaryCard
          title="Dominant Emotion"
          value={dominant ?? "No data yet"}
          subtitle={dominant ? `${checkins.length} total entries` : undefined}
          moodAccent={dominant ? emotionAccent(dominant) : "neutral"}
        />
        <SummaryCard
          title="Secondary Emotion"
          value={secondary ?? "No data yet"}
          subtitle={secondary ? "recurring" : undefined}
          moodAccent={secondary ? emotionAccent(secondary) : "neutral"}
        />
        <SummaryCard title="Moments Logged" value={`${checkins.length}`} subtitle="reflections" moodAccent="joy" />
        <SummaryCard title="Streak" value={`${streak}`} subtitle={streak === 1 ? "day" : "days"} moodAccent="anger">
          <StreakCounter days={streak} />
        </SummaryCard>
      </div>

      <Card className="!bg-foreground !text-background !border-none mb-6 relative overflow-hidden">
        <span className="text-xs font-bold tracking-widest text-amber-400 uppercase mb-3 block">
          Wisdom of the Week
        </span>
        <p className="italic text-background text-lg mb-4">
          &quot;{wisdom?.quote ?? "Loading wisdom..."}&quot;
        </p>
        <p className="text-background/70 text-sm">— {wisdom?.author ?? ""}</p>
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
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-serif text-foreground shrink-0">
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
                className={`text-xs font-semibold uppercase px-4 py-2 rounded-full border transition-colors cursor-pointer ${emotionChipClass(
                  emotion.key,
                )} ${isActive ? "border-2 border-foreground" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                {emotion.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-secondary mt-4">
          {emotionFilter
            ? `Showing reflections tagged ${CORE_EMOTIONS.find((e) => e.key === emotionFilter)?.label} this week.`
            : "Tap any emotion to filter your reflections for the week."}
        </p>

        <div className="mt-4 space-y-2">
          {filteredWeekCheckins.length === 0 ? (
            <p className="text-sm text-secondary/70">No reflections found for this filter.</p>
          ) : (
            filteredWeekCheckins.slice(0, 5).map((c) => (
              <div
                key={c.checkin_id}
                className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3"
              >
                <div>
                  <span className="text-sm font-semibold text-foreground capitalize">{c.emotion}</span>
                  {c.note && <p className="text-xs text-secondary mt-0.5">{c.note}</p>}
                </div>
                <span className="text-xs text-secondary shrink-0 ml-4">
                  {new Date(c.created_at).toLocaleDateString("en-US", { weekday: "short" })}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      <button
        onClick={() => setIsCheckInOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-11/12 md:w-auto bg-foreground text-background px-8 py-3.5 rounded-full font-medium shadow-xl hover:opacity-90 transition-all cursor-pointer z-40"
      >
        Start Today&apos;s Reflection
      </button>

      <Modal
        isOpen={isCheckInOpen}
        onClose={() => {
          setIsCheckInOpen(false);
          refetch();
        }}
      >
        <CheckInForm />
      </Modal>
    </div>
  );
}
