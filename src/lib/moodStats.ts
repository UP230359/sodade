import { Checkin } from "@/lib/api";

// Emociones que se pueden usar para filtrar la lista de "Core Emotions" en el dashboard.
// El "key" es la versión en minúsculas que se compara contra checkin.emotion.toLowerCase().
export const CORE_EMOTIONS = [
  { key: "joy", label: "Joy" },
  { key: "calm", label: "Calm" },
  { key: "sadness", label: "Sadness" },
  { key: "anger", label: "Anger" },
  { key: "fear", label: "Fear" },
  { key: "disgust", label: "Disgust" },
  { key: "surprise", label: "Surprise" },
  { key: "trust", label: "Trust" },
] as const;

// Los "acentos" son los nombres de color que ya existen en tu Tailwind config
// (bg-joy, text-joy, etc.) y los usan SummaryCard/Card para pintarse.
export type EmotionAccent =
  | "joy"
  | "calm"
  | "sadness"
  | "anger"
  | "anxiety"
  | "neutral"
  | "surprise"
  | "trust";

interface EmotionMeta {
  accent: EmotionAccent; // color usado en SummaryCard (Dominant/Secondary Emotion)
  square: string; // color del cuadrito en el "Mood Map" del calendario
  chip: string; // color del botón/pill en "Core Emotions"
  level: number; // 1 (negativo) a 5 (positivo), solo para calcular Weekly Patterns
}

// Diccionario central: cada emoción de tu tabla `emotions` (en minúsculas) se traduce
// a estos 4 valores. Las 8 emociones se mapean a las 6 variables globales de CSS.
// Si el backend algún día agrega una emoción nueva que no está aquí,
// no truena nada: metaFor() cae en DEFAULT_META más abajo.
const EMOTION_META: Record<string, EmotionMeta> = {
  joy: {
    accent: "joy",
    square: "bg-joy",
    chip: "bg-joy/20 text-joy border-joy",
    level: 5,
  },
  // Trust se mapea visualmente a "calm" para mantener consistencia con globals.css
  trust: {
    accent: "calm",
    square: "bg-trust",
    chip: "bg-trust/20 text-trust border-trust",
    level: 4,
  },
  calm: {
    accent: "calm",
    square: "bg-calm",
    chip: "bg-calm/20 text-calm border-calm",
    level: 4,
  },
  // Surprise se mapea a "joy"
  surprise: {
    accent: "surprise",
    square: "bg-surprise",
    chip: "bg-surprise/20 text-surprise border-surprise",
    level: 3,
  },
  // Fear se mapea a la variable global "anxiety"
  fear: {
    accent: "anxiety",
    square: "bg-anxiety",
    chip: "bg-anxiety/20 text-anxiety border-anxiety",
    level: 2,
  },
  sadness: {
    accent: "sadness",
    square: "bg-sadness",
    chip: "bg-sadness/20 text-sadness border-sadness",
    level: 2,
  },
  disgust: {
    accent: "neutral",
    square: "bg-neutral",
    chip: "bg-neutral/30 text-neutral border-neutral",
    level: 1,
  },
  anger: {
    accent: "anger",
    square: "bg-anger",
    chip: "bg-anger/20 text-anger border-anger",
    level: 1,
  },
};

// Fallback por si llega una emoción que no está en el diccionario de arriba.
const DEFAULT_META: EmotionMeta = {
  accent: "neutral",
  square: "bg-muted",
  chip: "bg-muted text-secondary border-neutral",
  level: 3,
};

function metaFor(emotionName: string): EmotionMeta {
  return EMOTION_META[emotionName.toLowerCase()] ?? DEFAULT_META;
}

// --- Funciones públicas que el componente usa para pintar colores ---
export function emotionAccent(emotionName: string): EmotionAccent {
  return metaFor(emotionName).accent;
}

export function emotionSquareClass(emotionName: string): string {
  return metaFor(emotionName).square;
}

export function emotionChipClass(emotionKey: string): string {
  return metaFor(emotionKey).chip;
}

function emotionLevel(emotionName: string): number {
  return metaFor(emotionName).level;
}

// --- Cálculos sobre el historial de checkins ---
// Todas estas funciones reciben el arreglo de checkins que ya trajo useCheckins()
// desde la base de datos, y regresan datos ya listos para pintar. Así el componente
// del dashboard no hace ningún cálculo, solo llama estas funciones.

/** Checkins de los últimos 7 días (incluyendo hoy), usados en "Core Emotions". */
export function getCheckinsThisWeek(checkins: Checkin[]): Checkin[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  cutoff.setHours(0, 0, 0, 0);
  return checkins.filter((c) => new Date(c.created_at) >= cutoff);
}

