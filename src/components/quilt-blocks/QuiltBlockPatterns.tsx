"use client";

import type { BlockTemplate } from "@/lib/types";

/**
 * Renders a quilt project's cover photograph as a geometric quilt-block
 * composition. The photo behaves like fabric: different regions of the
 * block show different crops/scales/rotations of the same source image,
 * clipped into the shapes of a named quilt block pattern.
 *
 * All templates share one coordinate system: a 0-0-100-100 viewBox.
 */

interface BlockProps {
  src: string;
  seed: string;
  idPrefix: string;
}

// ---------- deterministic per-segment "crop" ----------

function hash(seed: string, salt: number): number {
  const s = `${seed}:${salt}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick(seed: string, salt: number, min: number, max: number): number {
  return min + ((hash(seed, salt) % 1000) / 1000) * (max - min);
}

interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
}

function cropFor(seed: string, index: number): Crop {
  const scale = pick(seed, index * 4 + 1, 1.5, 2.6);
  const w = 100 * scale;
  const h = 100 * scale;
  const x = -pick(seed, index * 4 + 2, 0, w - 100);
  const y = -pick(seed, index * 4 + 3, 0, h - 100);
  const rotate = [0, 90, 180, 270][hash(seed, index * 4 + 4) % 4];
  return { x, y, w, h, rotate };
}

/** A clipped, cropped swatch of the source photo — the "fabric" for one patch. */
function Swatch({
  src,
  seed,
  index,
  clipId,
  originX = 50,
  originY = 50,
}: {
  src: string;
  seed: string;
  index: number;
  clipId: string;
  originX?: number;
  originY?: number;
}) {
  const c = cropFor(seed, index);
  return (
    <g clipPath={`url(#${clipId})`}>
      <image
        href={src}
        x={c.x}
        y={c.y}
        width={c.w}
        height={c.h}
        preserveAspectRatio="xMidYMid slice"
        transform={c.rotate ? `rotate(${c.rotate} ${originX} ${originY})` : undefined}
      />
    </g>
  );
}

function RectClip({ id, x, y, w, h }: { id: string; x: number; y: number; w: number; h: number }) {
  return (
    <clipPath id={id}>
      <rect x={x} y={y} width={w} height={h} />
    </clipPath>
  );
}

function PolyClip({ id, points }: { id: string; points: string }) {
  return (
    <clipPath id={id}>
      <polygon points={points} />
    </clipPath>
  );
}

const strokeProps = {
  stroke: "var(--ivory, #F7F3EC)",
  strokeWidth: 0.6,
  vectorEffect: "non-scaling-stroke" as const,
};

// ---------- Four Patch ----------

function FourPatch({ src, seed, idPrefix }: BlockProps) {
  const cells = [
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 0, y: 50 },
    { x: 50, y: 50 },
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        {cells.map((c, i) => (
          <RectClip key={i} id={`${idPrefix}-fp-${i}`} x={c.x} y={c.y} w={50} h={50} />
        ))}
      </defs>
      {cells.map((c, i) => (
        <g key={i}>
          <Swatch src={src} seed={seed} index={i} clipId={`${idPrefix}-fp-${i}`} originX={c.x + 25} originY={c.y + 25} />
          <rect x={c.x} y={c.y} width={50} height={50} fill="none" {...strokeProps} />
        </g>
      ))}
    </svg>
  );
}

// ---------- Half Square Triangles ----------

function HalfSquareTriangle({ src, seed, idPrefix }: BlockProps) {
  const units = [
    { x: 0, y: 0, diag: 0 },
    { x: 50, y: 0, diag: 1 },
    { x: 0, y: 50, diag: 1 },
    { x: 50, y: 50, diag: 0 },
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        {units.map((u, i) => {
          const s = 50;
          const a =
            u.diag === 0
              ? `${u.x},${u.y} ${u.x + s},${u.y} ${u.x},${u.y + s}`
              : `${u.x},${u.y} ${u.x + s},${u.y} ${u.x + s},${u.y + s}`;
          const b =
            u.diag === 0
              ? `${u.x + s},${u.y} ${u.x + s},${u.y + s} ${u.x},${u.y + s}`
              : `${u.x},${u.y} ${u.x + s},${u.y + s} ${u.x},${u.y + s}`;
          return (
            <g key={i}>
              <PolyClip id={`${idPrefix}-hst-${i}a`} points={a} />
              <PolyClip id={`${idPrefix}-hst-${i}b`} points={b} />
            </g>
          );
        })}
      </defs>
      {units.map((u, i) => (
        <g key={i}>
          <Swatch src={src} seed={seed} index={i * 2} clipId={`${idPrefix}-hst-${i}a`} originX={u.x + 25} originY={u.y + 25} />
          <Swatch src={src} seed={seed} index={i * 2 + 1} clipId={`${idPrefix}-hst-${i}b`} originX={u.x + 25} originY={u.y + 25} />
          <line x1={u.x} y1={u.y} x2={u.x + 50} y2={u.y + 50} {...strokeProps} />
        </g>
      ))}
      <rect x={0} y={0} width={100} height={100} fill="none" {...strokeProps} />
      <line x1={50} y1={0} x2={50} y2={100} {...strokeProps} />
      <line x1={0} y1={50} x2={100} y2={50} {...strokeProps} />
    </svg>
  );
}

