import { notFound } from "next/navigation";
import { getPortfolioProjectById, getProjectBlocks, getMediaLibrary } from "@/lib/db-portfolio";
import { WorkProjectForm } from "../_form";

/* The admin must never serve a cached render: it is the surface you use
   to change the data it displays, so a stale list reads as the backend
   disagreeing with the live site. */
export const dynamic = "force-dynamic";
export const revalidate = 0;


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

  const [blocks, library] = await Promise.all([
    getProjectBlocks(project.id),
    getMediaLibrary(),
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
      <WorkProjectForm project={project} blocks={blocks} library={library} mode="edit" />
    </div>
  );
}
