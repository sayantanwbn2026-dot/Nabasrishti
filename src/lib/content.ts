import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { site as fallbackSite } from "@/data/site";
import { projects as fallbackProjects } from "@/data/projects";
import { media } from "@/data/media";

/* ---------------------------------------------------------------------
   Types mirroring the CMS tables.
   ------------------------------------------------------------------ */

export type Stat = { value: number; suffix: string; label: string };
export type Usp = { label: string; value: string };

export type SiteSettings = {
  name: string;
  phone: string;
  phone_digits: string;
  email: string;
  location: string;
  hero_image_url: string;
  hero_image_alt: string;
  headline: string;
  service_highlights: string[];
  cta_primary_label: string;
  tagline: string;
  studio_label: string;
  studio_statement: string;
  studio_image_url: string;
  studio_image_alt: string;
  stats: Stat[];
  projects_label: string;
  projects_heading: string;
  services_label: string;
  services_heading: string;
  comparison_heading: string;
  process_label: string;
  process_heading: string;
  testimonials_label: string;
  testimonials_heading: string;
  testimonials_aside: string;
  journal_label: string;
  journal_heading: string;
  journal_aside: string;
  closing_image_url: string;
  closing_image_alt: string;
  closing_heading: string;
  closing_body: string;
  footer_intro: string;
  footer_note: string;
  enquiry_heading: string;
  enquiry_lede: string;
  enquiry_services: string[];
  enquiry_delay_ms: number;
  thankyou_heading: string;
  thankyou_body: string;
  meta_title: string;
  meta_description: string;
  logo_url: string;
  logo_alt: string;
  logo_dark_url: string;
  show_logo_in_nav: boolean;
  comparison_cta_label: string;
  transformations_label: string;
  transformations_heading: string;
  transformations_intro: string;
  preloader_enabled: boolean;
  preloader_duration_ms: number;
  whatsapp_enabled_fab: boolean;
  whatsapp_message: string;
  comparison_before_url: string;
  comparison_after_url: string;
  comparison_before_label: string;
  comparison_after_label: string;
  not_found_heading: string;
  not_found_body: string;
  nav_cta_label: string;
  cta_studio_label: string;
  cta_projects_label: string;
  cta_services_label: string;
  cta_process_label: string;
  cta_testimonials_label: string;
  cta_journal_label: string;
  project_cta_prompt: string;
  article_cta_prompt: string;
  contact_label: string;
  contact_heading: string;
  contact_address: string;
  contact_hours: string;
  map_embed_url: string;
  map_link_url: string;
  show_social_in_footer: boolean;
};

export type BlockType =
  | "image"
  | "gallery"
  | "text"
  | "heading"
  | "quote"
  | "specs"
  | "split"
  | "spacer"
  | "compare";

export type ProjectBlock = {
  id: string;
  project_id: string;
  type: BlockType;
  position: number;
  is_published: boolean;
  payload: Record<string, unknown>;
};

export type CmsProject = {
  id: string;
  slug: string;
  title: string;
  year: string;
  typology: string;
  location: string;
  scope: string[];
  narrative: string;
  card_image_url: string;
  card_image_alt: string;
  card_layout: "full" | "half" | "wide-right" | "narrow-left" | "offset-right";
  card_ratio: number;
  detail_layout: "two-column" | "stacked";
  show_scope: boolean;
  show_cta: boolean;
  cta_label: string;
  accent_label: string;
  position: number;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
  share_image_url: string;
  blocks?: ProjectBlock[];
};

/** A band on the home page, in the order the CMS puts it. */
export type HomeSection = {
  id: string;
  key: string;
  label: string;
  note: string;
  position: number;
  is_published: boolean;
  /** The hero and the closing banner cannot be moved or hidden. */
  is_locked: boolean;
};

/** One before/after pairing in the transformations gallery. */
export type Transformation = {
  id: string;
  title: string;
  caption: string;
  before_url: string;
  before_alt: string;
  after_url: string;
  after_alt: string;
  position: number;
  is_published: boolean;
};

