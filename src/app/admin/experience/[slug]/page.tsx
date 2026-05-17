import { notFound } from "next/navigation";
import { getExperienceBySlug } from "@/lib/db";
import { ExperienceForm } from "../_form";

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getExperienceBySlug(slug);
  if (!entry) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <p className="font-mono text-[color:var(--meta)] mb-2">Edit role</p>
      <h1
        className="font-display text-3xl md:text-4xl mb-8"
        style={{ lineHeight: 0.95 }}
      >
        {entry.title} · {entry.company}
      </h1>
      <ExperienceForm entry={entry} mode="edit" />
    </div>
  );
}
