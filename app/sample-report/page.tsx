"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const SampleReportContent = dynamic(
  () => import("@/app/components/SampleReportContent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading report...
        </div>
      </div>
    )
  }
);

export default function SampleReportPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Loading report...
          </div>
        </div>
      }
    >
      <SampleReportContent />
    </Suspense>
  );
}
