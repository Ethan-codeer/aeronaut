"use client";

import { useSearchParams } from "next/navigation";
import { Comparison } from "./comparison";

// Query parameters are read in the browser so the existing routes can be
// exported for Sites static hosting without losing their query behavior.
export function ComparisonFromQuery() {
  const params = useSearchParams();
  const initial = params.get("a") ?? undefined;
  return <Comparison key={initial ?? "default"} initial={initial} />;
}
