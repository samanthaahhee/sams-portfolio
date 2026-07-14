import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPortfolioProjects,
  getPortfolioProjectBySlug,
  getProjectMedia,
} from "@/lib/db-portfolio";
import { PLACEHOLDER_PROJECTS, PLACEHOLDER_WORK_MEDIA, PLACEHOLDER_THINKING } from "@/lib/portfolio-placeholders";
import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { WorkDeepDive } from "@/components/portfolio/work-deep-dive";

export async function generateStaticParams() {
  const projects = await getPortfolioProjects();
  const slugs = new Set(projects.map((p) => p.slug));
  for (const p of PLACEHOLDER_PROJECTS) slugs.add(p.slug);
  return Array.from(slugs).map((slug) => ({ slug }));
}

async function loadProject(slug: string) {
  const dbProject = await getPortfolioProjectBySlug(slug);
  if (dbProject) return { project: dbProject, isPlaceholder: false as const };
  const placeholder = PLACEHOLDER_PROJECTS.find((p) => p.slug === slug);
  return placeholder ? { project: placeholder, isPlaceholder: true as const } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await loadProject(slug);
  if (!found) return {};
  const { project } = found;
  return {
    title: `${project.title} — Sam Ahhee`,
    description: `${project.discipline} · ${project.client} · ${project.year}`,
  };
}

export default async function WorkDeepDivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await loadProject(slug);
  if (!found) notFound();
  const { project, isPlaceholder } = found;

  const [workMedia, thinkingMedia] = isPlaceholder
    ? [PLACEHOLDER_WORK_MEDIA[slug] ?? [], []]
    : await Promise.all([
        getProjectMedia(project.id, "work_grid"),
        getProjectMedia(project.id, "thinking"),
      ]);

  return (
    <div className="min-h-screen bg-white font-portfolio-sans">
      <PortfolioNav active="work" />
      <WorkDeepDive
        project={project}
        workMedia={workMedia}
        thinkingMedia={thinkingMedia}
        thinkingSections={isPlaceholder ? PLACEHOLDER_THINKING[slug] : undefined}
      />
    </div>
  );
}
