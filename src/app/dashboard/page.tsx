"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StreakCounter from "@/components/dashboard/StreakCounter";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { useAppSelector } from "@/store";
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

// Genera las celdas del mini-calendario del mes actual: null = celda vacía
// (relleno antes del día 1), número = día del mes.
function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  return cells;
}

// --- Placeholders ---
// El resto del equipo construye estas partes después (CheckInForm dentro del
// modal, MoodChart con Recharts/Chart.js). Aquí solo dejamos el espacio.
function CheckInPlaceholder() {
  return <div className="text-center text-secondary py-8">Check-in flow coming soon.</div>;
}

function MoodChartPlaceholder() {
  return (
    <div className="h-40 flex items-center justify-center text-secondary/50 text-sm mb-6">
      Emotion Timeline Chart UI
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  // El login actual no persiste sesión (sin cookie/token): el usuario solo
  // existe en Redux mientras dure la pestaña. Se lee directo, sin esperar nada.
  const user = useAppSelector((state) => state.user.user);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  // Estado local (no Redux) porque solo le importa a esta pantalla:
  // qué modal está abierto y qué emoción se está usando para filtrar.
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [emotionFilter, setEmotionFilter] = useState<string | null>(null);

  // Mientras no haya user.id, useCheckins no pide nada a la API.
  const { checkins, loading, error, refetch } = useCheckins(user?.id ?? null);

  // Sin sesión no hay a quién pedirle checkins: se manda al login.
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Todo el cálculo (streak, emociones dominantes, patrones semanales...)
  // vive en moodStats.ts. Aquí solo se llama y se envuelve en useMemo para
  // no recalcular en cada render si `checkins` no cambió.
  const { dominant, secondary } = useMemo(() => getDominantEmotions(checkins), [checkins]);
  const streak = useMemo(() => getStreak(checkins), [checkins]);
  const weeklyPatterns = useMemo(() => getWeeklyPatterns(checkins), [checkins]);
  const latest = checkins[0] ?? null; // la API ya los manda ordenados por fecha DESC

  const now = new Date();
  const monthGrid = getMonthGrid(now.getFullYear(), now.getMonth());
  const moodByDay = useMemo(
    () => getMoodByDay(checkins, now.getFullYear(), now.getMonth()),
    [checkins],
  );

  const weekCheckins = useMemo(() => getCheckinsThisWeek(checkins), [checkins]);
  const filteredWeekCheckins = useMemo(() => {
    if (!emotionFilter) return weekCheckins;
    return weekCheckins.filter((c) => c.emotion.toLowerCase() === emotionFilter);
  }, [weekCheckins, emotionFilter]);

  if (!isAuthenticated) {
    return null; // el useEffect de arriba ya está redirigiendo
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 relative">
      {/* --- Encabezado + Mood Map del mes --- */}
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
              const emotion = day ? moodByDay[day] : undefined;
              return (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-md ${isToday ? "border-2 border-foreground" : ""} ${day === null ? "" : emotion ? emotionSquareClass(emotion) : "bg-muted"
                    }`}
                />
              );
            })}
          </div>
        </Card>
      </div>

      {/* --- Manejo de error de la API (requisito de la rúbrica: "Consumo de APIs") --- */}
      {error && (
        <Card className="mb-6 border-anger/40 bg-anger/5">
          <p className="text-sm text-anger">{error}</p>
          <Button variant="secondary" className="mt-3" onClick={refetch}>
            Try again
          </Button>
        </Card>
      )}

      {/* --- Timeline (placeholder del chart) + última reflexión --- */}
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
            <span className="font-semibold text-foreground">
              {loading ? "Loading..." : latest ? latest.emotion : "No entries yet"}
            </span>
            <p className="text-sm text-secondary">
              {latest?.note || "Log your first mood to see it here."}
            </p>
          </div>
        </div>
      </Card>

      {/* --- Texto fijo de reflexión semanal --- */}
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

      {/* --- 4 tarjetas de resumen --- */}
      <div className="mb-2">
        <h2 className="font-semibold text-foreground">Emotional Balance</h2>
        <p className="text-sm text-secondary">Your emotional composition this week</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
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

      {/* --- Frase inspiracional fija --- */}
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

      {/* --- Patrones calculados de la semana --- */}
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

      {/* --- Filtro de Core Emotions + lista de reflexiones de la semana --- */}
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
                className={`text-xs font-semibold uppercase px-4 py-2 rounded-full border transition-colors ${emotionChipClass(
                  emotion.key,
                )} ${isActive ? "border-2" : "border-transparent opacity-60 hover:opacity-100"}`}
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
            filteredWeekCheckins.map((c) => (
              <div
                key={c.checkin_id}
                className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-2"
              >
                <div>
                  <span className="text-sm font-semibold text-foreground">{c.emotion}</span>
                  {c.note && <p className="text-xs text-secondary">{c.note}</p>}
                </div>
                <span className="text-xs text-secondary">
                  {new Date(c.created_at).toLocaleDateString("en-US", { weekday: "short" })}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* --- Botón flotante que abre el modal de check-in --- */}
      <button
        onClick={() => setIsCheckInOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-3 rounded-full font-medium shadow-lg hover:bg-foreground/90 transition-colors"
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
        <CheckInPlaceholder />
      </Modal>
    </div>
  );
}