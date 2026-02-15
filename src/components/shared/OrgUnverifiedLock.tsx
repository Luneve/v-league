"use client";

import Link from "next/link";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

function OrgUnverifiedLock() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <SurfaceCard spotlight padding="lg" className="max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-light">
            <svg
              className="h-8 w-8 text-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Verification Pending
        </h2>
        <p className="text-sm text-muted mb-4">
          Your organization is awaiting admin verification. You&apos;ll be able
          to create opportunities and manage candidates once verified.
        </p>
        <p className="text-xs text-muted">
          <Link href="/org/profile" className="text-accent hover:underline">
            Complete your organization profile
          </Link>{" "}
          to speed up verification.
        </p>
      </SurfaceCard>
    </div>
  );
}

export { OrgUnverifiedLock };