export type Service = {
  id: string;
  title: string;
  body: string;
  image_url: string;
  image_alt: string;
  position: number;
  is_published: boolean;
};

export type ProcessStep = {
  id: string;
  number: string;
  title: string;
  description: string;
  position: number;
  is_published: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  quote: string;
  portrait_url: string;
  image_url: string;
  image_alt: string;
  position: number;
  is_published: boolean;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  read_minutes: number;
  date_label: string;
  date_value: string | null;
  image_url: string;
  image_alt: string;
  link_url: string;
  detail_layout: "two-column" | "stacked";
  show_cta: boolean;
  cta_label: string;
  position: number;
  is_published: boolean;
  seo_title: string;
  seo_description: string;
  share_image_url: string;
  blocks?: ProjectBlock[];
};

export type NavLink = {
  id: string;
  label: string;
  href: string;
  position: number;
  is_published: boolean;
};

export type SocialLink = {
  id: string;
  platform: string;
  label: string;
  url: string;
  position: number;
  is_published: boolean;
};

export type Enquiry = {
  id: string;
  name: string;
  mobile: string;
  service: string;
  comments: string;
  source: string;
  page: string;
  status: string;
  notes: string;
  created_at: string;
};

export type FooterLink = {
  id: string;
  column_label: string;
  label: string;
  href: string;
  is_external: boolean;
  position: number;
};

/* ---------------------------------------------------------------------
   Fallbacks: what the site shows when Supabase is unreachable or
   unconfigured. These mirror the seeded rows, so the page never renders
   empty because of a missing environment variable.
   ------------------------------------------------------------------ */

export const fallbackSettings: SiteSettings = {
  name: fallbackSite.name,
  phone: fallbackSite.phone,
  phone_digits: fallbackSite.phoneDigits,
  email: fallbackSite.email,
  location: fallbackSite.location,
  hero_image_url: "",
  hero_image_alt:
    "Sunlit minimalist living room with timber furniture and black-framed windows",
  headline: fallbackSite.headline,
  service_highlights: [...fallbackSite.serviceHighlights],
  cta_primary_label: "Get free consultation",
  tagline: fallbackSite.tagline,
  studio_label: "Studio",
  studio_statement:
    "We are an independent interior design studio interested in what makes a space work beyond its appearance — how light travels through it, how materials respond to daily use, and how its layout quietly shapes the way people live.",
  studio_image_url: "",
  studio_image_alt:
    "Warm minimalist room with stone walls, timber furniture and a tall artwork",
  stats: [
    { value: 8, suffix: "+", label: "Years" },
    { value: 120, suffix: "+", label: "Projects" },
    { value: 100, suffix: "%", label: "Client Retention" },
  ],
  projects_label: "Projects",
  projects_heading: "Explore some of our\nmost recent projects",
  services_label: "Services",
  services_heading: "How We Can Help",
  comparison_heading: "From Concept to Creation",
  process_label: "Our Process",
  process_heading: "From First Conversion\nto Finished State",
  testimonials_label: "Testimonials",
  testimonials_heading: "Trusted by Brands Across Industries",
  testimonials_aside: "Feedback from brands we've worked with.",
  journal_label: "Blogs",
  journal_heading: "Notes From The Studio",
  journal_aside:
    "Explore practical tips, industry trends, and creative insights from our experts.",
  closing_image_url: "",
  closing_image_alt: "Modern architectural home on a rocky coastal landscape",
  closing_heading: "Let's Make Space for Something Beautiful.",
  closing_body:
    "Let's transform your ideas into timeless spaces that feel uniquely yours.",
  footer_intro:
    "An independent interior design studio shaping considered, enduring spaces.",
  footer_note: "Copyrights ©2025. All right reserved",
  enquiry_heading: "Let's design your space.",
  enquiry_lede: "Share your details and we will get back to you within 24 hours.",
  enquiry_services: [
    "1 BHK Interior",
    "2 BHK Interior",
    "3 BHK Interior",
    "4 BHK Interior",
    "Commercial Interior",
    "Renovation",
  ],
  enquiry_delay_ms: 3000,
  thankyou_heading: "Thank you — your enquiry is with our team.",
  thankyou_body:
    "A designer from the studio will call you within one working day to understand your space and talk through next steps.",
  meta_title: "Nabasrishti | Best Interior Design Studio in South Kolkata",
  meta_description:
    "Nabasrishti is an interior design studio in South Kolkata delivering residential and commercial interiors, space planning and turnkey execution.",
  logo_url: "",
  logo_alt: "Nabasrishti",
  logo_dark_url: "",
  show_logo_in_nav: true,
  comparison_cta_label: "See more transformations",
  transformations_label: "Before and after",
  transformations_heading: "Every room has a second life",
  transformations_intro:
    "Drag each slider to move between the drawing we started from and the room as it stands today.",
  preloader_enabled: true,
  preloader_duration_ms: 6000,
  whatsapp_enabled_fab: true,
  whatsapp_message:
    "Hello! I would like to discuss an interior design project.",
  comparison_before_url: "",
  comparison_after_url: "",
  comparison_before_label: "Concept",
  comparison_after_label: "Finished",
  not_found_heading: "This page has moved on.",
  not_found_body:
    "The page you were looking for is not here. The work, the studio and the contact details all still are.",
  nav_cta_label: "Enquire",
  cta_studio_label: "Book a free consultation",
  cta_projects_label: "Start your project",
  cta_services_label: "Discuss your requirement",
  cta_process_label: "Start with a free consultation",
  cta_testimonials_label: "Get your free consultation",
  cta_journal_label: "Talk to our designers",
  project_cta_prompt: "Planning something similar?",
  article_cta_prompt: "Thinking about your own space?",
  contact_label: "Get in touch",
  contact_heading: "Let's start your journey together.",
  contact_address: "South Kolkata, West Bengal, India",
  contact_hours: "",
  map_embed_url: "",
  map_link_url: "",
  show_social_in_footer: false,
};

