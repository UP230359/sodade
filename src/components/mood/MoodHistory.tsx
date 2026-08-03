"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { MoodEntry, fetchMoodEntries } from "@/store/moodSlice";
import { useEffect, useMemo } from "react";

//Aqui defino el color de fondo que le toca a cada emocion
const MOOD_COLORS: Record<MoodEntry["mood"], string> = {
  joy: "bg-yellow-100 text-yellow-700",
  calm: "bg-green-100 text-green-700",
  sadness: "bg-blue-100 text-blue-700",
  anger: "bg-red-100 text-red-700",
  fear: "bg-purple-100 text-purple-700",
  disgust: "bg-emerald-100 text-emerald-700",
  surprise: "bg-orange-100 text-orange-700",
  trust: "bg-indigo-100 text-indigo-700",
};

//Aqui defino el nombre que se muestra de cada emocion
//esto es porque en la base de datos y en el codigo se manejan en minuscula
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
  //Traigo el dispatch para poder pedir los datos
  const dispatch = useAppDispatch();
  //Traigo los checkins, si esta cargando y si hubo error desde redux
  const entries = useAppSelector((state) => state.mood.entries);
  const loading = useAppSelector((state) => state.mood.loading);
  const error = useAppSelector((state) => state.mood.error);
  //Usuario real logueado desde Redux (antes se usaba TEMP_USER_ID fijo)
  const user = useAppSelector((state) => state.user.user);

  //Cuando el componente se monta (y ya hay usuario logueado) pido
  //los checkins de ESE usuario, no de un ID fijo
  useEffect(() => {
    if (user) {
      dispatch(fetchMoodEntries(user.id));
    }
  }, [dispatch, user]);

  //Aqui ordeno los checkins del mas nuevo al mas viejo
  //uso useMemo para que no se vuelva a ordenar en cada render
  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [entries]);

  //Esta funcion le da formato a la fecha
  //si es hoy o ayer lo dice, si no muestra la fecha normal
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

  //Mientras se estan trayendo los datos se muestra este mensaje
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-serif text-gray-800 mb-4">History</h2>
        <p className="text-gray-500">Loading your checkins...</p>
      </div>
    );
  }

  //Si algo fallo al traer los datos se muestra este mensaje
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-serif text-gray-800 mb-4">History</h2>
        <p className="text-red-500">
          Couldn&apos;t load your checkins. Please try again later.
        </p>
      </div>
    );
  }

  //Si no hay ningun checkin todavia se muestra este mensaje
  if (sortedEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-serif text-gray-800 mb-4">History</h2>
        <p className="text-gray-500">
          No mood entries yet. Start tracking your emotions to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Titulo de la seccion */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-orange-600 tracking-wide uppercase">
          Past Reflections
        </p>
        <h2 className="text-3xl font-serif text-gray-900">History</h2>
      </div>

      {/* Aqui recorro todos los checkins y pinto una tarjeta por cada uno */}
      <div className="space-y-4">
        {sortedEntries.map((entry) => (
          <div
            key={entry.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Aqui va el punto de color, el nombre de la emocion y la fecha */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full inline-block ${MOOD_COLORS[entry.mood].split(" ")[0]}`}
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {MOOD_LABELS[entry.mood]}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
              </div>

              {/* Aqui se muestra el nivel de la emocion del 1 al 5 */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${MOOD_COLORS[entry.mood]}`}>
                {entry.level}/5
              </div>
            </div>

            {/* Aqui se muestra la nota, solo si el usuario escribio algo */}
            {entry.note && (
              <p className="text-gray-700 mb-3 leading-relaxed">{entry.note}</p>
            )}

            {/* Aqui se muestran los tags, solo si tiene alguno */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
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
