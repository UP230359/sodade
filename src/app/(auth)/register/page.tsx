"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import OnboardingModal from "@/components/auth/OnboardingModal";
import { useAppDispatch } from "@/store";
import { completeOnboarding } from "@/store/userSlice";
import { registerUser, User } from "@/lib/api";

type AccountType = "personal" | "professional";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usuario recién creado en el backend, pendiente de aceptar el acuerdo de
  // onboarding. Se guarda localmente y solo se manda a Redux cuando el
  // usuario le da "I Agree" en el modal.
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the terms to continue");
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await registerUser({
        firstName,
        lastName,
        email,
        password,
        accountType,
      });

      // Registro exitoso: en vez de redirigir de una vez, abrimos el modal
      // de onboarding (Sacred Space Agreement) sobre esta misma página.
      setPendingUser(user);
      setShowOnboarding(true);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgree = () => {
    if (!pendingUser) return;

    // Recién ahora, al aceptar el acuerdo, se marca al usuario como
    // authenticated + onboarded en el estado global.
    dispatch(completeOnboarding(pendingUser));
    router.push(pendingUser.accountType === "professional" ? "/portal" : "/dashboard");
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col lg:flex-row bg-background">
      {/* Panel izquierdo: branding, solo visible en desktop */}
      <div className="hidden lg:flex lg:w-[42%] h-full relative flex-col justify-between p-12 bg-[#171310] overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-orange-500/25 blur-3xl" />
        <span className="relative font-serif text-2xl text-white">sodade</span>

        <div className="relative">
          <h1 className="font-serif text-4xl text-white leading-tight mb-4">
            Observe your inner landscape.
          </h1>
          <p className="text-white/60 max-w-sm leading-relaxed">
            Join a secure space dedicated to emotional awareness and community
            support. Whether you are tracking your own journey or guiding
            others, your presence matters.
          </p>
        </div>

        <p className="relative text-white/30 text-sm">
          © {new Date().getFullYear()} Sodade. All rights reserved.
        </p>
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex-1 h-full overflow-y-auto flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <span className="lg:hidden font-serif text-xl text-foreground mb-8 block">
            sodade
          </span>

          <p className="text-orange-600 text-xs font-semibold tracking-widest uppercase mb-3">
            Begin your journey
          </p>
          <h2 className="font-serif text-3xl font-normal text-foreground mb-2">
            Create an Account
          </h2>
          <p className="text-secondary mb-8">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-medium hover:underline">
              Sign in here
            </Link>
          </p>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium text-center mb-5">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setAccountType("personal")}
              className={`py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                accountType === "personal"
                  ? "bg-foreground text-background"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Personal Account
            </button>
            <button
              type="button"
              onClick={() => setAccountType("professional")}
              className={`py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                accountType === "professional"
                  ? "bg-foreground text-background"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Professional Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="!bg-muted !border-transparent !rounded-lg focus:!ring-primary/20"
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="!bg-muted !border-transparent !rounded-lg focus:!ring-primary/20"
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="!bg-muted !border-transparent !rounded-lg focus:!ring-primary/20"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="!bg-muted !border-transparent !rounded-lg focus:!ring-primary/20"
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="!bg-muted !border-transparent !rounded-lg focus:!ring-primary/20"
              />
            </div>

            <label className="flex items-start gap-2.5 text-sm text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral/30 accent-foreground cursor-pointer"
              />
              <span>
                By creating an account, I agree to the{" "}
                <span className="text-foreground font-medium underline">Terms of Service</span>{" "}
                and <span className="text-foreground font-medium underline">Privacy Policy</span>.
                I also understand my reflections may be shared completely
                anonymously with verified professionals.
              </span>
            </label>

            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
              className="!bg-foreground !text-background hover:!bg-foreground/90 !font-normal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>
      </div>

      <OnboardingModal isOpen={showOnboarding} onAgree={handleAgree} />
    </div>
  );
}
