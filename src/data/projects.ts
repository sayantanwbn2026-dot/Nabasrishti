import { media } from "./media";

export type ProjectImage = {
  src: string;
  alt: string;
};

export type Project = {
  id: string;
  title: string;
  year: string;
  /** Flat typology, e.g. "3 BHK" — shown in the detail meta line. */
  typology: string;
  /** Locality, city. */
  location: string;
  /** What the studio actually did; drives the scope list. */
  scope: string[];
  /** The project story, shown as running copy in the detail view. */
  narrative: string;
  /** Card image for the gallery grid on the home page. */
  image: string;
  alt: string;
  className: string;
  width: number;
  height: number;
  /** Detail-view gallery. The card image leads. */
  gallery: ProjectImage[];
};

/* -------------------------------------------------------------------------
   PLACEHOLDER CONTENT

   The narratives and galleries below are structural placeholders so the
   detail view can be built and reviewed. Replace each `narrative` with the
   real client story and each `gallery` with that project's own photographs —
   the fields are the content model, not the content.
   ---------------------------------------------------------------------- */

export const projects: Project[] = [
  {
    id: "modern-heritage-villa",
    title: "The Modern Heritage Villa",
    year: "2026",
    typology: "4 BHK",
    location: "Alipore, Kolkata",
    scope: ["Full interior", "Bespoke joinery", "Lighting design"],
    narrative:
      "A family home where the original arched windows set the terms for everything else. We kept the shell intact and worked inward — pale upholstery to let the light stay the loudest element, and joinery sized to the existing openings so nothing reads as an addition. The brief asked for room to display a growing art collection without the house turning into a gallery.",
    image: media.projectHeritage,
    alt: "Bright living room with arched windows, pale sofa and colorful artwork",
    className: "project-heritage",
    width: 1920,
    height: 1446,
    gallery: [
      {
        src: media.projectHeritage,
        alt: "Living room with arched windows and a pale sectional sofa",
      },
      {
        src: media.serviceResidential,
        alt: "Dining area with timber table and woven pendant lighting",
      },
      {
        src: media.serviceMaterial,
        alt: "Detail of stone and timber materials meeting at a threshold",
      },
      {
        src: media.serviceStyling,
        alt: "Styled shelf with ceramics and books against a plaster wall",
      },
    ],
  },
  {
    id: "casa-sol",
    title: "Casa Sol",
    year: "2026",
    typology: "3 BHK",
    location: "New Town, Kolkata",
    scope: ["Space planning", "Furniture", "Styling"],
    narrative:
      "A south-facing flat that ran hot by midday. The plan turned the living areas away from the worst of it and pushed storage to the warm wall, where it doubles as insulation. Sculptural pieces were chosen sparingly — in a room this bright, one strong silhouette does more than five.",
    image: media.projectCasaSol,
    alt: "Textured living room with sculptural furniture and abstract artwork",
    className: "project-casa-sol",
    width: 1920,
    height: 1920,
    gallery: [
      {
        src: media.projectCasaSol,
        alt: "Living room with sculptural seating and abstract artwork",
      },
      {
        src: media.serviceLayout,
        alt: "Open-plan layout seen from the entry",
      },
      {
        src: media.serviceStyling,
        alt: "Console styled with ceramics beneath a framed work",
      },
    ],
  },
  {
    id: "urban-haven",
    title: "The Urban Haven",
    year: "2026",
    typology: "2 BHK",
    location: "Salt Lake, Kolkata",
    scope: ["Full interior", "Custom wardrobes", "False ceiling"],
    narrative:
      "A compact flat for a couple who both work from home. Two desks had to exist without the place reading as an office after six, so the workstations fold back into joinery and the lighting switches scene with them. Skylights were left unscreened — the only generous thing about the floor plan was its ceiling height.",
    image: media.projectUrban,
    alt: "Monumental concrete interior with skylights and minimalist plinths",
    className: "project-urban",
    width: 2202,
    height: 1229,
    gallery: [
      {
        src: media.projectUrban,
        alt: "Concrete interior lit from above by skylights",
      },
      {
        src: media.serviceCommercial,
        alt: "Work area with built-in desk and shelving",
      },
      {
        src: media.serviceLayout,
        alt: "Circulation space between living and sleeping areas",
      },
    ],
  },
  {
    id: "collective-workspace",
    title: "The Collective Workspace",
    year: "2026",
    typology: "Commercial",
    location: "Park Street, Kolkata",
    scope: ["Workplace design", "Acoustics", "Lighting design"],
    narrative:
      "A shared studio floor for three small practices. The fireplace wall was the one fixed point, so it became the social end of the plan and desks moved away from it in bands. Acoustic treatment is hidden in the ceiling rafts; the blue accents are the only thing anyone notices first.",
    image: media.projectCollective,
    alt: "Bright contemporary living room with a fireplace, chandelier and blue accents",
    className: "project-collective",
    width: 1200,
    height: 600,
    gallery: [
      {
        src: media.projectCollective,
        alt: "Shared lounge with fireplace and blue accent seating",
      },
      {
        src: media.serviceCommercial,
        alt: "Desk bank beneath pendant lighting",
      },
    ],
  },
  {
    id: "serene-residence",
    title: "The Serene Residence",
    year: "2026",
    typology: "3 BHK",
    location: "Ballygunge, Kolkata",
    scope: ["Full interior", "Material palette", "Styling"],
    narrative:
      "The brief was one line: nothing loud. We held the palette to three materials and let the daylight do the shifting through the day. Every piece of storage is flush, every handle recessed — the room has no hardware to look at, which is the whole point.",
    image: media.projectSerene,
    alt: "Quiet neutral living room filled with soft daylight",
    className: "project-serene",
    width: 1920,
    height: 1077,
    gallery: [
      {
        src: media.projectSerene,
        alt: "Neutral living room in soft daylight",
      },
      {
        src: media.serviceMaterial,
        alt: "Close detail of the material palette",
      },
      {
        src: media.serviceStyling,
        alt: "Quiet styling against a plaster wall",
      },
    ],
  },
];
