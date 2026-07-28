"use client";

import MoodChart from "@/components/mood/MoodChart";

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <MoodChart />
      </div>
    </div>
  );
}
