"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/userSlice";
import { loginUser } from "@/lib/api";
import { AxiosError } from "axios";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { user } = await loginUser({ email, password });
      dispatch(setUser(user));
      localStorage.setItem("sodade_user", JSON.stringify(user));
      router.push(user.accountType === "professional" ? "/portal" : "/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans">
      <div className="w-full max-w-md bg-background rounded-2xl border border-muted shadow-md p-8 sm:p-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-primary block uppercase">
            Welcome Back
          </span>
          <h1 className="font-serif text-3xl font-medium text-foreground">
            Sign In
          </h1>
          <p className="text-secondary text-sm">Sign in to continue your journey.</p>
        </div>

        {error && (
          <p className="text-sm text-anger bg-anger/10 p-3 rounded-lg border border-anger/20 font-medium text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-muted placeholder:text-secondary"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-muted placeholder:text-secondary"
            />
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-foreground text-background rounded-full font-medium tracking-wide shadow-md transition-all duration-200 hover:bg-foreground/90 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-secondary pt-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
