"use client";

export type MoodType =
  | "joy"
  | "calm"
  | "sadness"
  | "anger"
  | "fear"
  | "disgust"
  | "surprise"
  | "trust";

//Lista de las emociones que se pueden elegir
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

interface MoodSelectorProps {
  selected: MoodType | null;
  onSelect: (mood: MoodType) => void;
}

//Este componente no guarda su propio estado, recibe la emocion
//seleccionada y una funcion para cambiarla desde el componente que lo usa
//asi se puede reutilizar en otros lados si hace falta despues
export default function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onSelect(mood.value)}
          className={`px-4 py-2 rounded-full font-medium transition-all border-2 ${
            selected === mood.value
              ? "bg-yellow-200 border-yellow-400 text-gray-900 scale-105"
              : "bg-gray-100 border-gray-200 text-gray-700 hover:border-gray-300"
          }`}
        >
          {mood.label}
        </button>
      ))}
    </div>
  );
}
