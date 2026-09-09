import Link from "next/link";
import PhotoGalleryLightbox from "@/components/PhotoGalleryLightbox";
import SmartImage from "@/components/SmartImage";
import { resolveImageUrl } from "@/lib/imageUrl";
import type { QuiltProject } from "@/lib/types";

type AdjacentProject = Pick<QuiltProject, "slug" | "projectName">;

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6 border-b border-[var(--border)] py-2.5 text-[13px] md:text-sm">
      <dt className="text-[var(--charcoal)]/55">{label}</dt>
      <dd className="text-right text-[var(--charcoal)]">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--border)] py-10 md:py-14">
      <h2 className="mb-5 font-serif text-lg italic text-[var(--charcoal)] md:mb-7 md:text-xl">{title}</h2>
      {children}
    </section>
  );
}

export default function QuiltProjectDetail({
  project,
  prevProject,
  nextProject,
}: {
  project: QuiltProject;
  prevProject?: AdjacentProject;
  nextProject?: AdjacentProject;
}) {
  const hero = resolveImageUrl(project.coverImage);
  const gallery = project.photoGallery.map(resolveImageUrl).filter(Boolean);

  return (
    <article className="mx-auto max-w-4xl px-5 pb-32 pt-28 md:px-10 md:pt-36">
      <Link
        href="/"
        className="mb-10 inline-block text-[11px] uppercase tracking-[0.14em] text-[var(--charcoal)]/55 transition-colors hover:text-[var(--charcoal)] md:mb-14"
      >
        &larr; Back to the archive
      </Link>

      <header className="mb-10 md:mb-16">
        <h1 className="font-serif text-4xl italic leading-[1.05] text-[var(--charcoal)] md:text-6xl">
          {project.projectName}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-[var(--charcoal)]/60 md:text-xs">
          <span>{project.year}</span>
          <span>{project.status}</span>
        </div>
      </header>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--cream)] md:aspect-[16/10]">
        <SmartImage src={hero} alt={project.projectName} fill priority sizes="(max-width: 768px) 100vw, 900px" className="object-cover" />
      </div>

      <Section title="Project Information">
        <dl>
          <InfoRow label="Status" value={project.status} />
          <InfoRow label="Year" value={project.year} />
          <InfoRow label="Date Started" value={project.dateStarted} />
          <InfoRow label="Date Cut" value={project.dateCut} />
          <InfoRow label="Top Finished" value={project.dateTopFinished} />
          <InfoRow label="Date Finished" value={project.dateFinished} />
          <InfoRow label="Quilt Type" value={project.quiltType} />
          <InfoRow label="Quilt Size" value={project.dimensions} />
        </dl>
      </Section>

      {(project.patternName || project.patternDesigner || project.patternSource || project.patternLink) && (
        <Section title="Pattern">
          <dl>
            <InfoRow label="Pattern Name" value={project.patternName} />
            <InfoRow label="Pattern Designer" value={project.patternDesigner} />
            <InfoRow label="Pattern Source" value={project.patternSource} />
            {project.patternLink && (
              <div className="flex justify-between gap-6 border-b border-[var(--border)] py-2.5 text-[13px] md:text-sm">
                <dt className="text-[var(--charcoal)]/55">Pattern Link</dt>
                <dd>
                  <a
                    href={project.patternLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-right text-[var(--charcoal)] underline underline-offset-2"
                  >
                    View source
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Section>
      )}

      {(project.quilterName || project.quiltingDesign) && (
        <Section title="Quilting">
          <dl>
            <InfoRow label="Quilter" value={project.quilterName} />
            <InfoRow label="Quilting Design" value={project.quiltingDesign} />
          </dl>
        </Section>
      )}

      <Section title="Fabrics &amp; Materials">
        <dl>
          <InfoRow label="Main Fabric" value={project.mainFabric} />
          <InfoRow label="Fabric Brand" value={project.fabricBrand} />
          <InfoRow label="Fabric Designer" value={project.fabricDesigner} />
          <InfoRow label="Fabric Collection" value={project.fabricCollection} />
          <InfoRow label="Batting" value={project.batting} />
          <InfoRow label="Backing" value={project.backing} />
          <InfoRow label="Binding" value={project.binding} />
        </dl>
      </Section>

      {project.fabrics.length > 0 && (
        <Section title="Fabric Swatches">
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-5">
            {project.fabrics.map((f, i) => {
              const src = f.image ? resolveImageUrl(f.image) : null;
              return (
                <div key={i}>
                  <div className="relative aspect-square overflow-hidden bg-[var(--cream)]">
                    {src && <SmartImage src={src} alt={f.fabricName} fill sizes="140px" className="object-cover" />}
                  </div>
                  <p className="mt-2 font-serif text-[13px] italic leading-snug text-[var(--charcoal)]">
                    {f.fabricName}
                  </p>
                  {(f.designer || f.colorway) && (
                    <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--charcoal)]/50">
                      {[f.designer, f.colorway].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {project.techniques.length > 0 && (
        <Section title="Techniques">
          <div className="flex flex-wrap gap-2.5">
            {project.techniques.map((t) => (
              <span
                key={t}
                className="border border-[var(--border)] px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-[var(--charcoal)]/75"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>
      )}

      {(project.projectStory || project.notes || project.lessonsLearned) && (
        <Section title="Project Story">
          <div className="max-w-[62ch] space-y-5 font-serif text-[19px] italic leading-relaxed text-[var(--charcoal)]/90 md:text-[21px]">
            {project.projectStory && <p>{project.projectStory}</p>}
          </div>
          {(project.notes || project.lessonsLearned) && (
            <div className="mt-8 space-y-3 text-[13px] leading-relaxed text-[var(--charcoal)]/70 md:text-sm">
              {project.notes && (
                <p>
                  <span className="text-[var(--charcoal)]/50">Notes &mdash; </span>
                  {project.notes}
                </p>
              )}
              {project.lessonsLearned && (
                <p>
                  <span className="text-[var(--charcoal)]/50">Lessons learned &mdash; </span>
                  {project.lessonsLearned}
                </p>
              )}
            </div>
          )}
        </Section>
      )}

      {gallery.length > 0 && (
        <Section title="Photo Archive">
          <PhotoGalleryLightbox images={gallery} altPrefix={project.projectName} />
        </Section>
      )}

      {(prevProject || nextProject) && (
        <nav className="mt-14 flex items-center justify-between border-t border-[var(--border)] pt-8 text-[11px] uppercase tracking-[0.14em] text-[var(--charcoal)]/55 md:mt-16">
          {prevProject ? (
            <Link href={`/quilts/${prevProject.slug}`} className="max-w-[45%] truncate transition-colors hover:text-[var(--charcoal)]">
              &larr; {prevProject.projectName}
            </Link>
          ) : (
            <span />
          )}
          {nextProject ? (
            <Link
              href={`/quilts/${nextProject.slug}`}
              className="max-w-[45%] truncate text-right transition-colors hover:text-[var(--charcoal)]"
            >
              {nextProject.projectName} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </article>
  );
}
