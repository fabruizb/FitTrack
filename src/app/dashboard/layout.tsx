"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { FlickeringGrid } from "@/components/ui/flickering-grid"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem-1px)] items-center justify-center ">
        <FlickeringGrid />
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return <>{children}</>;
}
