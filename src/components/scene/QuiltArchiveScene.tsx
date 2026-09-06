"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import QuiltBlock from "@/components/quilt-blocks/QuiltBlock";
import type { QuiltProject } from "@/lib/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * The homepage's core interaction: one continuous horizontal track of
 * quilt blocks — every project, in order, as a direct flex child — pinned
 * in the viewport while vertical scroll drives horizontal translation.
 * No independent block positioning, depth layers, or scatter: the whole
 * track moves together, the way the reference site's project row does.
 */
export default function QuiltArchiveScene({ projects }: { projects: QuiltProject[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;

      const getScrollDistance = () => Math.max(track.scrollWidth - viewport.clientWidth, 0);

      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [projects]);

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-[var(--ivory)]">
      <div ref={viewportRef} className="absolute inset-0 overflow-hidden">
        <div
          ref={trackRef}
          className="flex h-full items-center will-change-transform"
          style={{ gap: "clamp(18px, 3.2vw, 56px)" }}
        >
          <div aria-hidden className="flex-shrink-0" style={{ width: "clamp(24px, 6vw, 120px)" }} />

          {projects.map((project) => (
            <div
              key={project.id}
              className="flex-shrink-0 aspect-square"
              style={{ width: "clamp(240px, 34vw, 620px)" }}
            >
              <QuiltBlock project={project} className="h-full w-full rounded-[2px]" />
            </div>
          ))}

          <div aria-hidden className="flex-shrink-0" style={{ width: "clamp(24px, 6vw, 120px)" }} />
        </div>
      </div>
    </section>
  );
}
