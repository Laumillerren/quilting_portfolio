import ProjectForm from "@/components/admin/ProjectForm";

export const metadata = {
  title: "Add a Project — Lorena's Quilt Archive",
};

export default function AdminAddProjectPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-32 pt-28 md:px-10 md:pt-36">
      <h1 className="font-serif text-4xl italic leading-tight text-[var(--charcoal)] md:text-5xl">Add a Project</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--charcoal)]/60">
        Adds a new row to the Google Sheet directly. It&rsquo;ll appear on the site within a few minutes — no
        redeploy needed.
      </p>

      <ProjectForm mode="create" />
    </main>
  );
}
