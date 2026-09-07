import Link from "next/link";

export default function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between px-5 pt-5 md:px-10 md:pt-8">
      <Link href="/" className="pointer-events-auto">
        <span className="block font-serif text-[13px] italic leading-none tracking-tight text-[var(--charcoal)] md:text-[15px]">
          Lorena&rsquo;s
          <br />
          Quilt Archive
        </span>
      </Link>

      <nav className="pointer-events-auto flex items-center gap-5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--charcoal)]/85 md:gap-8 md:text-xs">
        <Link href="/" className="transition-colors hover:text-[var(--charcoal)]">
          Index
        </Link>
        <Link href="/timeline" className="transition-colors hover:text-[var(--charcoal)]">
          Timeline
        </Link>
        <Link href="/about" className="transition-colors hover:text-[var(--charcoal)]">
          About
        </Link>
      </nav>
    </header>
  );
}
