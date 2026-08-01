"use client";

import CheckInForm from "@/components/mood/CheckInForm";

export default function JournalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <CheckInForm />
      </div>
    </div>
  );
}