const CARD_LAYOUTS: CmsProject["card_layout"][] = [
  "half",
  "narrow-left",
  "full",
  "offset-right",
  "wide-right",
];

/** Shown when the gallery cannot be read from the CMS. */
export const fallbackHomeSections: HomeSection[] = [
  ["hero", "Hero banner", true],
  ["promise", "Tagline band", false],
  ["studio", "Studio", false],
  ["projects", "Projects", false],
  ["services", "Services", false],
  ["comparison", "Before and after", false],
  ["process", "Process", false],
  ["testimonials", "Our stories", false],
  ["journal", "Journal", false],
  ["contact", "Contact and map", false],
  ["closing", "Closing banner", true],
].map(([key, label, locked], index) => ({
  id: key as string,
  key: key as string,
  label: label as string,
  note: "",
  position: index * 10,
  is_published: true,
  is_locked: locked as boolean,
}));

export const fallbackTransformations: Transformation[] = fallbackProjects
  .slice(0, 4)
  .map((project, index) => ({
    id: `${project.id}-pair`,
    title: project.title,
    caption: project.location,
    before_url: media.comparisonSketch,
    before_alt: `Line drawing of ${project.title}`,
    after_url: project.image,
    after_alt: `${project.title} as built`,
    position: (index + 1) * 10,
    is_published: true,
  }));

export const fallbackCmsProjects: CmsProject[] = fallbackProjects.map(
  (project, index) => ({
    id: project.id,
    slug: project.id,
    title: project.title,
    year: project.year,
    typology: project.typology,
    location: project.location,
    scope: [...project.scope],
    narrative: project.narrative,
    card_image_url: project.image,
    card_image_alt: project.alt,
    card_layout: CARD_LAYOUTS[index % CARD_LAYOUTS.length],
    card_ratio: project.width / project.height,
    detail_layout: "two-column",
    show_scope: true,
    show_cta: true,
    cta_label: "Start your project",
    accent_label: "",
    position: (index + 1) * 10,
    is_published: true,
    seo_title: "",
    seo_description: "",
    share_image_url: "",
    blocks: [
      {
        /* Every project page carries the drawing it grew from. */
        id: `${project.id}-compare`,
        project_id: project.id,
        type: "compare",
        position: 5,
        is_published: true,
        payload: {
          before_url: media.comparisonSketch,
          before_alt: `Line drawing of ${project.title}`,
          after_url: project.image,
          after_alt: `${project.title} as built`,
          before_label: "Concept",
          after_label: "Built",
          caption: "Drag to move between the drawing and the finished room.",
        },
      },
      {
        id: `${project.id}-gallery`,
        project_id: project.id,
        type: "gallery",
        position: 10,
        is_published: true,
        payload: { images: project.gallery.map((g) => ({ url: g.src, alt: g.alt })) },
      },
    ],
  }),
);

