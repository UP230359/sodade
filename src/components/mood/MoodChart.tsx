"use client";

import { useAppSelector } from "@/store";
import { MoodEntry } from "@/store/moodSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

interface ChartDataPoint {
  date: string;
  level: number;
  mood: MoodEntry["mood"];
  fullTimestamp: string;
  note?: string;
}

const MOOD_COLORS: Record<MoodEntry["mood"], string> = {
  excited: "#FBBF24",
  happy: "#22C55E",
  neutral: "#9CA3AF",
  sad: "#3B82F6",
  angry: "#EC4899",
};

const MOOD_ICONS: Record<MoodEntry["mood"], string> = {
  excited: "🤩",
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  angry: "😠",
};

const MOOD_LABELS: Record<MoodEntry["mood"], string> = {
  excited: "Excited",
  happy: "Happy",
  neutral: "Neutral",
  sad: "Sad",
  angry: "Angry",
};

export default function MoodChart() {
  const entries = useAppSelector((state) => state.mood.entries);

  const { chartData, latestEntry } = useMemo(() => {
    // Get last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // Create array for 7 days
    const dayMap = new Map<string, ChartDataPoint>();
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dateString = dayLabels[date.getDay()];
      dayMap.set(dateString, {
        date: dateString,
        level: 0,
        mood: "neutral",
        fullTimestamp: date.toISOString(),
      });
    }

    // Fill with mood data
    let latest: ChartDataPoint | null = null;
    entries.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);
      const dayIndex = entryDate.getDay();
      const dateString = dayLabels[dayIndex];

      if (dayMap.has(dateString)) {
        const existing = dayMap.get(dateString)!;
        // Get the latest/highest entry for that day
        if (entry.level > existing.level) {
          dayMap.set(dateString, {
            date: dateString,
            level: entry.level,
            mood: entry.mood,
            fullTimestamp: entry.timestamp,
            note: entry.note,
          });
        }
      }

      // Track the most recent entry overall
      if (!latest || new Date(entry.timestamp) > new Date(latest.fullTimestamp)) {
        latest = {
          date: dateString,
          level: entry.level,
          mood: entry.mood,
          fullTimestamp: entry.timestamp,
          note: entry.note,
        };
      }
    });

    return {
      chartData: Array.from(dayMap.values()),
      latestEntry: latest,
    };
  }, [entries]);

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = MOOD_COLORS[payload.mood];
    return (
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.date}</p>
          <p className="text-sm text-gray-600">{MOOD_LABELS[data.mood]}</p>
          {data.note && <p className="text-xs text-gray-500 mt-1">{data.note}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">
          Emotion Timeline
        </h2>
        <p className="text-sm text-gray-600">
          Your past journey, traced through the week
        </p>
      </div>

      {/* Chart */}
      {chartData.every((d) => d.level === 0) ? (
        <div className="h-80 flex items-center justify-center text-gray-500">
          <p>No mood data yet. Start logging to see your trends.</p>
        </div>
      ) : (
        <div className="mb-8">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="#F3E8FF"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                style={{ fontSize: "12px", fontWeight: "500" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide={true} domain={[1, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="natural"
                dataKey="level"
                stroke="#D8B4FE"
                strokeWidth={2}
                dot={<CustomDot />}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Latest Entry Card */}
      {latestEntry && latestEntry.level > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0"
            style={{ backgroundColor: MOOD_COLORS[latestEntry.mood] }}
          >
            {MOOD_ICONS[latestEntry.mood]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">
                {latestEntry.note
                  ? latestEntry.note.split(" ").slice(0, 2).join(" ")
                  : MOOD_LABELS[latestEntry.mood]}
              </p>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-200 text-green-800">
                {MOOD_LABELS[latestEntry.mood]}
              </span>
            </div>
            {latestEntry.note && (
              <p className="text-sm text-gray-600">{latestEntry.note}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
