"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getProfessionalProfile, submitProfessionalProfile, ProfessionalProfile } from "@/lib/api";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function PortalVerificationPage() {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAuth();

  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cedula, setCedula] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [primarySpecialty, setPrimarySpecialty] = useState("");

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
      .then(setProfile)
      .catch(() => setError("Could not load your verification status."))
      .finally(() => setLoading(false));
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !cedula.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const updated = await submitProfessionalProfile({
        userId: user.id,
        cedula: cedula.trim(),
        institutionName: institutionName.trim() || undefined,
        primarySpecialty: primarySpecialty.trim() || undefined,
      });
      setProfile(updated);
    } catch {
      setError("Could not submit your credentials. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 md:px-6 py-6 md:py-8">
        <Card>
          <h1 className="text-xl md:text-2xl font-serif text-foreground mb-2">Verify Your Credentials</h1>
          <p className="text-sm text-secondary mb-6">
            Submit your professional cédula to start reviewing reflections.
          </p>
          {error && (
            <p className="text-sm text-anger bg-anger/10 p-3 rounded-lg border border-anger/20 mb-4">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Professional Cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
            <Input label="Institution Name" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
            <Input label="Primary Specialty" value={primarySpecialty} onChange={(e) => setPrimarySpecialty(e.target.value)} />
            <Button type="submit" disabled={isSubmitting} className="w-full justify-center mt-2">
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const isActive = profile.verification_status === "active";

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <Card className="!p-0 overflow-hidden">
        <div className={`p-6 md:p-8 text-center ${isActive ? "bg-foreground" : "bg-muted"}`}>
          <h1 className={`text-2xl font-serif ${isActive ? "text-background" : "text-foreground"}`}>
            {isActive ? "Account Verified" : "Verification Pending"}
          </h1>
          <p className={`text-sm mt-2 ${isActive ? "text-background/70" : "text-secondary"}`}>
            {isActive
              ? "Your professional credentials have been successfully reviewed."
              : "We're reviewing your submitted credentials."}
          </p>
        </div>
        <div className="p-6 md:p-8 space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-muted">
            <span className="text-sm text-secondary mb-1 sm:mb-0">Status</span>
            <span className="text-sm font-medium text-foreground uppercase tracking-wider">{profile.verification_status}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-muted">
            <span className="text-sm text-secondary mb-1 sm:mb-0">Professional Cédula</span>
            <span className="text-sm font-medium text-foreground">{profile.professional_cedula}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-muted">
            <span className="text-sm text-secondary mb-1 sm:mb-0">Primary Specialty</span>
            <span className="text-sm font-medium text-foreground">{profile.primary_specialty ?? "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3">
            <span className="text-sm text-secondary mb-1 sm:mb-0">Verification Date</span>
            <span className="text-sm font-medium text-foreground">
              {profile.verification_date ? new Date(profile.verification_date).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
