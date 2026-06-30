import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPortfolioProjects,
  getPortfolioProjectBySlug,
  getProjectMedia,
} from "@/lib/db-portfolio";
import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { WorkDeepDive } from "@/components/portfolio/work-deep-dive";

export async function generateStaticParams() {
  const projects = await getPortfolioProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPortfolioProjectBySlug(slug);
  if (!project) return {};
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
  const project = await getPortfolioProjectBySlug(slug);
  if (!project) notFound();

  const [workMedia, thinkingMedia] = await Promise.all([
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
      />
    </div>
  );
}
