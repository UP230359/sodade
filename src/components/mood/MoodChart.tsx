"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { MoodEntry, fetchMoodEntries } from "@/store/moodSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useMemo, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import "jspdf/dist/jspdf.umd.min.js";
import { TEMP_USER_ID } from "@/lib/constants";

interface ChartDataPoint {
  timestamp: string;
  level: number;
  mood: MoodEntry["mood"];
  note?: string;
  date: string;
  time: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
}

const MOOD_COLORS: Record<MoodEntry["mood"], string> = {
  joy: "#FBBF24",
  calm: "#22C55E",
  sadness: "#3B82F6",
  anger: "#EF4444",
  fear: "#A855F7",
  disgust: "#10B981",
  surprise: "#F97316",
  trust: "#6366F1",
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

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{data.date}</p>
        <p className="text-sm font-medium text-gray-700">{data.time}</p>
        <p className="text-sm text-gray-600">{MOOD_LABELS[data.mood]}</p>
        {data.note && <p className="text-xs text-gray-500 mt-1">&quot;{data.note}&quot;</p>}
      </div>
    );
  }
  return null;
};

const CustomDot = (props: CustomDotProps) => {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;

  const color = MOOD_COLORS[payload.mood];
  return (
    <circle
      cx={cx}
      cy={cy}
      r={8}
      fill={color}
      stroke="white"
      strokeWidth={2}
    />
  );
};

