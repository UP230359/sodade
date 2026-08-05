"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getFeed, submitInsight, getProfessionalProfile, FeedCheckin, InsightTag } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";

const CORE_EMOTIONS = [
  "Joy",
  "Calm",
  "Sadness",
  "Anger",
  "Fear",
  "Disgust",
  "Surprise",
  "Trust"
];

export default function PortalPage() {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAuth();

  const [checkins, setCheckins] = useState<FeedCheckin[]>([]);
  const [tags, setTags] = useState<InsightTag[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, { content: string; tagId: string }>>({});
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>("all");

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
        return getFeed();
      })
      .then((feed) => {
        if (feed) {
          setCheckins(feed.checkins);
          const meaningfulTags: InsightTag[] = feed.tags?.length > 0 ? feed.tags : [
            { tag_id: 1, name: "Grounding Exercise" },
            { tag_id: 2, name: "Cognitive Reframing" },
            { tag_id: 3, name: "Boundary Setting" },
            { tag_id: 4, name: "Somatic Awareness" },
            { tag_id: 5, name: "Self-Compassion Practice" }
          ];
          setTags(meaningfulTags);
        }
      })
      .catch(() => setError("Could not load the feed. Try again."));
  }, [hydrated, isAuthenticated, user, router]);

  const filteredCheckins = useMemo(() => {
    if (selectedEmotionFilter === "all") return checkins;
    return checkins.filter((c) => c.emotion.toLowerCase() === selectedEmotionFilter.toLowerCase());
  }, [checkins, selectedEmotionFilter]);

  if (!hydrated || !ready) return null;

  const updateDraft = (id: number, field: "content" | "tagId", value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { content: prev[id]?.content ?? "", tagId: prev[id]?.tagId ?? "", [field]: value },
    }));
  };

  const handleSend = async (checkinId: number) => {
    const draft = drafts[checkinId];
    if (!draft?.content?.trim() || !user) return;
    setSubmittingId(checkinId);
    try {
      await submitInsight({
        checkinId,
        professionalId: user.id,
        tagId: draft.tagId ? Number(draft.tagId) : null,
        content: draft.content.trim(),
      });
      setCheckins((prev) => prev.filter((c) => c.checkin_id !== checkinId));
    } catch {
      setError("Could not send the insight. Try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-primary uppercase mb-1 block">
            Professional Portal
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold tracking-tight">
            Community Needs
          </h1>
          <p className="text-sm text-secondary mt-1">
            Review anonymous reflections and offer guidance.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedEmotionFilter}
            onChange={(e) => setSelectedEmotionFilter(e.target.value)}
            className="text-xs border border-muted bg-background text-foreground rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto cursor-pointer"
          >
            <option value="all">Filter by Emotion: All</option>
            {CORE_EMOTIONS.map((emotion) => (
              <option key={emotion} value={emotion}>
                {emotion}
              </option>
            ))}
          </select>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-3 bg-anger/10 border border-anger/20 rounded-xl text-anger text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {filteredCheckins.length === 0 ? (
          <div className="text-center py-12 bg-background rounded-2xl border border-dashed border-muted">
            <p className="text-sm text-secondary">
              {checkins.length === 0 ? "No pending reflections right now." : "No reflections match this emotion filter."}
            </p>
          </div>
        ) : (
          filteredCheckins.map((c) => (
            <div
              key={c.checkin_id}
              className="bg-background p-6 rounded-2xl shadow-sm border border-muted transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2 items-center">
                  <Badge>{c.emotion}</Badge>
                  <span className="text-xs text-secondary">Check-in #{c.checkin_id}</span>
                </div>
                <span className="text-xs text-secondary">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-foreground text-sm leading-relaxed mb-6">
                &quot;{c.note || "No additional notes provided."}&quot;
              </p>

              <div className="bg-muted/50 p-4 rounded-xl border border-muted">
                <Textarea
                  label="Draft Recommendation"
                  placeholder="Offer a coping strategy or reflection prompt here..."
                  value={drafts[c.checkin_id]?.content ?? ""}
                  onChange={(e) => updateDraft(c.checkin_id, "content", e.target.value)}
                  rows={3}
                />
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4">
                  <Select
                    options={[
                      { value: "", label: "Select Therapeutic Focus" },
                      ...tags.map((t) => ({ value: String(t.tag_id), label: t.name })),
                    ]}
                    value={drafts[c.checkin_id]?.tagId ?? ""}
                    onChange={(e) => updateDraft(c.checkin_id, "tagId", e.target.value)}
                  />
                  <Button
                    onClick={() => handleSend(c.checkin_id)}
                    disabled={submittingId === c.checkin_id || !drafts[c.checkin_id]?.content?.trim()}
                  >
                    {submittingId === c.checkin_id ? "Sending..." : "Send Insight"}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
