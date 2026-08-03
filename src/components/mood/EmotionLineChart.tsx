"use client";

//Importamos los componentes del gráfico de Recharts
//esto es para dibujar líneas, ejes y otras cosas en la visualización

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MoodEntry } from "@/store/moodSlice";

//Definimos qué forma tiene cada punto en el gráfico
//timestamp es la hora exacta, level es del 1 al 5, mood es la emoción

export interface ChartDataPoint {
  timestamp: string;
  level: number;
  mood: MoodEntry["mood"];
  note?: string;
  date: string;
  time: string;
}

//Aquí guardamos el color para cada emoción
//cada emoción tiene su color específico para identificarla

export const MOOD_COLORS: Record<MoodEntry["mood"], string> = {
  joy: "#FBBF24",
  calm: "#22C55E",
  sadness: "#3B82F6",
  anger: "#EF4444",
  fear: "#A855F7",
  disgust: "#10B981",
  surprise: "#F97316",
  trust: "#6366F1",
};

//Los nombres en inglés de cada emoción
//se usan en los textos y en el PDF del reporte

export const MOOD_LABELS: Record<MoodEntry["mood"], string> = {
  joy: "Joy",
  calm: "Calm",
  sadness: "Sadness",
  anger: "Anger",
  fear: "Fear",
  disgust: "Disgust",
  surprise: "Surprise",
  trust: "Trust",
};

//Esto es para el popup que aparece cuando pasas el ratón sobre el gráfico
//active dice si está visible, payload tiene los datos

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

//Componente del popup que sale al pasar el ratón
//muestra la fecha, hora, emoción y nota si la hay

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  //Si el popup está activo y hay datos, mostramos la información
  //si no, devolvemos null para que no se vea nada

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

//Props para los puntos de colores en el gráfico
//cx y cy son las coordenadas donde dibujar el círculo

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartDataPoint;
}

//Componente para dibujar los puntitos en el gráfico
//cada punto es un círculo de color según la emoción

const CustomDot = (props: CustomDotProps) => {
  //Sacamos las posiciones x, y y los datos del punto
  //si faltan datos, no dibujamos nada

  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;

  //Obtenemos el color del punto según la emoción
  //y dibujamos un círculo con borde blanco

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

interface EmotionLineChartProps {
  data: ChartDataPoint[];
}

//Componente que dibuja la gráfica de líneas completa
//recibe los puntos ya calculados y solo se encarga de mostrarlos

export default function EmotionLineChart({ data }: EmotionLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      {/* LineChart dibuja la línea conectando todos los puntos */}
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        {/* CartesianGrid dibuja las líneas de fondo del gráfico */}
        <CartesianGrid strokeDasharray="0" stroke="#F3E8FF" vertical={false} />
        {/* XAxis muestra las horas en el eje horizontal */}
        <XAxis
          dataKey="time"
          stroke="#9CA3AF"
          style={{ fontSize: "12px", fontWeight: "500" }}
          axisLine={false}
          tickLine={false}
        />
        {/* YAxis muestra los niveles del 1 al 5, pero lo ocultamos */}
        <YAxis hide={true} domain={[1, 5]} />
        {/* Tooltip es el popup que sale al pasar el ratón */}
        <Tooltip content={<CustomTooltip />} />
        {/* Line dibuja la línea naranja conectando los puntos */}
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
  );
}