// ---------- Flying Geese ----------

function FlyingGeese({ src, seed, idPrefix }: BlockProps) {
  const columns = 4;
  const colW = 100 / columns;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <RectClip id={`${idPrefix}-fg-sky`} x={0} y={12} w={100} h={76} />
        {Array.from({ length: columns }).map((_, i) => {
          const x = i * colW;
          return (
            <PolyClip
              key={i}
              id={`${idPrefix}-fg-goose-${i}`}
              points={`${x + colW / 2},14 ${x + colW - 2},86 ${x + 2},86`}
            />
          );
        })}
      </defs>
      <rect x={0} y={0} width={100} height={12} fill="none" />
      <Swatch src={src} seed={seed} index={0} clipId={`${idPrefix}-fg-sky`} />
      {Array.from({ length: columns }).map((_, i) => (
        <Swatch
          key={i}
          src={src}
          seed={seed}
          index={i + 1}
          clipId={`${idPrefix}-fg-goose-${i}`}
          originX={i * colW + colW / 2}
          originY={50}
        />
      ))}
      <rect x={0} y={0} width={100} height={12} fill="var(--ivory, #F7F3EC)" />
      <rect x={0} y={88} width={100} height={12} fill="var(--ivory, #F7F3EC)" />
      <rect x={0} y={0} width={100} height={100} fill="none" {...strokeProps} />
    </svg>
  );
}

// ---------- Pinwheel ----------

function Pinwheel({ src, seed, idPrefix }: BlockProps) {
  const tris = [
    { pts: "0,0 100,0 50,50", i: 0 },
    { pts: "100,0 100,100 50,50", i: 1 },
    { pts: "100,100 0,100 50,50", i: 2 },
    { pts: "0,100 0,0 50,50", i: 3 },
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        {tris.map((t, i) => (
          <PolyClip key={i} id={`${idPrefix}-pw-${i}`} points={t.pts} />
        ))}
      </defs>
      {tris.map((t, i) => (
        <Swatch key={i} src={src} seed={seed} index={i} clipId={`${idPrefix}-pw-${i}`} />
      ))}
      <line x1={0} y1={0} x2={100} y2={100} {...strokeProps} />
      <line x1={100} y1={0} x2={0} y2={100} {...strokeProps} />
      <rect x={0} y={0} width={100} height={100} fill="none" {...strokeProps} />
    </svg>
  );
}

// ---------- Log Cabin / Courthouse Steps (shared strip builder) ----------

interface Strip {
  x: number;
  y: number;
  w: number;
  h: number;
}

function buildStrips(rounds: number, mode: "spiral" | "symmetric"): Strip[] {
  const s = 100 / (2 * rounds + 1);
  const c = s;
  let x = 50 - c / 2;
  let y = 50 - c / 2;
  let w = c;
  let h = c;
  const strips: Strip[] = [{ x, y, w, h }];

  if (mode === "spiral") {
    const dirs: Array<"right" | "bottom" | "left" | "top"> = ["right", "bottom", "left", "top"];
    for (let i = 0; i < rounds * 4; i++) {
      const dir = dirs[i % 4];
      if (dir === "right") {
        strips.push({ x: x + w, y, w: s, h });
        w += s;
      } else if (dir === "bottom") {
        strips.push({ x, y: y + h, w, h: s });
        h += s;
      } else if (dir === "left") {
        x -= s;
        strips.push({ x, y, w: s, h });
        w += s;
      } else {
        y -= s;
        strips.push({ x, y, w, h: s });
        h += s;
      }
    }
  } else {
    for (let i = 0; i < rounds; i++) {
      y -= s;
      strips.push({ x, y, w, h: s });
      h += s;
      strips.push({ x, y: y + h - s, w, h: s });
      h += s;
      x -= s;
      strips.push({ x, y, w: s, h });
      w += s;
      strips.push({ x: x + w - s, y, w: s, h });
      w += s;
    }
  }
  return strips;
}

function StripBlock({ src, seed, idPrefix, mode }: BlockProps & { mode: "spiral" | "symmetric" }) {
  const strips = buildStrips(2, mode);
  const prefix = mode === "spiral" ? "lc" : "cs";
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        {strips.map((s, i) => (
          <RectClip key={i} id={`${idPrefix}-${prefix}-${i}`} x={s.x} y={s.y} w={s.w} h={s.h} />
        ))}
      </defs>
      {strips.map((s, i) => (
        <g key={i}>
          <Swatch
            src={src}
            seed={seed}
            index={i}
            clipId={`${idPrefix}-${prefix}-${i}`}
            originX={s.x + s.w / 2}
            originY={s.y + s.h / 2}
          />
          <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="none" {...strokeProps} />
        </g>
      ))}
    </svg>
  );
}

