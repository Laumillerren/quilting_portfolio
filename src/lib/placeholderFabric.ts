/**
 * Generates deterministic, textile-like SVG placeholder swatches so the site
 * looks like real fabric before Lorena's actual quilt photographs are wired
 * up via Google Sheets. Swapping a mock coverImage/photoGallery URL for a
 * real photo URL requires no other code changes.
 */

interface Palette {
  base: string;
  a: string;
  b: string;
  c: string;
}

const PALETTES: Palette[] = [
  { base: "#C9603C", a: "#E4A672", b: "#F4E3C9", c: "#5B3A2E" }, // rust / terracotta
  { base: "#3C5A6B", a: "#7FA5B3", b: "#EDE3D0", c: "#22323C" }, // indigo / slate
  { base: "#C79A3E", a: "#EBC77E", b: "#F6EEDB", c: "#5C4420" }, // mustard / gold
  { base: "#6F7D53", a: "#A6B486", b: "#EFE9D6", c: "#374023" }, // sage
  { base: "#B96B7A", a: "#E3AEB6", b: "#F7E9E3", c: "#4E2A32" }, // blush / berry
  { base: "#7A4E6D", a: "#B98CAA", b: "#F1E5EE", c: "#38222F" }, // plum
  { base: "#3E5641", a: "#82A084", b: "#EAE6D6", c: "#1E2C20" }, // forest
  { base: "#A24A34", a: "#D98F6F", b: "#F5E6D3", c: "#4A2318" }, // brick
  { base: "#41627A", a: "#8FB1C4", b: "#EDEDE3", c: "#20313E" }, // denim blue
  { base: "#8C6A3F", a: "#C9A876", b: "#F3EAD9", c: "#3F2E1A" }, // walnut / tan
  { base: "#8A3B4E", a: "#C77E8E", b: "#F5E4E6", c: "#3C1B23" }, // cranberry
  { base: "#556B7D", a: "#9BB4C2", b: "#EEE8DA", c: "#28343D" }, // stormy blue
];

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

type PatternKind = "stripe" | "gingham" | "dot" | "plaid" | "diagonal";
const PATTERN_KINDS: PatternKind[] = ["stripe", "gingham", "dot", "plaid", "diagonal"];

function patternMarkup(kind: PatternKind, p: Palette, seed: number): string {
  const angle = (seed % 4) * 45;
  switch (kind) {
    case "stripe":
      return `
        <rect width="240" height="240" fill="${p.b}" />
        <g transform="rotate(${angle} 120 120)">
          ${Array.from({ length: 6 })
            .map(
              (_, i) =>
                `<rect x="${i * 44 - 40}" y="-40" width="18" height="320" fill="${i % 2 ? p.a : p.base}" opacity="${
                  i % 2 ? 0.85 : 0.95
                }" />`
            )
            .join("")}
        </g>`;
    case "gingham":
      return `
        <rect width="240" height="240" fill="${p.b}" />
        <g opacity="0.55">
          ${Array.from({ length: 5 })
            .map((_, i) => `<rect x="${i * 48}" y="0" width="24" height="240" fill="${p.base}" />`)
            .join("")}
          ${Array.from({ length: 5 })
            .map((_, i) => `<rect x="0" y="${i * 48}" width="240" height="24" fill="${p.base}" />`)
            .join("")}
        </g>`;
    case "dot":
      return `
        <rect width="240" height="240" fill="${p.base}" />
        ${Array.from({ length: 6 })
          .map((_, row) =>
            Array.from({ length: 6 })
              .map((_, col) => {
                const x = col * 40 + (row % 2 ? 20 : 0) + 10;
                const y = row * 40 + 10;
                return `<circle cx="${x}" cy="${y}" r="9" fill="${p.b}" opacity="0.9" />`;
              })
              .join("")
          )
          .join("")}`;
    case "plaid":
      return `
        <rect width="240" height="240" fill="${p.b}" />
        <g opacity="0.75">
          ${Array.from({ length: 4 })
            .map((_, i) => `<rect x="${i * 60 + 6}" y="0" width="14" height="240" fill="${p.a}" />`)
            .join("")}
          ${Array.from({ length: 4 })
            .map((_, i) => `<rect x="0" y="${i * 60 + 6}" width="240" height="14" fill="${p.base}" opacity="0.8" />`)
            .join("")}
        </g>`;
    case "diagonal":
      return `
        <rect width="240" height="240" fill="${p.base}" />
        <g transform="rotate(45 120 120)" opacity="0.9">
          ${Array.from({ length: 10 })
            .map((_, i) => `<rect x="${i * 34 - 80}" y="-80" width="14" height="400" fill="${p.a}" />`)
            .join("")}
        </g>`;
  }
}

/**
 * Returns a data: URI SVG that reads as a piece of quilting fabric —
 * a stand-in for a real photograph, keyed off a seed string.
 */
export function placeholderFabric(seed: string): string {
  const h = hashString(seed);
  const palette = PALETTES[h % PALETTES.length];
  const kind = PATTERN_KINDS[Math.floor(h / PALETTES.length) % PATTERN_KINDS.length];
  const body = patternMarkup(kind, palette, h);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
