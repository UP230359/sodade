"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import { useAppDispatch } from "@/store";
import { login } from "@/store/userSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      login({
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: email.split("@")[0],
        isOnboarded: true, // Mark onboarded so they see the dashboard directly
      })
    );
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/60 shadow-md p-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] tracking-[0.25em] font-semibold text-amber-600 block uppercase">
            Welcome Back
          </span>
          <h1 className="font-serif text-3xl font-medium text-stone-950">
            Sign In
          </h1>
          <p className="text-stone-500 text-sm">Sign in to continue your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-stone-200 placeholder:text-stone-400"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-stone-700">Password</label>
              <Link href="#" className="text-xs text-amber-600 font-medium hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-stone-200 placeholder:text-stone-400"
            />
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              className="w-full py-3 bg-[#1c1816] text-stone-100 rounded-full font-medium tracking-wide shadow-md transition-all duration-200 hover:bg-[#2b2522] text-sm cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-stone-500 pt-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-stone-900 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
