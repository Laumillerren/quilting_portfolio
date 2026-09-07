"use client";

import { useState } from "react";
import Link from "next/link";

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
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
        className="w-full border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--charcoal)] outline-none focus:border-[var(--charcoal)]/50"
      />
    </label>
  );
}

function TextAreaField({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-[var(--charcoal)]/55">{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
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

export default function AdminAddProjectPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage(null);

    const form = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    form.forEach((value, key) => {
      payload[key] = String(value);
    });

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
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
      setNewSlug(data.slug);
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Could not reach the server");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-32 pt-28 md:px-10 md:pt-36">
      <h1 className="font-serif text-4xl italic leading-tight text-[var(--charcoal)] md:text-5xl">Add a Project</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--charcoal)]/60">
        Adds a new row to the Google Sheet directly. It&rsquo;ll appear on the site within a few minutes — no
        redeploy needed.
      </p>

      {status === "done" && (
        <div className="mt-8 border border-[var(--charcoal)]/20 bg-[var(--cream)] px-4 py-3 text-sm text-[var(--charcoal)]">
          Saved.{" "}
          {newSlug && (
            <Link href={`/quilts/${newSlug}`} className="underline underline-offset-2">
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
          <Field name="project_name" label="Project Name" required />
          <Field name="slug" label="URL Slug" placeholder="auto-generated from name if left blank" />
          <Field name="status" label="Status" placeholder="Finished, In Progress, UFO, Planned..." required />
          <Field name="year" label="Year" required />
          <Field name="date_started" label="Date Started" placeholder="March 2026" />
          <Field name="date_finished" label="Date Finished" placeholder="September 2026" />
          <Field name="quilt_type" label="Quilt Type" placeholder="Bed quilt, queen" />
          <Field name="dimensions" label="Dimensions" placeholder='92" x 96"' />
        </Section>

        <Section title="Pattern">
          <Field name="pattern_name" label="Pattern Name" />
          <Field name="pattern_designer" label="Pattern Designer" />
          <Field name="pattern_source" label="Pattern Source" />
          <Field name="pattern_link" label="Pattern Link" type="url" />
        </Section>

        <Section title="Fabrics &amp; Materials">
          <Field name="main_fabric" label="Main Fabric" />
          <Field name="fabric_brand" label="Fabric Brand" />
          <Field name="fabric_designer" label="Fabric Designer" />
          <Field name="fabric_collection" label="Fabric Collection" />
          <Field name="batting" label="Batting" />
          <Field name="backing" label="Backing" />
          <Field name="binding" label="Binding" />
        </Section>

        <Section title="Techniques">
          <div className="sm:col-span-2">
            <Field name="techniques" label="Techniques" placeholder="Hand Quilting, Paper Piecing, ... (comma separated)" />
          </div>
        </Section>

        <Section title="Project Story">
          <div className="sm:col-span-2">
            <TextAreaField name="project_story" label="Project Story" />
          </div>
          <div className="sm:col-span-2">
            <TextAreaField name="notes" label="Notes" />
          </div>
          <div className="sm:col-span-2">
            <TextAreaField name="lessons_learned" label="Lessons Learned" />
          </div>
        </Section>

        <Section title="Photos">
          <div className="sm:col-span-2">
            <Field name="cover_image" label="Cover Image" placeholder="Paste a Google Drive share link" />
          </div>
          <div className="sm:col-span-2">
            <Field
              name="photo_gallery"
              label="Photo Gallery"
              placeholder="Paste Drive share links, separated by commas"
            />
          </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" name="featured" value="true" className="h-4 w-4" />
            <span className="text-sm text-[var(--charcoal)]/70">Feature on the homepage</span>
          </label>
        </Section>

        <Section title="Confirm">
          <Field name="password" label="Password" type="password" required />
        </Section>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-4 border border-[var(--charcoal)] px-6 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[var(--charcoal)] transition-colors hover:bg-[var(--charcoal)] hover:text-[var(--ivory)] disabled:opacity-50"
        >
          {status === "submitting" ? "Saving…" : "Add Project"}
        </button>
      </form>
    </main>
  );
}
