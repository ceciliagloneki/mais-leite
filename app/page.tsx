"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasValidAuthentication } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasValidAuthentication() ? "/dashboard" : "/login");
  }, [router]);

  return null;
}
