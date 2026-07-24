"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./index";
import { setMoodEntries } from "./moodSlice";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hydrate state from localStorage on client-side mount
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sodade_mood_entries");
        if (stored) {
          store.dispatch(setMoodEntries(JSON.parse(stored)));
        }
      } catch (e) {
        console.error("Failed to load mood entries from localStorage", e);
      }
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
