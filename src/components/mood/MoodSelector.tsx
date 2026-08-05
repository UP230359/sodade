"use client";

// Import the 8 core emotions and the styling function from moodStats
// This ensures we send exactly what the MySQL database expects (preventing the 400 error)
import { CORE_EMOTIONS, emotionSquareClass } from "@/lib/moodStats";

// We export the type so CheckInForm knows exactly what strings are valid
export type MoodType = typeof CORE_EMOTIONS[number]["key"];

interface MoodSelectorProps {
  selected: MoodType | null;
  onSelect: (mood: MoodType) => void;
}

export default function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {CORE_EMOTIONS.map((mood) => {
        const isSelected = selected === mood.key;

        // Get the exact global color class (e.g. bg-joy, bg-anxiety) for the active state
        // This maps the 8 raw DB emotions to our 6 global CSS accent colors
        const bgClass = emotionSquareClass(mood.key);

        return (
          <button
            key={mood.key}
            type="button"
            onClick={() => onSelect(mood.key as MoodType)}
            className={`px-4 py-2 rounded-full font-medium transition-all border ${isSelected
                ? `${bgClass} text-foreground border-transparent scale-105 shadow-sm`
                : "bg-background border-muted text-secondary hover:border-foreground/30 hover:text-foreground"
              }`}
          >
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}
