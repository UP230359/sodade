"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!hydrated) return;

    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    const hasVisited = localStorage.getItem("sodade_has_visited");
    if (hasVisited) {
      router.replace("/login");
    } else {
      setIsChecking(false);
    }
  }, [hydrated, isAuthenticated, router]);

  const handleBeginJourney = () => {
    localStorage.setItem("sodade_has_visited", "true");
    router.push("/register");
  };

  if (!hydrated || isChecking) {
    return <div className="min-h-screen bg-[#FCFBF9]" />;
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-gray-900 flex flex-col items-center justify-center p-8 font-sans">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-serif font-medium tracking-tight">sodade</h1>
        <p className="text-xl text-gray-500 font-serif italic">Observe your inner landscape.</p>
        <div className="flex justify-center gap-4 pt-8">
          <button
            onClick={handleBeginJourney}
            className="bg-[#1C1A17] text-white px-8 py-3.5 rounded-full text-sm font-medium shadow-xl hover:bg-black transition-transform hover:scale-105 cursor-pointer"
          >
            Begin Journey
          </button>
        </div>
      </div>
    </div>
  );
}
