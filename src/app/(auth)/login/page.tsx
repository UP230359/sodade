"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
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
        id: "dummy-id",
        email,
        name: email.split("@")[0],
      })
    );
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-background rounded-2xl border border-neutral/20 shadow-sm p-10">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-normal text-foreground">
            Welcome Back
          </h1>
          <p className="text-secondary mt-2">Sign in to continue your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="!bg-muted !border-transparent !rounded-lg focus:!ring-primary/20"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-secondary">Password</label>
              <Link href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="!bg-muted !border-transparent !rounded-lg focus:!ring-primary/20"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            className="!bg-foreground !text-background hover:!bg-foreground/90 !rounded-lg !font-normal"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-secondary mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}