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
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-8">
        <h1 className="font-display text-3xl md:text-4xl" style={{ lineHeight: 0.95 }}>
          {project.client || project.title} · {project.title}
        </h1>
        {/* The page these edits land on — the one thing that was missing
            when it wasn't clear which generation you were editing. */}
        <a
          href={`/work/${project.slug}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] hover:opacity-70"
          style={{ color: "#FF2E31" }}
        >
          /work/{project.slug} ↗
        </a>
      </div>
      <WorkProjectForm project={project} media={media} thinkingSections={thinkingSections} blocks={blocks} mode="edit" />
    </div>
  );
}
