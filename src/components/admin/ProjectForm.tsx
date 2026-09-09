"use client";

import Link from "next/link";
import { useState } from "react";

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  defaultValue,
  readOnly,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-[var(--charcoal)]/55">
        {label}
        {required && " *"}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={`w-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--charcoal)] outline-none focus:border-[var(--charcoal)]/50 ${
          readOnly ? "bg-[var(--cream)] text-[var(--charcoal)]/60" : "bg-transparent"
        }`}
      />
    </label>
  );
}

function TextAreaField({
  name,
  label,
  placeholder,
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-[var(--charcoal)]/55">{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        rows={4}
        className="w-full resize-y border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--charcoal)] outline-none focus:border-[var(--charcoal)]/50"
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--border)] py-8">
      <h2 className="mb-5 font-serif text-lg italic text-[var(--charcoal)]">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export type ProjectFormValues = Partial<{
  id: string;
  slug: string;
  project_name: string;
  status: string;
  year: string;
  date_started: string;
  date_cut: string;
  date_top_finished: string;
  date_finished: string;
  quilt_type: string;
  dimensions: string;
  pattern_name: string;
  pattern_designer: string;
  pattern_source: string;
  pattern_link: string;
  quilter_name: string;
  quilting_design: string;
  main_fabric: string;
  fabric_brand: string;
  fabric_designer: string;
  fabric_collection: string;
  batting: string;
  backing: string;
  binding: string;
  techniques: string;
  project_story: string;
  notes: string;
  lessons_learned: string;
  cover_image: string;
  photo_gallery: string;
  featured: string;
}>;

interface ProjectFormProps {
  mode: "create" | "update";
  initialValues?: ProjectFormValues;
  /** The slug the project had when this form loaded — required for update, used to locate the row even if the slug itself changes. */
  originalSlug?: string;
}

export default function ProjectForm({ mode, initialValues = {}, originalSlug }: ProjectFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    form.forEach((value, key) => {
      payload[key] = String(value);
    });

    if (mode === "update") {
      payload.originalSlug = originalSlug ?? "";
    }

    try {
      const res = await fetch("/api/projects", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong");
        return;
      }

      setStatus("done");
      setSavedSlug(data.slug);
      if (mode === "create") e.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Could not reach the server");
    }
  }

  const v = initialValues;

  return (
    <>
      {status === "done" && (
        <div className="mt-8 border border-[var(--charcoal)]/20 bg-[var(--cream)] px-4 py-3 text-sm text-[var(--charcoal)]">
          Saved.{" "}
          {savedSlug && (
            <Link href={`/quilts/${savedSlug}`} className="underline underline-offset-2">
              View the project page
            </Link>
          )}
        </div>
      )}
      {status === "error" && (
        <div className="mt-8 border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-900">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-8">
        <Section title="Project Information">
          <Field name="project_name" label="Project Name" required defaultValue={v.project_name} />
          <Field name="slug" label="URL Slug" placeholder="auto-generated from name if left blank" defaultValue={v.slug} />
          <Field name="status" label="Status" placeholder="Finished, In Progress, UFO, Planned..." required defaultValue={v.status} />
          <Field name="year" label="Year" required defaultValue={v.year} />
          <Field name="date_started" label="Date Started" placeholder="March 2026" defaultValue={v.date_started} />
          <Field name="date_cut" label="Date Cut" placeholder="April 2026" defaultValue={v.date_cut} />
          <Field name="date_top_finished" label="Top Finished" placeholder="July 2026" defaultValue={v.date_top_finished} />
          <Field name="date_finished" label="Date Finished" placeholder="September 2026" defaultValue={v.date_finished} />
          <Field name="quilt_type" label="Quilt Type" placeholder="Bed quilt, queen" defaultValue={v.quilt_type} />
          <Field name="dimensions" label="Quilt Size" placeholder='92" x 96"' defaultValue={v.dimensions} />
        </Section>

        <Section title="Pattern">
          <Field name="pattern_name" label="Pattern Name" defaultValue={v.pattern_name} />
          <Field name="pattern_designer" label="Pattern Designer" defaultValue={v.pattern_designer} />
          <Field name="pattern_source" label="Pattern Source" defaultValue={v.pattern_source} />
          <Field name="pattern_link" label="Pattern Link" type="url" defaultValue={v.pattern_link} />
        </Section>

        <Section title="Quilting">
          <Field name="quilter_name" label="Quilter" placeholder="Lorena, or sent out to..." defaultValue={v.quilter_name} />
          <Field name="quilting_design" label="Quilting Design" placeholder="Edge-to-edge meander, custom feathers..." defaultValue={v.quilting_design} />
        </Section>

        <Section title="Fabrics &amp; Materials">
          <Field name="main_fabric" label="Main Fabric" defaultValue={v.main_fabric} />
          <Field name="fabric_brand" label="Fabric Brand" defaultValue={v.fabric_brand} />
          <Field name="fabric_designer" label="Fabric Designer" defaultValue={v.fabric_designer} />
          <Field name="fabric_collection" label="Fabric Collection" defaultValue={v.fabric_collection} />
          <Field name="batting" label="Batting" defaultValue={v.batting} />
          <Field name="backing" label="Backing" defaultValue={v.backing} />
          <Field name="binding" label="Binding" defaultValue={v.binding} />
        </Section>

        <Section title="Techniques">
          <div className="sm:col-span-2">
            <Field
              name="techniques"
              label="Techniques"
              placeholder="Hand Quilting, Paper Piecing, ... (comma separated)"
              defaultValue={v.techniques}
            />
          </div>
        </Section>

        <Section title="Project Story">
          <div className="sm:col-span-2">
            <TextAreaField name="project_story" label="Project Story" defaultValue={v.project_story} />
          </div>
          <div className="sm:col-span-2">
            <TextAreaField name="notes" label="Notes" defaultValue={v.notes} />
          </div>
          <div className="sm:col-span-2">
            <TextAreaField name="lessons_learned" label="Lessons Learned" defaultValue={v.lessons_learned} />
          </div>
        </Section>

        <Section title="Photos">
          <div className="sm:col-span-2">
            <Field name="cover_image" label="Cover Image" placeholder="Paste a Google Drive share link" defaultValue={v.cover_image} />
          </div>
          <div className="sm:col-span-2">
            <Field
              name="photo_gallery"
              label="Photo Gallery"
              placeholder="Paste Drive share links, separated by commas"
              defaultValue={v.photo_gallery}
            />
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" name="featured" value="true" defaultChecked={v.featured === "true"} className="h-4 w-4" />
            <span className="text-sm text-[var(--charcoal)]/70">Feature on the homepage</span>
          </label>
        </Section>

        {mode === "update" && v.id && (
          <input type="hidden" name="id" value={v.id} />
        )}

        <Section title="Confirm">
          <Field name="password" label="Password" type="password" required />
        </Section>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-4 border border-[var(--charcoal)] px-6 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[var(--charcoal)] transition-colors hover:bg-[var(--charcoal)] hover:text-[var(--ivory)] disabled:opacity-50"
        >
          {status === "submitting" ? "Saving…" : mode === "create" ? "Add Project" : "Save Changes"}
        </button>
      </form>
    </>
  );
}