// ---------- Star Block (Ohio Star) ----------

function StarBlock({ src, seed, idPrefix }: BlockProps) {
  const cs = 100 / 3;
  const corners = [
    { x: 0, y: 0 },
    { x: 2 * cs, y: 0 },
    { x: 0, y: 2 * cs },
    { x: 2 * cs, y: 2 * cs },
  ];
  const edges = [
    { x: cs, y: 0, diag: "tl" as const },
    { x: cs, y: 2 * cs, diag: "bl" as const },
    { x: 0, y: cs, diag: "tl" as const },
    { x: 2 * cs, y: cs, diag: "br" as const },
  ];

  function edgeTriangles(e: (typeof edges)[number]) {
    const { x, y } = e;
    if (e.diag === "tl") {
      return [
        `${x},${y} ${x + cs},${y} ${x},${y + cs}`,
        `${x + cs},${y} ${x + cs},${y + cs} ${x},${y + cs}`,
      ];
    }
    if (e.diag === "bl") {
      return [
        `${x},${y} ${x + cs},${y} ${x + cs},${y + cs}`,
        `${x},${y} ${x + cs},${y + cs} ${x},${y + cs}`,
      ];
    }
    return [
      `${x},${y} ${x + cs},${y} ${x + cs},${y + cs}`,
      `${x},${y} ${x + cs},${y + cs} ${x},${y + cs}`,
    ];
  }

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        {corners.map((c, i) => (
          <RectClip key={`c${i}`} id={`${idPrefix}-star-c${i}`} x={c.x} y={c.y} w={cs} h={cs} />
        ))}
        <RectClip id={`${idPrefix}-star-center`} x={cs} y={cs} w={cs} h={cs} />
        {edges.map((e, i) => {
          const [a, b] = edgeTriangles(e);
          return (
            <g key={`e${i}`}>
              <PolyClip id={`${idPrefix}-star-e${i}a`} points={a} />
              <PolyClip id={`${idPrefix}-star-e${i}b`} points={b} />
            </g>
          );
        })}
      </defs>

      {corners.map((c, i) => (
        <g key={i}>
          <Swatch src={src} seed={seed} index={i} clipId={`${idPrefix}-star-c${i}`} originX={c.x + cs / 2} originY={c.y + cs / 2} />
          <rect x={c.x} y={c.y} width={cs} height={cs} fill="none" {...strokeProps} />
        </g>
      ))}

      <Swatch src={src} seed={seed} index={8} clipId={`${idPrefix}-star-center`} originX={50} originY={50} />
      <rect x={cs} y={cs} width={cs} height={cs} fill="none" {...strokeProps} />

      {edges.map((e, i) => (
        <g key={i}>
          <Swatch src={src} seed={seed} index={9 + i} clipId={`${idPrefix}-star-e${i}a`} originX={e.x + cs / 2} originY={e.y + cs / 2} />
          <rect x={e.x} y={e.y} width={cs} height={cs} fill="none" {...strokeProps} />
        </g>
      ))}
    </svg>
  );
}

// ---------- Diamond Block ----------

function DiamondBlock({ src, seed, idPrefix }: BlockProps) {
  const cells = [
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 0, y: 50 },
    { x: 50, y: 50 },
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        {cells.map((c, i) => (
          <RectClip key={`bg${i}`} id={`${idPrefix}-dia-bg${i}`} x={c.x} y={c.y} w={50} h={50} />
        ))}
        {cells.map((c, i) => {
          const cx = c.x + 25;
          const cy = c.y + 25;
          const r = 24;
          return (
            <PolyClip
              key={`d${i}`}
              id={`${idPrefix}-dia-${i}`}
              points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
            />
          );
        })}
      </defs>
      {cells.map((c, i) => (
        <g key={i}>
          <Swatch src={src} seed={seed} index={i * 2} clipId={`${idPrefix}-dia-bg${i}`} originX={c.x + 25} originY={c.y + 25} />
          <Swatch src={src} seed={seed} index={i * 2 + 1} clipId={`${idPrefix}-dia-${i}`} originX={c.x + 25} originY={c.y + 25} />
          <rect x={c.x} y={c.y} width={50} height={50} fill="none" {...strokeProps} />
        </g>
      ))}
    </svg>
  );
}

// ---------- registry ----------

export const QUILT_BLOCK_COMPONENTS: Record<BlockTemplate, (props: BlockProps) => React.JSX.Element> = {
  "four-patch": FourPatch,
  "half-square-triangle": HalfSquareTriangle,
  "flying-geese": FlyingGeese,
  pinwheel: Pinwheel,
  "log-cabin": (p) => <StripBlock {...p} mode="spiral" />,
  "courthouse-steps": (p) => <StripBlock {...p} mode="symmetric" />,
  "star-block": StarBlock,
  "diamond-block": DiamondBlock,
};
