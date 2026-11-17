import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { site as fallbackSite } from "@/data/site";
import { projects as fallbackProjects } from "@/data/projects";

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
};

export type BlockType =
  | "image"
  | "gallery"
  | "text"
  | "heading"
  | "quote"
  | "specs"
  | "split"
  | "spacer";

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
  blocks?: ProjectBlock[];
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
  title: string;
  date_label: string;
  date_value: string | null;
  image_url: string;
  image_alt: string;
  link_url: string;
  position: number;
  is_published: boolean;
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
};

const CARD_LAYOUTS: CmsProject["card_layout"][] = [
  "half",
  "narrow-left",
  "full",
  "offset-right",
  "wide-right",
];

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
    blocks: [
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

const STALE = 60_000;

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
      .order("position", { ascending: true });
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

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: listQuery<Article>("articles", []),
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
