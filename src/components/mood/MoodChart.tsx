"use client";

//Importamos los hooks de Redux para acceder y modificar el estado
//nos permite guardar y obtener datos de las emociones

import { useAppDispatch, useAppSelector } from "@/store";
import { MoodEntry, fetchMoodEntries } from "@/store/moodSlice";
import { useEffect, useMemo, useRef } from "react";
import html2canvas from "html2canvas-pro";
import { generateEmotionReportPdf } from "@/lib/generateEmotionReportPdf";

//Traemos la gráfica y todo lo relacionado a colores/emojis desde su
//propio archivo, así este componente no se llena de código de la gráfica

import EmotionLineChart, {
  ChartDataPoint,
  MOOD_COLORS,
  MOOD_LABELS,
} from "@/components/mood/EmotionLineChart";

//Componente principal que muestra el gráfico de emociones
//aquí se junta todo: gráfico, tabla, PDF y estadísticas

export default function MoodChart() {
  //Traemos dispatch para enviar acciones a Redux
  //entries tiene todas las emociones guardadas

  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.mood.entries);
  const loading = useAppSelector((state) => state.mood.loading);
  //Usuario real logueado desde Redux (antes se usaba TEMP_USER_ID fijo)
  const user = useAppSelector((state) => state.user.user);

  //chartRef es para acceder al elemento HTML del gráfico
  //lo usamos para convertir el gráfico a imagen cuando generamos el PDF

  const chartRef = useRef<HTMLDivElement>(null);

  //Cuando el componente carga (y ya hay usuario logueado), pedimos
  //que traiga todas las emociones de ESE usuario

  useEffect(() => {
    if (user) {
      dispatch(fetchMoodEntries(user.id));
    }
  }, [dispatch, user]);

  //useMemo calcula los datos del gráfico solo cuando cambian los entries
  //así no recalculamos todo cada vez que se renderiza el componente

  const { chartData, latestEntry, stats } = useMemo(() => {
    //Convertimos cada entrada en un punto del gráfico
    //date es la fecha formateada y time es la hora formateada

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

    //Ordenamos los puntos por fecha para que el gráfico tenga sentido
    //de lo más viejo a lo más nuevo

    chartDataPoints.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    //Contamos cuántas veces aparece cada emoción
    //lo usamos para mostrar estadísticas y encontrar la más común

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

    //Encontramos la emoción que más aparece
    //primero ordenamos por cantidad y sacamos la primera

    const mostCommonMood =
      Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "calm";

    //Sacamos la última entrada (la más reciente)
    //la mostramos en un card especial arriba de la tabla

    const latest = entries.length > 0 ? chartDataPoints[chartDataPoints.length - 1] : null;

    //Devolvemos todos los datos que necesita el componente
    //chartData para el gráfico, latestEntry para el card, stats para las estadísticas

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

  //Función que arma el PDF del reporte
  //primero convierte la gráfica a imagen y luego llama al generador del PDF

  const downloadPDF = async () => {
    //Verificamos que exista el elemento del gráfico
    //si no existe, no hacemos nada

    if (!chartRef.current) return;

    try {
      //Convertimos el elemento HTML del gráfico a una imagen
      //scale: 2 hace la imagen más clara

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#FFFFFF",
        scale: 2,
      });

      //Le mandamos la imagen y los datos ya calculados al generador de PDF
      //toda la lógica de dibujar el PDF vive en generateEmotionReportPdf.ts

      await generateEmotionReportPdf(
        canvas.toDataURL("image/png"),
        canvas.width,
        canvas.height,
        chartData,
        stats,
      );
    } catch (error) {
      //Si hay algún error al generar el PDF, lo mostramos en la consola
      //así sabemos qué salió mal

      console.error("Error generating PDF:", error);
    }
  };

  //Retornamos el HTML del componente
  //es el contenedor principal con el gráfico, tabla y botón de descargar

  return (
    <div className="bg-gradient-to-b from-orange-50 to-white rounded-2xl shadow-lg p-8">
      {/* Encabezado con título y botón de descargar PDF */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          {/* Título principal del componente */}
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">
            Emotion Timeline
          </h2>
          {/* Descripción corta de qué hace este componente */}
          <p className="text-sm text-gray-600">
            Your complete emotion journey with timestamps
          </p>
        </div>

        {/* Botón para descargar el PDF, solo se muestra si hay entradas */}
        {entries.length > 0 && (
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            Download PDF
          </button>
        )}
      </div>

      {/* Contenedor del gráfico (el ref para convertir a PDF) */}
      <div ref={chartRef} className="bg-white p-4 rounded-lg">
        {/* Si está cargando, mostramos un mensaje de carga */}
        {loading ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <p>Loading your emotion data...</p>
          </div>
        ) : chartData.length === 0 ? (
          /* Si no hay datos, mostramos un mensaje para que empiece a registrar */
          <div className="h-80 flex items-center justify-center text-gray-500">
            <p>No mood data yet. Start logging to see your trends.</p>
          </div>
        ) : (
          /* Si hay datos, mostramos el gráfico */
          <div className="mb-8">
            <EmotionLineChart data={chartData} />
          </div>
        )}
      </div>

      {/* Card que muestra la última emoción registrada */}
      {latestEntry && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-start gap-4 mt-6">
          {/* Círculo de color que identifica la emoción */}
          <div
            className="w-12 h-12 rounded-full flex-shrink-0"
            style={{ backgroundColor: MOOD_COLORS[latestEntry.mood] }}
          />
          <div className="flex-1">
            {/* Nombre de la emoción, hora y fecha */}
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">
                {MOOD_LABELS[latestEntry.mood]} - {latestEntry.time}
              </p>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-200 text-green-800">
                {latestEntry.date}
              </span>
            </div>
            {/* Si hay nota, la mostramos */}
            {latestEntry.note && (
              <p className="text-sm text-gray-600">&quot;{latestEntry.note}&quot;</p>
            )}
          </div>
        </div>
      )}

      {/* Tabla con todas las emociones registradas */}
      {chartData.length > 0 && (
        <div className="mt-8">
          {/* Título de la tabla con el número total de entradas */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Latest Entries ({Math.min(5, chartData.length)} of {chartData.length})  
          </h3>
          {/* Contenedor con scroll horizontal por si la tabla es muy ancha */}
          <div className="overflow-x-auto">
            {/* Tabla con las columnas: fecha, hora, emoción y nota */}
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
                {/* Invertimos los datos para mostrar lo más reciente primero */}
                {chartData.slice().reverse().slice(0, 5).map((entry, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    {/* Fecha de la entrada */}
                    <td className="py-2 px-3 text-gray-700">{entry.date}</td>
                    {/* Hora de la entrada */}
                    <td className="py-2 px-3 text-gray-700 font-medium">{entry.time}</td>
                    {/* Emoción */}
                    <td className="py-2 px-3">
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: MOOD_COLORS[entry.mood] }}
                        />
                        {MOOD_LABELS[entry.mood]}
                      </span>
                    </td>
                    {/* Nota (si no hay nota, mostramos un guión "-") */}
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
