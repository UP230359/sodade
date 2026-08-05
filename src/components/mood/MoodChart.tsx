"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { MoodEntry, fetchMoodEntries } from "@/store/moodSlice";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useMemo, useRef } from "react";
import html2canvas from "html2canvas-pro";
import { generateEmotionReportPdf } from "@/lib/generateEmotionReportPdf";

import EmotionLineChart, {
  ChartDataPoint,
  MOOD_COLORS,
  MOOD_LABELS,
} from "@/components/mood/EmotionLineChart";

export default function MoodChart() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.mood.entries);
  const loading = useAppSelector((state) => state.mood.loading);
  const { user } = useAuth();
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      dispatch(fetchMoodEntries(user.id));
    }
  }, [dispatch, user]);

  const { chartData, latestEntry, stats } = useMemo(() => {
    const chartDataPoints: ChartDataPoint[] = entries.map((entry) => {
      const date = new Date(entry.timestamp);
      return {
        timestamp: entry.timestamp,
        level: entry.level,
        mood: entry.mood,
        note: entry.note,
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
    });

    chartDataPoints.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const moodCounts: Record<MoodEntry["mood"], number> = {
      joy: 0, calm: 0, sadness: 0, anger: 0, fear: 0, disgust: 0, surprise: 0, trust: 0,
    };

    entries.forEach((entry) => {
      if (moodCounts[entry.mood] !== undefined) {
        moodCounts[entry.mood]++;
      }
    });

    const mostCommonMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "calm";
    const latest = entries.length > 0 ? chartDataPoints[chartDataPoints.length - 1] : null;

    return {
      chartData: chartDataPoints,
      latestEntry: latest,
      stats: {
        totalEntries: entries.length,
        mostCommonMood,
        lastWeekEntries: entries.filter(
          (e) => new Date(e.timestamp).getTime() > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
        ).length,
        moodCounts,
      },
    };
  }, [entries]);

  const downloadPDF = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: "#FFFFFF", scale: 2 });
      await generateEmotionReportPdf(canvas.toDataURL("image/png"), canvas.width, canvas.height, chartData, stats);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-1">
            Emotion Timeline
          </h2>
          <p className="text-sm text-secondary">
            Your complete emotion journey with timestamps
          </p>
        </div>

        {entries.length > 0 && (
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm shrink-0"
          >
            Download PDF
          </button>
        )}
      </div>

      <div ref={chartRef} className="bg-background rounded-lg">
        {loading ? (
          <div className="h-64 md:h-80 flex items-center justify-center text-secondary">
            <p>Loading your emotion data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 md:h-80 flex items-center justify-center text-secondary text-center px-4">
            <p>No mood data yet. Start logging to see your trends.</p>
          </div>
        ) : (
          <div className="mb-8 overflow-x-auto">
            <div className="min-w-[600px]">
              <EmotionLineChart data={chartData} />
            </div>
          </div>
        )}
      </div>

      {latestEntry && (
        <div className="bg-muted/30 border border-muted rounded-xl p-4 flex items-start gap-4 mt-6">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0"
            style={{ backgroundColor: MOOD_COLORS[latestEntry.mood as keyof typeof MOOD_COLORS] || '#ccc' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-semibold text-foreground text-sm md:text-base">
                {MOOD_LABELS[latestEntry.mood as keyof typeof MOOD_LABELS] || latestEntry.mood} - {latestEntry.time}
              </p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {latestEntry.date}
              </span>
            </div>
            {latestEntry.note && (
              <p className="text-sm text-secondary mt-1">&quot;{latestEntry.note}&quot;</p>
            )}
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">
            Latest Entries ({Math.min(5, chartData.length)} of {chartData.length})
          </h3>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-muted">
                  <th className="text-left py-2 px-4 md:px-3 text-secondary font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-secondary font-medium">Time</th>
                  <th className="text-left py-2 px-3 text-secondary font-medium">Emotion</th>
                  <th className="text-left py-2 px-4 md:px-3 text-secondary font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {chartData.slice().reverse().slice(0, 5).map((entry, idx) => (
                  <tr key={idx} className="border-b border-muted/50 hover:bg-muted/20">
                    <td className="py-3 px-4 md:px-3 text-foreground whitespace-nowrap">{entry.date}</td>
                    <td className="py-3 px-3 text-foreground font-medium whitespace-nowrap">{entry.time}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="flex items-center gap-2 text-foreground">
                        <span
                          className="w-3 h-3 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: MOOD_COLORS[entry.mood as keyof typeof MOOD_COLORS] || '#ccc' }}
                        />
                        {MOOD_LABELS[entry.mood as keyof typeof MOOD_LABELS] || entry.mood}
                      </span>
                    </td>
                    <td className="py-3 px-4 md:px-3 text-secondary truncate max-w-[150px] md:max-w-xs">
                      {entry.note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
