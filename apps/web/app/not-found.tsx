import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Page not found", robots: { index: false, follow: false }
};
export default function NotFound() {
  return <main className="content-shell not-found-page">
    <p className="eyebrow">Page not found</p>
    <h1>This page is not available.</h1>
    <p>The address may have changed, or the content may not have been published.</p>
    <Link href="/">Return to AmplifyWorld home <span aria-hidden="true">↗</span></Link>
  </main>;
}
