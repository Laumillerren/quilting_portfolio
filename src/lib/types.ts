export interface FabricSwatch {
  fabricName: string;
  designer?: string;
  colorway?: string;
  image?: string;
}

export interface QuiltProject {
  id: string;
  slug: string;
  projectName: string;
  status: string;
  coverImage: string;
  year: string;

  dateStarted?: string;
  dateCut?: string;
  dateTopFinished?: string;
  dateFinished?: string;

  quiltType?: string;
  dimensions?: string;

  patternName?: string;
  patternDesigner?: string;
  patternSource?: string;
  patternLink?: string;

  quilterName?: string;
  quiltingDesign?: string;

  mainFabric?: string;
  fabricBrand?: string;
  fabricDesigner?: string;
  fabricCollection?: string;
  fabrics: FabricSwatch[];

  batting?: string;
  backing?: string;
  binding?: string;

  techniques: string[];

  projectStory?: string;
  notes?: string;
  lessonsLearned?: string;

  photoGallery: string[];

  featured?: boolean;
}
