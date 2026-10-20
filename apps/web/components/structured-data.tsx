import { structuredEntity } from "@/lib/site";

export function StructuredData({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredEntity(data) }} />;
}
