// Define standard mappings for emotions to your global CSS variables
export const EMOTION_CONFIG = {
  joy: {
    name: "Joy",
    colorClass: "text-joy",
    bgClass: "bg-joy",
    lightBgClass: "bg-joy/10",
  },
  calm: {
    name: "Calm",
    colorClass: "text-calm",
    bgClass: "bg-calm",
    lightBgClass: "bg-calm/10",
  },
  sadness: {
    name: "Sadness",
    colorClass: "text-sadness",
    bgClass: "bg-sadness",
    lightBgClass: "bg-sadness/10",
  },
  anger: {
    name: "Anger",
    colorClass: "text-anger",
    bgClass: "bg-anger",
    lightBgClass: "bg-anger/10",
  },
  anxiety: {
    name: "Anxiety",
    colorClass: "text-anxiety",
    bgClass: "bg-anxiety",
    lightBgClass: "bg-anxiety/10",
  },
  neutral: {
    name: "Neutral",
    colorClass: "text-neutral",
    bgClass: "bg-neutral",
    lightBgClass: "bg-neutral/10",
  },
} as const;

export type EmotionType = keyof typeof EMOTION_CONFIG;