/** Las 2 emociones más repetidas en todo el historial (no solo esta semana). */
export function getDominantEmotions(checkins: Checkin[]): {
  dominant: string | null;
  secondary: string | null;
} {
  if (checkins.length === 0) return { dominant: null, secondary: null };

  const counts: Record<string, number> = {};
  checkins.forEach((c) => {
    counts[c.emotion] = (counts[c.emotion] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return {
    dominant: sorted[0]?.[0] ?? null,
    secondary: sorted[1]?.[0] ?? null,
  };
}

/**
 * Días consecutivos con al menos un checkin, contando hacia atrás desde hoy.
 * Si hoy no hay checkin, streak = 0 (se rompió la racha).
 */
export function getStreak(checkins: Checkin[]): number {
  if (checkins.length === 0) return 0;

  const daysWithEntries = new Set(
    checkins.map((c) => new Date(c.created_at).toDateString()),
  );
  let streak = 0;
  const cursor = new Date();
  while (daysWithEntries.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Mapa { díaDelMes: nombreDeEmoción } para pintar el calendario "Mood Map".
 * Solo toma checkins del mes/año pedido; si hay dos checkins el mismo día,
 * se queda con el primero (más reciente, porque la API los manda DESC).
 */
export function getMoodByDay(
  checkins: Checkin[],
  year: number,
  month: number,
): Record<number, string> {
  const moodByDay: Record<number, string> = {};
  checkins.forEach((c) => {
    const date = new Date(c.created_at);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const day = date.getDate();
      if (!moodByDay[day]) moodByDay[day] = c.emotion;
    }
  });
  return moodByDay;
}

interface WeeklyPattern {
  letter: string; // ícono de una letra que se muestra en el circulito (M, D, W...)
  text: string; // frase que se muestra junto al ícono
}

/**
 * Genera hasta 4 frases sobre patrones del usuario:
 *  - En qué franja del día (mañana/tarde/noche) tiende a sentirse mejor.
 *  - Qué día de la semana tiende a ser más positivo.
 *  - Cuánto reflexionó esta semana comparado con la anterior.
 */
export function getWeeklyPatterns(checkins: Checkin[]): WeeklyPattern[] {
  if (checkins.length === 0) return [];

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const patterns: WeeklyPattern[] = [];

  // --- Mejor franja horaria ---
  const timeBuckets: Record<string, number[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };
  checkins.forEach((c) => {
    const hour = new Date(c.created_at).getHours();
    const level = emotionLevel(c.emotion);
    if (hour < 12) timeBuckets.morning.push(level);
    else if (hour < 18) timeBuckets.afternoon.push(level);
    else timeBuckets.evening.push(level);
  });
  const bestTime = Object.entries(timeBuckets)
    .filter(([, arr]) => arr.length > 0)
    .sort((a, b) => avg(b[1]) - avg(a[1]))[0];
  if (bestTime) {
    patterns.push({
      letter: "M",
      text: `You tend to feel your best in the ${bestTime[0]}.`,
    });
  }

  // --- Mejor día de la semana ---
  const dayNames = [
    "Sundays",
    "Mondays",
    "Tuesdays",
    "Wednesdays",
    "Thursdays",
    "Fridays",
    "Saturdays",
  ];
  const dayBuckets: Record<number, number[]> = {};
  checkins.forEach((c) => {
    const day = new Date(c.created_at).getDay();
    if (!dayBuckets[day]) dayBuckets[day] = [];
    dayBuckets[day].push(emotionLevel(c.emotion));
  });
  const bestDay = Object.entries(dayBuckets).sort(
    (a, b) => avg(b[1]) - avg(a[1]),
  )[0];
  if (bestDay) {
    patterns.push({
      letter: "D",
      text: `${dayNames[Number(bestDay[0])]} tend to be your most positive days.`,
    });
  }

  // --- Reflexiones esta semana vs. la semana pasada ---
  const startOfThisWeek = new Date();
  startOfThisWeek.setDate(startOfThisWeek.getDate() - 6);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const thisWeekCount = checkins.filter(
    (c) => new Date(c.created_at) >= startOfThisWeek,
  ).length;
  const lastWeekCount = checkins.filter((c) => {
    const date = new Date(c.created_at);
    return date >= startOfLastWeek && date < startOfThisWeek;
  }).length;

  if (lastWeekCount > 0) {
    const change = Math.round(
      ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100,
    );
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
}

