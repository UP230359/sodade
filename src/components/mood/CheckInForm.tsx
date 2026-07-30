"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { submitMoodEntry, fetchMoodEntries, MoodEntry } from "@/store/moodSlice";
import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import { TEMP_USER_ID } from "@/lib/constants";

type MoodType = MoodEntry["mood"];

const MOODS: { label: string; value: MoodType; icon: string }[] = [
  { label: "Joy", value: "joy", icon: "😊" },
  { label: "Calm", value: "calm", icon: "😌" },
  { label: "Sadness", value: "sadness", icon: "😢" },
  { label: "Anger", value: "anger", icon: "😠" },
  { label: "Fear", value: "fear", icon: "😨" },
  { label: "Disgust", value: "disgust", icon: "🤢" },
  { label: "Surprise", value: "surprise", icon: "😲" },
  { label: "Trust", value: "trust", icon: "🤝" },
];

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
  const dispatch = useAppDispatch();
  const submitting = useAppSelector((state) => state.mood.submitting);

  // Evita un hydration mismatch en el botón: en el primer render (servidor
  // y cliente antes de montar) "submitting" del store de Redux aún no está
  // garantizado a coincidir entre ambos, así que hasta que el componente
  // esté montado en el cliente, ignoramos su valor.
  const [mounted, setMounted] = useState(false);
  // Patrón estándar de Next.js para evitar hydration mismatch (ver
  // https://nextjs.org/docs/messages/react-hydration-error). El setState
  // es intencional y solo corre una vez al montar.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Local state
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Toggle tag
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMood) {
      alert("Please select an emotion");
      return;
    }

    try {
      // POST real a /api/checkins vía Axios (lib/api.ts), estado global en Redux
      await dispatch(
        submitMoodEntry({
          userId: TEMP_USER_ID,
          mood: selectedMood,
          note: note || `I'm feeling ${selectedMood}`,
          tags: selectedTags,
        }),
      ).unwrap();

      // Refresca el historial en Redux con lo que quedó guardado en la BD
      await dispatch(fetchMoodEntries(TEMP_USER_ID));

      // Show success message
      setSubmitted(true);

      // Reset form after 1.5 seconds
      setTimeout(() => {
        setSelectedMood(null);
        setSelectedTags([]);
        setNote("");
        setSubmitted(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar tu reflexión. Intenta de nuevo.");
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto text-center">
        <p className="text-4xl mb-4">✨</p>
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
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-orange-600 tracking-wide uppercase mb-2">
            Daily Check-in
          </p>
          <h2 className="text-3xl font-serif text-gray-900">
            How are you feeling?
          </h2>
        </div>

        {/* 1. Select Emotion (MoodSelector) */}
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
                <span className="mr-2">{mood.icon}</span>
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Select Tags (usando Badge component) */}
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

        {/* 3. Note */}
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

        {/* Submit Button */}
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

      {/* Selected Summary */}
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
