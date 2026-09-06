import { notFound } from "next/navigation";
import QuiltProjectDetail from "@/components/QuiltProjectDetail";
import { getAllProjects, getProjectBySlug } from "@/lib/sheets";

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/quilts/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found — Lorena's Quilt Archive" };
  return {
    title: `${project.projectName} — Lorena's Quilt Archive`,
    description: project.projectStory?.slice(0, 160),
  };
}

export default async function QuiltProjectPage({ params }: PageProps<"/quilts/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  return <QuiltProjectDetail project={project} />;
}
