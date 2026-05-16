import { notFound } from "next/navigation";
import { getProjectAdmin } from "@/lib/db";
import { ProjectForm } from "../_form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectAdmin(slug);
  if (!project) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <p className="font-mono text-[color:var(--meta)] mb-2">Edit project</p>
      <h1
        className="font-display text-3xl md:text-4xl mb-8"
        style={{ lineHeight: 0.95 }}
      >
        {project.brand} · {project.title}
      </h1>
      <ProjectForm project={project} mode="edit" />
    </div>
  );
}
