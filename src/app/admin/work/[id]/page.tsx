import { notFound } from "next/navigation";
import { getPortfolioProjectById, getProjectMedia, getThinkingSections, getProjectBlocks } from "@/lib/db-portfolio";
import { WorkProjectForm } from "../_form";

export default async function EditWorkProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);
  if (!projectId) notFound();

  const project = await getPortfolioProjectById(projectId);
  if (!project) notFound();

  const [media, thinkingSections, blocks] = await Promise.all([
    getProjectMedia(project.id, "work_grid"),
    getThinkingSections(project.id),
    getProjectBlocks(project.id),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <p className="font-mono text-[color:var(--meta)] mb-2">Edit work project</p>
      <h1 className="font-display text-3xl md:text-4xl mb-8" style={{ lineHeight: 0.95 }}>
        {project.client || project.title} · {project.title}
      </h1>
      <WorkProjectForm project={project} media={media} thinkingSections={thinkingSections} blocks={blocks} mode="edit" />
    </div>
  );
}
