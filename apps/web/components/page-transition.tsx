"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Small composited entrance, never delays route navigation. Reduced-motion users see a still. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-transition" id="main-content" tabIndex={-1}>
      {children}
    </div>
  );
}
