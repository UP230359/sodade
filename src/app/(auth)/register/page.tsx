"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "@/store";
import { setUser, User } from "@/store/userSlice";
import { registerUserInDB, updateOnboardingInDB, validateCedula } from "@/lib/auth";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Form State
  const [accountType, setAccountType] = useState<"personal" | "professional">("personal");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cedula, setCedula] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI / Logic States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);

  // Form Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (accountType === "professional") {
      if (!cedula.trim()) {
        newErrors.cedula = "Cédula profesional is required for professional accounts";
      } else if (!/^\d{7,8}$/.test(cedula.trim())) {
        newErrors.cedula = "Please enter a valid 7 or 8 digit professional credential";
      }
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and privacy policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Validate Cédula Profesional with API if account type is professional
      if (accountType === "professional") {
        const validation = await validateCedula(cedula);
        if (!validation.valid) {
          setErrors({
            cedula: validation.message || "Cédula profesional no encontrada o no válida.",
            form: "No se pudo realizar el registro: la cédula profesional no es válida o no existe.",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Simulates database communication (e.g. prepared SQL INSERT query execution)
      const registeredUser = await registerUserInDB({
        firstName,
        lastName,
        email,
        password,
        accountType,
        cedula: accountType === "professional" ? cedula : undefined,
      });

      // Keep user in local state before onboarding consent
      setTempUser(registeredUser);
      setShowOnboardingModal(true);
    } catch (err) {
      console.error("Error registering user:", err);
      setErrors({ form: "Registration failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOnboarding = async () => {
    if (!tempUser) return;

    setIsSubmitting(true);
    try {
      // Simulates database update (e.g. prepared SQL UPDATE users SET is_onboarded = TRUE)
      await updateOnboardingInDB(tempUser.id);

      const onboardedUser = {
        ...tempUser,
        isOnboarded: true,
      };

      // Set user status in Redux
      dispatch(setUser(onboardedUser));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error updating onboarding status:", err);
    } finally {
      setIsSubmitting(false);
      setShowOnboardingModal(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-stone-50">
      {/* LEFT PANEL - Branding & Aesthetic Statement */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-between p-16 text-stone-200 relative overflow-hidden bg-radial from-[#221c18] via-[#14100e] to-[#0c0908]">
        {/* Subtle decorative glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,120,60,0.12),transparent_60%)] pointer-events-none" />

        {/* Logo */}
        <div className="z-10">
          <span className="text-2xl font-semibold tracking-wider text-amber-50/90 font-serif">
            sodade
          </span>
        </div>

        {/* Statement */}
        <div className="z-10 space-y-6 max-w-sm">
          <h1 className="text-4xl font-serif font-light leading-snug tracking-wide text-white">
            Observe your inner landscape.
          </h1>
          <div className="space-y-4 text-sm text-stone-400 font-light leading-relaxed">
            <p>
              Join a secure space dedicated to emotional awareness and community support.
            </p>
            <p>
              Whether you are tracking your own journey or guiding others, your presence matters.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 text-xs text-stone-500 font-light">
          © 2026 Sodade. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL - Forms */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16 lg:p-24 bg-white">
        <div className="w-full max-w-xl space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-amber-600 block uppercase">
              Begin your journey
            </span>
            <h2 className="text-3xl font-serif font-medium text-stone-950">
              Create an Account
            </h2>
            <p className="text-sm text-stone-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-stone-900 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            
            {/* Account Type Selector (Toggles) */}
            <div className="flex p-1 bg-stone-100 rounded-xl border border-stone-200/60">
              <button
                type="button"
                onClick={() => setAccountType("personal")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  accountType === "personal"
                    ? "bg-stone-950 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Personal Account
              </button>
              <button
                type="button"
                onClick={() => setAccountType("professional")}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  accountType === "professional"
                    ? "bg-stone-950 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Professional Account
              </button>
            </div>

            {/* General Form Error */}
            {errors.form && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">
                {errors.form}
              </p>
            )}

            {/* Names Input Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="First Name"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={errors.firstName ? "border-red-400" : "border-stone-200"}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={errors.lastName ? "border-red-400" : "border-stone-200"}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <Input
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-red-400" : "border-stone-200"}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Cédula Profesional Input (Only for Professional Account) */}
            {accountType === "professional" && (
              <div>
                <Input
                  label="Cédula Profesional"
                  placeholder="1234567"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className={errors.cedula ? "border-red-400" : "border-stone-200"}
                />
                {errors.cedula && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.cedula}</p>
                )}
              </div>
            )}

            {/* Passwords Input Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-red-400" : "border-stone-200"}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.password}</p>
                )}
              </div>
              <div>
                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-red-400" : "border-stone-200"}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms and Privacy Checkbox */}
            <div className="flex items-start gap-3">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded-sm border-stone-300 text-stone-900 focus:ring-stone-500 cursor-pointer"
              />
              <div className="text-xs text-stone-500 leading-relaxed">
                <label htmlFor="agreeTerms" className="cursor-pointer select-none">
                  By creating an account, I agree to the{" "}
                  <span className="font-semibold text-stone-800 underline hover:text-stone-950 cursor-pointer">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-stone-800 underline hover:text-stone-950 cursor-pointer">
                    Privacy Policy
                  </span>
                  . I also understand my reflections may be shared completely anonymously with verified professionals.
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{errors.agreeTerms}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#1c1816] text-stone-100 rounded-full font-medium tracking-wide shadow-md transition-all duration-200 hover:bg-[#2b2522] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* SACRED SPACE AGREEMENT MODAL */}
      <Modal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
      >
        <div className="flex flex-col items-center justify-center p-2 text-center space-y-6">
          <h3 className="text-2xl font-serif text-stone-900 mt-2 font-medium">
            Sacred Space Agreement
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed font-light max-w-sm">
            Your reflections are your own. By continuing, you agree that your emotional data may be shared completely anonymously with verified professionals to receive insights. Your identity is stripped and never revealed.
          </p>
          <div className="w-full pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleAcceptOnboarding}
              className="w-full py-3.5 bg-[#1c1816] text-stone-100 rounded-full font-medium tracking-wide shadow-md transition-all duration-200 hover:bg-[#2b2522] disabled:opacity-50 text-sm cursor-pointer"
            >
              {isSubmitting ? "Processing..." : "I Agree"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
