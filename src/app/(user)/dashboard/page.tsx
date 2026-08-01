"use client";

import { useAppSelector } from "@/store";

export default function DashboardPage() {
  // Verifying the Redux connection is active
  const moodState = useAppSelector((state) => state.mood);
  const userState = useAppSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-[#FCFBF9] p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-serif text-gray-900">Dashboard</h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
            Redux State Connection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xs font-bold text-gray-500 mb-2">Mood State</h3>
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(moodState, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xs font-bold text-gray-500 mb-2">User State</h3>
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(userState, null, 2)}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
