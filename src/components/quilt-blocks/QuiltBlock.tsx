"use client";

import Link from "next/link";
import { useId } from "react";
import { QUILT_BLOCK_COMPONENTS } from "./QuiltBlockPatterns";
import { assignBlockTemplate } from "@/lib/types";
import { resolveImageUrl } from "@/lib/imageUrl";
import type { QuiltProject } from "@/lib/types";

interface QuiltBlockProps {
  project: QuiltProject;
  index: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function QuiltBlock({ project, index, className, style }: QuiltBlockProps) {
  const rawId = useId();
  const uid = `qb${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const template = assignBlockTemplate(project, index);
  const Block = QUILT_BLOCK_COMPONENTS[template];
  const src = resolveImageUrl(project.coverImage);

  return (
    <Link
      href={`/quilts/${project.slug}`}
      className={`group relative block overflow-hidden bg-[var(--cream)] transition-transform duration-500 ease-out will-change-transform hover:z-20 hover:scale-[1.05] ${className ?? ""}`}
      style={{ cursor: "pointer", ...style }}
      data-quilt-block
      aria-label={`${project.projectName}, ${project.year}`}
    >
      <div className="absolute inset-0 transition-[filter] duration-500 ease-out [filter:saturate(0.92)] group-hover:[filter:saturate(1.1)_contrast(1.05)_brightness(1.03)]">
        <Block src={src} seed={project.id} idPrefix={uid} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/60 via-black/5 to-transparent px-3 pb-2.5 pt-8 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
        <span className="font-serif text-[13px] italic leading-tight text-white">{project.projectName}</span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-white/75">
          {project.year} · {project.status}
        </span>
      </div>
    </Link>
  );
}
