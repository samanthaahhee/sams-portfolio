import { notFound } from "next/navigation";
import { getCaseStudyBySlug } from "@/lib/db";
import { CaseStudyForm } from "../_form";

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <p className="font-mono text-[color:var(--meta)] mb-2">Edit case study</p>
      <h1
        className="font-display text-3xl md:text-4xl mb-8"
        style={{ lineHeight: 0.95 }}
      >
        No. {study.no} · {study.title}
      </h1>
      <CaseStudyForm study={study} mode="edit" />
    </div>
  );
}