export default function MoodChart() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.mood.entries);
  const loading = useAppSelector((state) => state.mood.loading);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchMoodEntries(TEMP_USER_ID));
  }, [dispatch]);

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
      joy: 0,
      calm: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      disgust: 0,
      surprise: 0,
      trust: 0,
    };

    entries.forEach((entry) => {
      moodCounts[entry.mood]++;
    });

    const mostCommonMood =
      Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "calm";

    const latest = entries.length > 0 ? chartDataPoints[chartDataPoints.length - 1] : null;

    return {
      chartData: chartDataPoints,
      latestEntry: latest,
      stats: {
        totalEntries: entries.length,
        mostCommonMood,
        lastWeekEntries: entries.filter(
          (e) =>
            new Date(e.timestamp).getTime() >
            // eslint-disable-next-line
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
        ).length,
        moodCounts,
      },
    };
  }, [entries]);

  const downloadPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#FFFFFF",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.setFontSize(24);
      pdf.setTextColor(31, 41, 55);
      pdf.text("Emotion Timeline Report", 20, 25);

      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        20,
        32
      );

      pdf.setDrawColor(229, 231, 235);
      pdf.line(20, 35, 190, 35);

      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 20, 40, imgWidth, imgHeight);

      let currentY = 45 + imgHeight + 15;

      // Alto de página A4 y margen inferior. Antes de dibujar cualquier
      // bloque (título, header de tabla, o fila), se valida que quepa en
      // lo que resta de la página; si no, se agrega una página nueva y
      // currentY se reinicia arriba. Así ninguna fila se dibuja fuera de
      // los límites del PDF (que antes simplemente se perdía sin avisar).
      const PAGE_HEIGHT = 297;
      const BOTTOM_MARGIN = 20;
      const ensureSpace = (neededHeight: number) => {
        if (currentY + neededHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
          pdf.addPage();
          currentY = 20;
        }
      };

      ensureSpace(8 + 8 + 3 * 7);

      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      pdf.text("Summary Statistics", 20, currentY);

      currentY += 8;

      pdf.setFontSize(10);
      pdf.setFillColor(243, 244, 246);
      pdf.rect(20, currentY, 170, 8, "F");
      pdf.setTextColor(55, 65, 81);
      pdf.text("Metric", 25, currentY + 6);
      pdf.text("Value", 155, currentY + 6);

      currentY += 8;

      pdf.setTextColor(75, 85, 99);
      pdf.setFontSize(9);

      const statsRows = [
        ["Total Emotions Logged", `${stats.totalEntries}`],
        ["Most Common Emotion", `${MOOD_LABELS[stats.mostCommonMood as MoodEntry["mood"]]}`],
        ["Entries This Week", `${stats.lastWeekEntries}`],
      ];

      statsRows.forEach((row) => {
        ensureSpace(7);
        pdf.rect(20, currentY, 170, 7);
        pdf.text(row[0], 25, currentY + 5);
        pdf.text(row[1], 155, currentY + 5);
        currentY += 7;
      });

      currentY += 5;

      const distributionRows = Object.entries(stats.moodCounts).filter(
        ([, count]) => count > 0,
      );

      ensureSpace(8 + 8 + Math.min(distributionRows.length, 3) * 7);

      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      pdf.text("Emotion Distribution", 20, currentY);

      currentY += 8;

      pdf.setFontSize(10);
      pdf.setFillColor(243, 244, 246);
      pdf.rect(20, currentY, 170, 8, "F");
      pdf.setTextColor(55, 65, 81);
      pdf.text("Emotion", 25, currentY + 6);
      pdf.text("Count", 120, currentY + 6);
      pdf.text("Percentage", 155, currentY + 6);

      currentY += 8;

      pdf.setTextColor(75, 85, 99);
      pdf.setFontSize(9);

      distributionRows.forEach(([mood, count]) => {
        const percentage = ((count / stats.totalEntries) * 100).toFixed(1);
        ensureSpace(7);
        pdf.rect(20, currentY, 170, 7);
        pdf.text(MOOD_LABELS[mood as MoodEntry["mood"]], 25, currentY + 5);
        pdf.text(count.toString(), 120, currentY + 5);
        pdf.text(`${percentage}%`, 155, currentY + 5);
        currentY += 7;
      });

      currentY += 5;

      const recentEntries = chartData.slice(-10).reverse();

      ensureSpace(8 + 8 + Math.min(recentEntries.length, 3) * 7);

      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      pdf.text("Recent Entries", 20, currentY);

      currentY += 8;

      // Header de la tabla de "Recent Entries". Se define como función
      // porque si la tabla salta de página, hay que volver a dibujar el
      // header en la página nueva para que la continuación se entienda.
      const drawRecentEntriesHeader = () => {
        pdf.setFontSize(10);
        pdf.setFillColor(243, 244, 246);
        pdf.rect(20, currentY, 170, 8, "F");
        pdf.setTextColor(55, 65, 81);
        pdf.text("Date", 25, currentY + 6);
        pdf.text("Time", 55, currentY + 6);
        pdf.text("Emotion", 85, currentY + 6);
        pdf.text("Note", 140, currentY + 6);
        currentY += 8;
      };

      drawRecentEntriesHeader();

      pdf.setTextColor(75, 85, 99);
      pdf.setFontSize(8);

      recentEntries.forEach((entry) => {
        const notePreview = entry.note ? entry.note.substring(0, 20) : "-";

        const neededForRow = 7;
        if (currentY + neededForRow > PAGE_HEIGHT - BOTTOM_MARGIN) {
          pdf.addPage();
          currentY = 20;
          drawRecentEntriesHeader();
          pdf.setTextColor(75, 85, 99);
          pdf.setFontSize(8);
        }

        pdf.rect(20, currentY, 170, 7);
        pdf.text(entry.date, 25, currentY + 5);
        pdf.text(entry.time, 55, currentY + 5);
        pdf.text(MOOD_LABELS[entry.mood], 85, currentY + 5);
        pdf.text(notePreview, 140, currentY + 5);
        currentY += 7;
      });

      // El footer va justo debajo del contenido, no en una posición fija.
      // Se agrega en CADA página del documento (no solo la última), para
      // que se vea consistente sin importar cuántas páginas resulten.
      const totalPages = pdf.getNumberOfPages();
      for (let page = 1; page <= totalPages; page++) {
        pdf.setPage(page);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(
          `Report generated by Sodade - Emotion Tracking Platform | Page ${page} of ${totalPages}`,
          20,
          PAGE_HEIGHT - 12,
        );
      }

      pdf.save(
        `emotion-report-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-white rounded-2xl shadow-lg p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">
            Emotion Timeline
          </h2>
          <p className="text-sm text-gray-600">
            Your complete emotion journey with timestamps
          </p>
        </div>

        {entries.length > 0 && (
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <span>📄</span>
            Download PDF
          </button>
        )}
      </div>

      <div ref={chartRef} className="bg-white p-4 rounded-lg">
        {loading ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <p>Loading your emotion data...</p>
          </div>
        ) : chartData.length === 0 ? (
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
                  dataKey="time"
                  stroke="#9CA3AF"
                  style={{ fontSize: "12px", fontWeight: "500" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide={true} domain={[1, 5]} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {latestEntry && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-start gap-4 mt-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0"
            style={{ backgroundColor: MOOD_COLORS[latestEntry.mood] }}
          >
            {MOOD_ICONS[latestEntry.mood]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">
                {MOOD_LABELS[latestEntry.mood]} - {latestEntry.time}
              </p>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-200 text-green-800">
                {latestEntry.date}
              </span>
            </div>
            {latestEntry.note && (
              <p className="text-sm text-gray-600">&quot;{latestEntry.note}&quot;</p>
            )}
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Entries ({chartData.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600">Date</th>
                  <th className="text-left py-2 px-3 text-gray-600">Time</th>
                  <th className="text-left py-2 px-3 text-gray-600">Emotion</th>
                  <th className="text-left py-2 px-3 text-gray-600">Note</th>
                </tr>
              </thead>
              <tbody>
                {chartData.slice().reverse().map((entry, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-700">{entry.date}</td>
                    <td className="py-2 px-3 text-gray-700 font-medium">{entry.time}</td>
                    <td className="py-2 px-3">
                      <span className="flex items-center gap-2">
                        {MOOD_ICONS[entry.mood]}
                        {MOOD_LABELS[entry.mood]}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600 truncate">
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
