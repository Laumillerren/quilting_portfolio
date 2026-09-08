import { notFound } from "next/navigation";
import QuiltProjectDetail from "@/components/QuiltProjectDetail";
import { getAllProjects } from "@/lib/sheets";

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/quilts/[slug]">) {
  const { slug } = await params;
  const projects = await getAllProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found — Lorena's Quilt Archive" };
  return {
    title: `${project.projectName} — Lorena's Quilt Archive`,
    description: project.projectStory?.slice(0, 160),
  };
}

export default async function QuiltProjectPage({ params }: PageProps<"/quilts/[slug]">) {
  const { slug } = await params;
  const projects = await getAllProjects();
  const index = projects.findIndex((p) => p.slug === slug);

  if (index === -1) notFound();

  const project = projects[index];
  const prevProject = index > 0 ? projects[index - 1] : undefined;
  const nextProject = index < projects.length - 1 ? projects[index + 1] : undefined;

  return <QuiltProjectDetail project={project} prevProject={prevProject} nextProject={nextProject} />;
}
