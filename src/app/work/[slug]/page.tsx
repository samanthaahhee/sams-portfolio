import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPortfolioProjects,
  getPortfolioProjectBySlug,
  getProjectBlocks,
} from "@/lib/db-portfolio";
import { PLACEHOLDER_PROJECTS } from "@/lib/portfolio-placeholders";
import { ProjectPage, type ProjectNeighbour } from "@/components/portfolio/project-page";

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

  const blocks = isPlaceholder ? [] : await getProjectBlocks(project.id);

  /* prev/next follow the same order the work index uses, so the arrows
     walk the list in the order Sam arranged it. */
  const ordered = await getPortfolioProjects();
  const list = [...ordered];
  for (const p of PLACEHOLDER_PROJECTS) {
    if (!list.some((q) => q.slug === p.slug)) list.push(p);
  }
  const i = list.findIndex((p) => p.slug === slug);
  const at = (n: number): ProjectNeighbour => {
    const p = list[(n + list.length) % list.length];
    return p && p.slug !== slug ? { slug: p.slug, title: p.title } : null;
  };

  return (
    <ProjectPage project={project} blocks={blocks} next={i > -1 ? at(i + 1) : null} />
  );
}
