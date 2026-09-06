"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import QuiltBlock from "@/components/quilt-blocks/QuiltBlock";
import type { QuiltProject } from "@/lib/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LayerConfig {
  key: "far" | "mid" | "near";
  count: number;
  blockVw: number;
  spacingVw: number;
  yJitterVh: number;
  yCenterVh: number;
  opacity: number;
  blur: number;
  zIndex: number;
  startOffset: number;
}

const LAYERS: LayerConfig[] = [
  { key: "far", count: 10, blockVw: 10.5, spacingVw: 17, yJitterVh: 16, yCenterVh: 26, opacity: 0.78, blur: 0.6, zIndex: 1, startOffset: 3 },
  { key: "mid", count: 8, blockVw: 15.5, spacingVw: 24, yJitterVh: 20, yCenterVh: 50, opacity: 1, blur: 0, zIndex: 2, startOffset: 0 },
  { key: "near", count: 6, blockVw: 21, spacingVw: 32, yJitterVh: 18, yCenterVh: 68, opacity: 1, blur: 0, zIndex: 3, startOffset: 7 },
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function jitter(seed: string, range: number): number {
  const h = hash(seed);
  return ((h % 1000) / 1000 - 0.5) * range;
}

interface PlacedBlock {
  project: QuiltProject;
  projectIndex: number;
  leftVw: number;
  topVh: number;
  sizeVw: number;
  rotateDeg: number;
}

function layoutLayer(projects: QuiltProject[], layer: LayerConfig, layerIdx: number): { blocks: PlacedBlock[]; trackVw: number } {
  const blocks: PlacedBlock[] = [];
  for (let i = 0; i < layer.count; i++) {
    const project = projects[(i * 3 + layerIdx * 2) % projects.length];
    const seed = `${layer.key}-${i}-${project.id}`;
    const left = layer.startOffset + i * layer.spacingVw + jitter(`${seed}-x`, layer.spacingVw * 0.3);
    const top = layer.yCenterVh + jitter(`${seed}-y`, layer.yJitterVh);
    const size = layer.blockVw * (1 + jitter(`${seed}-s`, 0.22));
    const rotate = jitter(`${seed}-r`, 3.2);
    blocks.push({ project, projectIndex: (i * 3 + layerIdx * 2) % projects.length, leftVw: left, topVh: top, sizeVw: size, rotateDeg: rotate });
  }
  const trackVw = layer.startOffset + layer.count * layer.spacingVw + layer.blockVw + 8;
  return { blocks, trackVw };
}

export default function QuiltArchiveScene({ projects }: { projects: QuiltProject[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const layouts = useMemo(() => LAYERS.map((layer, i) => ({ layer, ...layoutLayer(projects, layer, i) })), [projects]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      layouts.forEach(({ layer, trackVw }) => {
        const el = layerRefs.current[layer.key];
        if (!el) return;
        const distanceVw = Math.max(trackVw - 100, 20);
        tl.fromTo(
          el,
          { xPercent: 0 },
          { x: `-=${distanceVw}vw`, ease: "none" },
          0
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [layouts]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: "440vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[var(--ivory)]">
        <div
          className="absolute inset-0 [transform:rotateX(0deg)] md:[transform:perspective(1800px)_rotateX(5deg)_rotateY(-3deg)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {layouts.map(({ layer, blocks }) => (
            <div
              key={layer.key}
              ref={(el) => {
                layerRefs.current[layer.key] = el;
              }}
              className="absolute inset-0 will-change-transform"
              style={{ zIndex: layer.zIndex }}
            >
              {blocks.map((b, i) => (
                <div
                  key={`${b.project.id}-${layer.key}-${i}`}
                  className="absolute aspect-square"
                  style={{
                    left: `${b.leftVw}vw`,
                    top: `${b.topVh}vh`,
                    width: `${b.sizeVw}vw`,
                    opacity: layer.opacity,
                    filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
                    transform: `rotate(${b.rotateDeg}deg)`,
                  }}
                >
                  <QuiltBlock project={b.project} index={b.projectIndex} className="h-full w-full rounded-[2px]" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--ivory)] to-transparent md:h-32" />
      </div>
    </section>
  );
}
