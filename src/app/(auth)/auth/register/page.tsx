"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { Role } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    orgName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!role) {
      toast("warning", "Please select your role first.");
      return;
    }

    if (role === "volunteer") {
      if (!formData.firstName) newErrors.firstName = "First name is required.";
      if (!formData.lastName) newErrors.lastName = "Last name is required.";
    } else {
      if (!formData.orgName) newErrors.orgName = "Organization name is required.";
    }
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast("success", "Account created successfully!");
      router.push(role === "volunteer" ? "/feed" : "/org/dashboard");
    }, 1000);
  };

  return (
    <SurfaceCard spotlight padding="lg" className="w-full max-w-md">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white font-bold text-xl mb-3">
          V
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Create account</h1>
        <p className="text-sm text-muted mt-1">
          Join the Volunteer League
        </p>
      </div>

      {/* Role Picker */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRole("volunteer")}
          className={`
            flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all
            focus-ring
            ${
              role === "volunteer"
                ? "border-accent bg-accent/5"
                : "border-border hover:border-muted"
            }
          `}
        >
          <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="text-sm font-medium text-text-primary">
            I&apos;m a Volunteer
          </span>
        </button>
        <button
          type="button"
          onClick={() => setRole("organization")}
          className={`
            flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all
            focus-ring
            ${
              role === "organization"
                ? "border-accent bg-accent/5"
                : "border-border hover:border-muted"
            }
          `}
        >
          <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          <span className="text-sm font-medium text-text-primary">
            We&apos;re an Organization
          </span>
        </button>
      </div>

      {role && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {role === "volunteer" ? (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                error={errors.firstName}
              />
              <Input
                label="Last name"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                error={errors.lastName}
              />
            </div>
          ) : (
            <Input
              label="Organization name"
              value={formData.orgName}
              onChange={(e) => updateField("orgName", e.target.value)}
              error={errors.orgName}
            />
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            error={errors.password}
            hint="At least 6 characters"
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
          />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Create account
          </Button>

          <div className="relative flex items-center my-2">
            <div className="flex-1 border-t border-border" />
            <span className="px-3 text-xs text-muted">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            }
            onClick={() => {
              toast("info", "Google sign-in will be connected to Supabase Auth.");
            }}
          >
            Continue with Google
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-accent hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </SurfaceCard>
  );
}
