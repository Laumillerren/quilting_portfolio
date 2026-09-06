export const metadata = {
  title: "About — Lorena's Quilt Archive",
};

export default function AboutPage() {
  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-32">
        <h1 className="font-serif text-4xl italic leading-tight text-[var(--charcoal)] md:text-5xl">
          About the Archive
        </h1>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--charcoal)]/85 md:text-base">
          <p>
            This is a running record of quilts made by Lorena — pieced, appliqu&eacute;d, and quilted
            by hand and by machine, one project at a time, since 1994.
          </p>
          <p>
            Every project here started as a photograph of a finished (or unfinished) quilt, and grew
            into a small record of the pattern, the fabric, and the story behind it: why it was made,
            who it was for, and what it took to get there.
          </p>
          <p>
            The archive is built and maintained project by project. If you have a quilt of Lorena&rsquo;s
            you&rsquo;d like documented here, get in touch.
          </p>
        </div>
      </main>
    </>
  );
}
