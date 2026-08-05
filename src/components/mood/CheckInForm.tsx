"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { submitMoodEntry, fetchMoodEntries } from "@/store/moodSlice";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
// Import the corrected MoodType that strictly matches the database
import MoodSelector, { MoodType } from "@/components/mood/MoodSelector";

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
  const { user } = useAuth();

  const [shareAnonymously, setShareAnonymously] = useState(true);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Now bound strictly to the 8 valid emotions
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMood) {
      alert("Please select an emotion");
      return;
    }

    if (!user) {
      alert("Please log in again");
      return;
    }

    try {
      await dispatch(
        submitMoodEntry({
          userId: user.id,
          mood: selectedMood,
          note: note || `I'm feeling ${selectedMood}`,
          tags: selectedTags,
          sharedAnonymously: shareAnonymously,
        }),
      ).unwrap();

      await dispatch(fetchMoodEntries(user.id));
      setSubmitted(true);

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
      <div className="text-center p-6 md:p-8">
        <h2 className="text-2xl font-serif text-foreground mb-2">
          Emotion logged!
        </h2>
        <p className="text-secondary">
          Your reflection has been saved. Check your history to see it.
        </p>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6">
      <form onSubmit={handleSubmit}>
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-primary tracking-wide uppercase mb-2">
            Daily Check-in
          </p>
          <h2 className="text-2xl md:text-3xl font-serif text-foreground">
            How are you feeling?
          </h2>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-foreground mb-4">
            Select your primary emotion
          </p>
          <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-foreground mb-4">
            What is influencing this? (Optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {INFLUENCE_TAGS.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => toggleTag(tag.label)}
                className={`transition-all transform ${selectedTags.includes(tag.label) ? "scale-105" : "scale-100"}`}
              >
                <Badge
                  variant={tag.variant}
                  className={`cursor-pointer ${selectedTags.includes(tag.label) ? "ring-2 ring-offset-2 ring-foreground/30" : ""
                    }`}
                >
                  {tag.label}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-foreground mb-4">
            Add a brief note (Optional)
          </p>
          <div className="mb-6 flex items-start gap-3 bg-muted/30 p-3 rounded-lg">
            <input
              id="shareAnonymously"
              type="checkbox"
              checked={shareAnonymously}
              onChange={(e) => setShareAnonymously(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded-sm border-muted text-primary focus:ring-primary cursor-pointer shrink-0"
            />
            <label htmlFor="shareAnonymously" className="text-sm text-secondary cursor-pointer select-none leading-tight">
              Share this reflection anonymously with a verified professional so they can offer guidance.
            </label>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's on your mind? Write anything..."
            className="w-full p-4 border border-muted bg-background rounded-lg text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            rows={4}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-foreground text-background font-semibold rounded-full hover:bg-foreground/90 transition-colors disabled:opacity-50"
            disabled={!selectedMood || (mounted && submitting)}
          >
            {submitting ? "Saving..." : "Log Reflection"}
          </button>
        </div>
      </form>

      {selectedMood && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted text-left">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Emotion:</span> <span className="capitalize">{selectedMood}</span>
          </p>
          {selectedTags.length > 0 && (
            <p className="text-sm text-foreground mt-2">
              <span className="font-semibold">Factors:</span> {selectedTags.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
