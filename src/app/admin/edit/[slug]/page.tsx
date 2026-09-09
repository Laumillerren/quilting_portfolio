import { notFound } from "next/navigation";
import ProjectForm, { type ProjectFormValues } from "@/components/admin/ProjectForm";
import { getAllProjects } from "@/lib/sheets";
import type { QuiltProject } from "@/lib/types";

function projectToFormValues(p: QuiltProject): ProjectFormValues {
  // Placeholder cover/gallery images are generated data: URIs — don't ever
  // feed those back into the form, or an unrelated edit would save a giant
  // inline SVG string into the sheet's image columns.
  const realCover = p.coverImage.startsWith("data:") ? "" : p.coverImage;
  const realGallery = p.photoGallery.filter((u) => !u.startsWith("data:"));

  return {
    id: p.id,
    slug: p.slug,
    project_name: p.projectName,
    status: p.status,
    year: p.year,
    date_started: p.dateStarted ?? "",
    date_cut: p.dateCut ?? "",
    date_top_finished: p.dateTopFinished ?? "",
    date_finished: p.dateFinished ?? "",
    quilt_type: p.quiltType ?? "",
    dimensions: p.dimensions ?? "",
    pattern_name: p.patternName ?? "",
    pattern_designer: p.patternDesigner ?? "",
    pattern_source: p.patternSource ?? "",
    pattern_link: p.patternLink ?? "",
    quilter_name: p.quilterName ?? "",
    quilting_design: p.quiltingDesign ?? "",
    main_fabric: p.mainFabric ?? "",
    fabric_brand: p.fabricBrand ?? "",
    fabric_designer: p.fabricDesigner ?? "",
    fabric_collection: p.fabricCollection ?? "",
    batting: p.batting ?? "",
    backing: p.backing ?? "",
    binding: p.binding ?? "",
    techniques: p.techniques.join(", "),
    project_story: p.projectStory ?? "",
    notes: p.notes ?? "",
    lessons_learned: p.lessonsLearned ?? "",
    cover_image: realCover,
    photo_gallery: realGallery.join(", "),
    featured: p.featured ? "true" : "",
  };
}

export async function generateMetadata({ params }: PageProps<"/admin/edit/[slug]">) {
  const { slug } = await params;
  return { title: `Edit ${slug} — Lorena's Quilt Archive` };
}

export default async function AdminEditProjectPage({ params }: PageProps<"/admin/edit/[slug]">) {
  const { slug } = await params;
  const projects = await getAllProjects();
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 pb-32 pt-28 md:px-10 md:pt-36">
      <h1 className="font-serif text-4xl italic leading-tight text-[var(--charcoal)] md:text-5xl">
        Edit &ldquo;{project.projectName}&rdquo;
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--charcoal)]/60">
        Updates this row in the Google Sheet directly. Fields left blank here will be saved as blank.
      </p>

      <ProjectForm mode="update" originalSlug={project.slug} initialValues={projectToFormValues(project)} />
    </main>
  );
}
