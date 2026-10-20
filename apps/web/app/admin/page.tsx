import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin/admin-console";

export const metadata: Metadata = {
  title: "Content Administration",
  robots: { index: false, follow: false }
};
export default function AdminPage() { return <main><AdminConsole /></main>; }