/* ---------------------------------------------------------------------
   Queries. Each falls back rather than throwing, so one bad table never
   takes the whole page down.
   ------------------------------------------------------------------ */

const STALE = 15_000;

async function fetchSettings(): Promise<SiteSettings> {
  if (!supabase) return fallbackSettings;
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return fallbackSettings;
  return { ...fallbackSettings, ...(data as Partial<SiteSettings>) };
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: fetchSettings,
    staleTime: STALE,
    placeholderData: fallbackSettings,
  });
}

async function fetchProjects(): Promise<CmsProject[]> {
  if (!supabase) return fallbackCmsProjects;
  const { data, error } = await supabase
    .from("projects")
    .select("*, blocks:project_blocks(*)")
    .order("position", { ascending: true });
  if (error || !data || data.length === 0) return fallbackCmsProjects;
  return (data as CmsProject[]).map((project) => ({
    ...project,
    blocks: [...(project.blocks ?? [])].sort((a, b) => a.position - b.position),
  }));
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: STALE,
    placeholderData: fallbackCmsProjects,
  });
}

function listQuery<T>(table: string, fallback: T[]) {
  return async (): Promise<T[]> => {
    if (!supabase) return fallback;
    const { data, error } = await supabase
      .from(table)
      .select("*")
      // id is the tiebreak: rows sharing a position would otherwise come
      // back in whatever order the database happened to produce.
      .order("position", { ascending: true })
      .order("id", { ascending: true });
    if (error || !data) return fallback;
    return data as T[];
  };
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: listQuery<Service>("services", []),
    staleTime: STALE,
    placeholderData: [],
  });
}

export function useHomeSections() {
  return useQuery({
    queryKey: ["home_sections"],
    queryFn: listQuery<HomeSection>("home_sections", fallbackHomeSections),
    staleTime: STALE,
    placeholderData: fallbackHomeSections,
  });
}

export function useTransformations() {
  return useQuery({
    queryKey: ["transformations"],
    queryFn: listQuery<Transformation>("transformations", fallbackTransformations),
    staleTime: STALE,
    placeholderData: fallbackTransformations,
  });
}

export function useProcessSteps() {
  return useQuery({
    queryKey: ["process_steps"],
    queryFn: listQuery<ProcessStep>("process_steps", []),
    staleTime: STALE,
    placeholderData: [],
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: listQuery<Testimonial>("testimonials", []),
    staleTime: STALE,
    placeholderData: [],
  });
}

async function fetchArticles(): Promise<Article[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("articles")
    .select("*, blocks:article_blocks(*)")
    .order("position", { ascending: true });
  if (error || !data) return [];
  return (data as Article[]).map((article) => ({
    ...article,
    blocks: [...(article.blocks ?? [])].sort((a, b) => a.position - b.position),
  }));
}

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: fetchArticles,
    staleTime: STALE,
    placeholderData: [],
  });
}

export function useNavLinks() {
  return useQuery({
    queryKey: ["nav_links"],
    queryFn: listQuery<NavLink>("nav_links", []),
    staleTime: STALE,
    placeholderData: [],
  });
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ["social_links"],
    queryFn: listQuery<SocialLink>("social_links", []),
    staleTime: STALE,
    placeholderData: [],
  });
}

export function useFooterLinks() {
  return useQuery({
    queryKey: ["footer_links"],
    queryFn: listQuery<FooterLink>("footer_links", []),
    staleTime: STALE,
    placeholderData: [],
  });
}
