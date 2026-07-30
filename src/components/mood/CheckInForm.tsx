"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { submitMoodEntry, fetchMoodEntries, MoodEntry } from "@/store/moodSlice";
import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import { TEMP_USER_ID } from "@/lib/constants";

type MoodType = MoodEntry["mood"];

//Lista de las emociones que se pueden elegir en el formulario
//cada una tiene su nombre y su valor
const MOODS: { label: string; value: MoodType }[] = [
  { label: "Joy", value: "joy" },
  { label: "Calm", value: "calm" },
  { label: "Sadness", value: "sadness" },
  { label: "Anger", value: "anger" },
  { label: "Fear", value: "fear" },
  { label: "Disgust", value: "disgust" },
  { label: "Surprise", value: "surprise" },
  { label: "Trust", value: "trust" },
];

//Lista de los tags que puede elegir el usuario para decir que
//influyo en como se siente, cada uno tiene su color (variant)
const INFLUENCE_TAGS: { label: string; variant: "primary" | "secondary" | "joy" | "calm" | "sadness" | "anger" | "anxiety" | "neutral" }[] = [
  { label: "Work", variant: "primary" },
  { label: "Family", variant: "calm" },
  { label: "Health", variant: "joy" },
  { label: "Finances", variant: "anxiety" },
  { label: "Relationships", variant: "secondary" },
  { label: "Weather", variant: "neutral" },
  { label: "Sleep", variant: "sadness" },
];

export default function CheckInForm() {
  //Traigo el dispatch para poder llamar las funciones de redux
  const dispatch = useAppDispatch();
  //Traigo el estado de submitting para saber si se esta guardando algo
  const submitting = useAppSelector((state) => state.mood.submitting);

  //Esto es para evitar un error de hydration en el boton
  //en el primer render el estado de redux no siempre coincide entre
  //servidor y cliente, entonces mientras no este montado lo ignoro
  const [mounted, setMounted] = useState(false);
  //Aqui pongo mounted en true una sola vez cuando ya cargo el componente
  //esto ya lo revise y es normal que el linter marque advertencia aqui
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  //Estados locales del formulario
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  //Esta funcion agrega o quita un tag cuando le dan click
  //si ya estaba seleccionado lo quita, si no estaba lo agrega
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  //Esta funcion se ejecuta cuando se manda el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //Si no eligio ninguna emocion no dejo que mande el formulario
    if (!selectedMood) {
      alert("Please select an emotion");
      return;
    }

    try {
      //Aqui se manda la peticion a la api usando axios
      //y se guarda el resultado en redux
      await dispatch(
        submitMoodEntry({
          userId: TEMP_USER_ID,
          mood: selectedMood,
          note: note || `I'm feeling ${selectedMood}`,
          tags: selectedTags,
        }),
      ).unwrap();

      //Se vuelve a pedir la lista para que el historial quede actualizado
      await dispatch(fetchMoodEntries(TEMP_USER_ID));

      //Se muestra el mensaje de que ya se guardo
      setSubmitted(true);

      //Se limpia el formulario despues de un rato
      setTimeout(() => {
        setSelectedMood(null);
        setSelectedTags([]);
        setNote("");
        setSubmitted(false);
      }, 1500);
    } catch (err) {
      //Si algo sale mal se muestra una alerta simple
      console.error(err);
      alert("No se pudo guardar tu reflexión. Intenta de nuevo.");
    }
  };

  //Si ya se guardo el checkin se muestra este mensaje en vez del formulario
  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-serif text-gray-900 mb-2">
          Emotion logged!
        </h2>
        <p className="text-gray-600">
          Your reflection has been saved. Check your history to see it.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        {/* Aqui va el titulo del formulario */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-orange-600 tracking-wide uppercase mb-2">
            Daily Check-in
          </p>
          <h2 className="text-3xl font-serif text-gray-900">
            How are you feeling?
          </h2>
        </div>

        {/* Aqui se pintan los botones de las emociones */}
        {/* al darle click a uno se guarda en selectedMood */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            Select your primary emotion
          </p>
          <div className="flex flex-wrap gap-3">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value)}
                className={`px-4 py-2 rounded-full font-medium transition-all border-2 ${
                  selectedMood === mood.value
                    ? "bg-yellow-200 border-yellow-400 text-gray-900 scale-105"
                    : "bg-gray-100 border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aqui se pintan los tags opcionales usando el componente Badge */}
        {/* si el tag ya esta seleccionado se le pone un anillo alrededor */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            What is influencing this? (Optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {INFLUENCE_TAGS.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => toggleTag(tag.label)}
                className={`transition-all transform ${
                  selectedTags.includes(tag.label) ? "scale-110" : "scale-100"
                }`}
              >
                <Badge
                  variant={tag.variant}
                  className={`cursor-pointer ${
                    selectedTags.includes(tag.label)
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : ""
                  }`}
                >
                  {tag.label}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Aqui va el cuadro de texto para escribir la nota opcional */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-900 mb-4">
            Add a brief note (Optional)
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind? Write anything..."
            className="w-full p-4 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            rows={5}
          />
        </div>

        {/* Boton para mandar el formulario */}
        {/* se desactiva si no hay emocion elegida o si se esta guardando */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
            disabled={!selectedMood || (mounted && submitting)}
          >
            {submitting ? "Saving..." : "Log Reflection"}
          </button>
        </div>
      </form>

      {/* Este cuadro solo se muestra si ya se eligio una emocion */}
      {/* sirve para que el usuario vea un resumen antes de mandar */}
      {selectedMood && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Emotion:</span> {selectedMood}
          </p>
          {selectedTags.length > 0 && (
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-semibold">Factors:</span> {selectedTags.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
