export type BlockTemplate =
  | "four-patch"
  | "half-square-triangle"
  | "flying-geese"
  | "pinwheel"
  | "log-cabin"
  | "courthouse-steps"
  | "star-block"
  | "diamond-block";

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  "four-patch",
  "half-square-triangle",
  "flying-geese",
  "pinwheel",
  "log-cabin",
  "courthouse-steps",
  "star-block",
  "diamond-block",
];

export interface QuiltProject {
  id: string;
  slug: string;
  projectName: string;
  status: string;
  coverImage: string;
  year: string;

  dateStarted?: string;
  dateFinished?: string;

  quiltType?: string;
  dimensions?: string;

  patternName?: string;
  patternDesigner?: string;
  patternSource?: string;
  patternLink?: string;

  mainFabric?: string;
  fabricBrand?: string;
  fabricDesigner?: string;
  fabricCollection?: string;

  batting?: string;
  backing?: string;
  binding?: string;

  techniques: string[];

  projectStory?: string;
  notes?: string;
  lessonsLearned?: string;

  photoGallery: string[];

  featured?: boolean;
  blockTemplate?: BlockTemplate;
}

/** Deterministically assigns a block template from a project's id/index. */
export function assignBlockTemplate(project: Pick<QuiltProject, "id" | "blockTemplate">, index: number): BlockTemplate {
  if (project.blockTemplate) return project.blockTemplate;
  const hash = [...project.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return BLOCK_TEMPLATES[(hash + index) % BLOCK_TEMPLATES.length];
}
