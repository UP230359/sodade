"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getResponses, getProfessionalProfile, ResponseInsight } from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function PortalResponsesPage() {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAuth();
  const [responses, setResponses] = useState<ResponseInsight[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.accountType !== "professional") {
      router.replace("/dashboard");
      return;
    }
    getProfessionalProfile(user.id)
      .then((profile) => {
        if (!profile || profile.verification_status !== "active") {
          router.replace("/portal/verification");
          return;
        }
        setReady(true);
        return getResponses(user.id);
      })
      .then((data) => data && setResponses(data))
      .catch(() => setError("Could not load your responses."));
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !ready) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 px-4 md:px-6 py-6 md:py-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-muted pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-foreground">My Responses</h1>
          <p className="text-sm text-secondary mt-1">A history of the guidance you have provided.</p>
        </div>
        <div className="text-sm font-medium text-secondary bg-background border border-muted px-4 py-1.5 rounded-full inline-block text-center">
          Total Contributions: {responses.length}
        </div>
      </header>

      {error && (
        <p className="text-sm text-anger bg-anger/10 p-3 rounded-lg border border-anger/20">
          {error}
        </p>
      )}

      <div className="space-y-6">
        {responses.length === 0 ? (
          <p className="text-sm text-secondary bg-muted/50 p-6 rounded-xl border border-muted text-center">
            You haven&apos;t sent any insights yet.
          </p>
        ) : (
          responses.map((r) => (
            <Card key={r.insight_id}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">
                  Original Reflection
                </span>
                <span className="text-xs text-secondary shrink-0 ml-4">
                  {new Date(r.checkin_created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="pl-4 border-l-2 border-muted mb-6">
                <p className="text-secondary text-sm italic">&quot;{r.checkin_note}&quot;</p>
              </div>

              <div className="bg-muted/30 border border-muted p-4 md:p-5 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Your Insight
                  </span>
                  {r.tag_name && <Badge variant="primary">{r.tag_name}</Badge>}
                </div>
                <p className="text-foreground text-sm leading-relaxed">{r.content}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
