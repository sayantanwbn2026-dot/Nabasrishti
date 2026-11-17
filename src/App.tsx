import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  Parallax,
  ParallaxImage,
  Reveal,
  RevealItem,
  Stagger,
  TextReveal,
} from "@/components/motion";
import { heroItem, heroRail, heroStagger } from "@/lib/motion";

import { media } from "@/data/media";
import {
  useArticles,
  useFooterLinks,
  useProcessSteps,
  useProjects,
  useServices,
  useNavLinks,
  useSiteSettings,
  useSocialLinks,
  useTestimonials,
  type Article as CmsArticle,
  type CmsProject,
  type SiteSettings,
  type SocialLink,
  type FooterLink as FooterLinkRow,
  fallbackSettings,
} from "@/lib/content";

import { EnquiryModal } from "@/components/EnquiryModal";
import { ThankYouPage } from "@/components/ThankYouPage";
/* The CMS is loaded only when /admin is opened: visitors to the public
   site should never download the editor or the Supabase auth code. */
const AdminApp = lazy(() =>
  import("@/admin/AdminApp").then((module) => ({ default: module.AdminApp })),
);
import { ProjectModal } from "@/components/ProjectModal";
import { ArticleModal } from "@/components/ArticleModal";
import { Preloader, SocialLinks, WhatsAppFab } from "@/components/SiteChrome";
import { useDelayedEnquiry } from "@/hooks/useDelayedEnquiry";


const navigation = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "Studio", href: "#studio" },
  { label: "Blogs", href: "#blog" },
];

const services = [
  {
    title: "Residential Interior Design",
    description:
      "For homes that need more than a finished look. We develop interiors around the people who use them, balancing spatial needs, practical considerations, and personal preferences.",
    image: media.serviceResidential,
    alt: "Warm contemporary residential interior with considered finishes",
  },
  {
    title: "Commercial Interiors",
    description:
      "Purposeful environments that express your brand identity, enhance functionality, and create lasting impressions.",
    image: media.serviceCommercial,
    alt: "A calm, material-led commercial interior",
  },
  {
    title: "Space Planning and Layouts",
    description:
      "A room can feel entirely different when its layout works better. We help establish how spaces connect, where functions belong, and how movement through the home can become more natural.",
    image: media.serviceLayout,
    alt: "Architectural interior with a thoughtful open layout",
  },
  {
    title: "Material and Finish Selection",
    description:
      "From flooring and surfaces to colours, textures, and fixtures, we help bring consistency to the many decisions that shape an interior.",
    image: media.serviceMaterial,
    alt: "Quietly layered natural materials and finishes",
  },
  {
    title: "Furniture and Styling",
    description:
      "We consider the pieces that make a space usable and give it character, from essential furniture to lighting, accessories, and finishing details.",
    image: media.serviceStyling,
    alt: "Warmly styled living space with natural textures",
  },
];


const testimonials = [
  {
    name: "Emily John",
    portrait: media.portraitEmily,
    image: media.testimonialEmily,
    imageAlt: "Contemporary kitchen with walnut cabinetry, a pale island and dark stools",
    quote:
      "From the very beginning, the team understood our vision and transformed it into a space that feels truly personal. Every detail was thoughtfully considered, and the result is a beautiful balance of comfort, functionality, and timeless design.",
  },
  {
    name: "Henry Caldwell",
    portrait: media.portraitHenry,
    image: media.testimonialHenry,
    imageAlt: "Modern residence set within lush tropical greenery",
    quote:
      "What impressed us most was their attention to detail and the way they brought every element together. The entire process felt collaborative and well-organised, and the final space exceeded our expectations.",
  },
  {
    name: "Charlotte Bennett",
    portrait: media.portraitCharlotte,
    image: media.testimonialCharlotte,
    imageAlt: "Calm contemporary bedroom with natural timber and soft linen",
    quote:
      "We wanted a space that felt modern, welcoming, and practical. The team translated our ideas into a cohesive design that reflects our vision perfectly. The result feels refined, thoughtfully planned, and uniquely ours.",
  },
];

const articles = [
  {
    title: "The Art of Minimalist Interior Design",
    date: "Jun 4, 2026.",
    dateTime: "2026-06-04",
    image: media.journalOne,
    alt: "Sculptural, minimal interior with a considered material palette",
  },
  {
    title: "Sustainable Design: Building a Greener Future",
    date: "Jun 20, 2026.",
    dateTime: "2026-06-20",
    image: media.journalTwo,
    alt: "Bright living room with a blue sofa and natural light",
  },
  {
    title: "Modern Architecture: Balancing Form and Function",
    date: "Jun 10, 2026.",
    dateTime: "2026-06-10",
    image: media.journalThree,
    alt: "Sculptural living room with expressive artwork and warm concrete",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Discovery",
    description:
      "Every project begins with listening. We explore your vision, lifestyle, site, and aspirations to uncover the ideas that will shape the space.",
  },
  {
    number: "02",
    title: "Define",
    description:
      "We translate insights into a cohesive design direction, defining the spatial flow, material palette, and architectural language.",
  },
  {
    number: "03",
    title: "Develope",
    description:
      "We refine the design through drawings, materials, and considered details, bringing the direction into focus before work begins.",
  },
  {
    number: "04",
    title: "Deliver",
    description:
      "We work through each stage of execution with care and collaboration, ensuring the finished space reflects the vision we created together.",
  },
];

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`arrow-icon arrow-icon-${direction}`}
    >
      <path d="M14.5 5.5 8 12l6.5 6.5" />
      <path d="M8.5 12H20" />
    </svg>
  );
}

function MenuLinks({
  active,
  links,
  ctaLabel,
  onNavigate,
  onEnquire,
}: {
  active: string;
  links: { label: string; href: string }[];
  ctaLabel: string;
  onNavigate?: () => void;
  onEnquire?: () => void;
}) {
  return (
    <>
      {links.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="navigation-link"
          aria-current={active === item.label ? "page" : undefined}
          onClick={onNavigate}
        >
          {item.label}
        </a>
      ))}
      {/* On phones the header button is hidden, so the sheet carries the
          same action rather than a link to a different place. */}
      <button
        type="button"
        className="navigation-link navigation-contact-mobile"
        onClick={() => {
          onNavigate?.();
          onEnquire?.();
        }}
      >
        {ctaLabel}
      </button>
    </>
  );
}

function SiteNavigation({
  onEnquire,
  brand,
  logo,
  links,
  ctaLabel,
}: {
  onEnquire: () => void;
  brand: string;
  logo?: string;
  links: { label: string; href: string }[];
  ctaLabel: string;
}) {
  const lenis = useLenis();
  const [tone, setTone] = useState<"dark" | "light">("dark");
  const [active, setActive] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  /* The bar carries no surface over the hero; it fades one in once the
     visitor leaves it, and fades back out on return. */
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const updateNavigation = () => {
      const line = 34;
      const lightSections = ["studio", "projects"];
      const isOverLight = lightSections.some((id) => {
        const section = document.getElementById(id);
        if (!section) return false;
        const bounds = section.getBoundingClientRect();
        return bounds.top <= line && bounds.bottom > line;
      });

      setTone(isOverLight ? "light" : "dark");

      // Hero owns the top of the page: no bar surface while any of it is
      // still behind the header.
      const hero = document.getElementById("home");
      const heroBottom = hero
        ? hero.getBoundingClientRect().bottom
        : window.innerHeight;
      setLifted(heroBottom <= line);

      const marker = window.scrollY + 120;
      const sectionOrder = [
        { id: "home", label: "Home" },
        { id: "studio", label: "Studio" },
        { id: "projects", label: "Projects" },
        { id: "services", label: "Studio" },
        { id: "process", label: "Studio" },
        { id: "testimonials", label: "Studio" },
        { id: "blog", label: "Blogs" },
        { id: "contact", label: "Contact" },
      ];
      let nextActive = "Home";
      sectionOrder.forEach(({ id, label }) => {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= marker) nextActive = label;
      });
      setActive(nextActive);
    };

    updateNavigation();
    window.addEventListener("scroll", updateNavigation, { passive: true });
    window.addEventListener("resize", updateNavigation);
    return () => {
      window.removeEventListener("scroll", updateNavigation);
      window.removeEventListener("resize", updateNavigation);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    // body overflow alone will not hold Lenis, so the instance is paused too.
    document.body.style.overflow = "hidden";
    lenis?.stop();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen, lenis]);

  return (
    <>
      <header
        className={`site-header site-header-${tone} ${
          lifted ? "is-lifted" : ""
        } ${menuOpen ? "is-menu-open" : ""}`}
      >
        <div className="site-header__inner">
          <a className="site-brand" href="#home" aria-label={`${brand} home`}>
            {logo ? (
              <img className="site-brand__logo" src={logo} alt="" />
            ) : null}
            <span className="site-brand__name">{brand}</span>
          </a>
          <nav className="desktop-navigation" aria-label="Main navigation">
            <MenuLinks
              active={active}
              links={links}
              ctaLabel={ctaLabel}
              onEnquire={onEnquire}
            />
          </nav>
          <button
            type="button"
            className="header-contact navigation-link"
            onClick={onEnquire}
          >
            {ctaLabel}
          </button>
          <button
            className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      {menuOpen && (
        <div
          className={`mobile-navigation mobile-navigation-${tone}`}
          id="mobile-navigation"
        >
          <nav aria-label="Mobile navigation">
            <MenuLinks
              active={active}
              links={links}
              ctaLabel={ctaLabel}
              onEnquire={onEnquire}
              onNavigate={() => setMenuOpen(false)}
            />
          </nav>
        </div>
      )}
    </>
  );
}

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const node = countRef.current;
    if (!node) return;
    const finish = () => {
      if (hasRun.current) return;
      hasRun.current = true;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) {
        setCount(value);
        return;
      }

      const start = performance.now();
      const duration = 1050;
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(value * eased));
        if (progress < 1) window.requestAnimationFrame(animate);
      };
      window.requestAnimationFrame(animate);
    };

    if (!("IntersectionObserver" in window)) {
      finish();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          finish();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={countRef} aria-hidden="true">
      {count}
      {suffix}
    </span>
  );
}

function ProjectFigure({
  project,
  onOpen,
}: {
  project: CmsProject;
  onOpen: (project: CmsProject) => void;
}) {
  return (
    <Reveal
      as="figure"
      className={`project-figure project-card--${project.card_layout}`}
      preset="rise"
    >
      <button
        type="button"
        className="project-figure__link"
        onClick={() => onOpen(project)}
        aria-label={`View ${project.title} — ${project.typology} in ${project.location}`}
      >
        <span
          className="project-figure__image"
          style={{ aspectRatio: String(project.card_ratio || 1.33) }}
        >
          <ParallaxImage
            strength={0.05}
            hoverScale={1.025}
            src={project.card_image_url}
            alt={project.card_image_alt}
            loading="lazy"
            decoding="async"
          />
        </span>
        <figcaption className="project-caption">
          <span>{project.title}</span>
          <span>{project.accent_label || project.typology}</span>
        </figcaption>
      </button>
    </Reveal>
  );
}

function ServicesAccordion({ items }: { items: typeof services }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="service-list">
      {items.map((service, index) => {
        const isOpen = openIndex === index;
        const panelId = `service-panel-${index}`;
        const buttonId = `service-button-${index}`;

        return (
          <div className={`service-item ${isOpen ? "is-open" : ""}`} key={service.title}>
            <button
              className="service-item__trigger"
              type="button"
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span>{service.title}</span>
              <span className="service-item__symbol" aria-hidden="true" />
            </button>
            <div
              className="service-item__disclosure"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
            >
              <div className="service-item__body">
                <p>{service.description}</p>
                <img
                  src={service.image}
                  alt={service.alt}
                  width="1200"
                  height="800"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ImageComparison({
  beforeUrl,
  afterUrl,
}: {
  beforeUrl: string;
  afterUrl: string;
}) {
  const [position, setPosition] = useState(53);
  const isDragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const setFromClientX = (clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const bounds = frame.getBoundingClientRect();
    const next = ((clientX - bounds.left) / bounds.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  };

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    isDragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  };

  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (isDragging.current) setFromClientX(event.clientX);
  };

  const stopDrag = (event: PointerEvent<HTMLButtonElement>) => {
    isDragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 5 : 1;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((current) => Math.max(0, current - step));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((current) => Math.min(100, current + step));
    } else if (event.key === "Home") {
      event.preventDefault();
      setPosition(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPosition(100);
    }
  };

  return (
    <div className="comparison-frame" ref={frameRef}>
      <img
        className="comparison-frame__image"
        src={afterUrl || media.hero}
        alt="Finished interior"
        width="2150"
        height="1229"
        loading="lazy"
        decoding="async"
      />
      <img
        className="comparison-frame__image comparison-frame__sketch"
        src={beforeUrl || media.comparisonSketch}
        alt=""
        aria-hidden="true"
        width="1600"
        height="914"
        loading="lazy"
        decoding="async"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />
      <div
        className="comparison-frame__divider"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      />
      <button
        className="comparison-frame__handle"
        type="button"
        role="slider"
        aria-label="Adjust sketch and finished interior comparison"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)} percent sketch visible`}
        style={{ left: `${position}%` }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onKeyDown={handleKeyDown}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
          <path d="m8 5-5 5 5 5M12 5l5 5-5 5" />
        </svg>
      </button>
    </div>
  );
}

function TestimonialsSection({
  onEnquire,
  items,
  label,
  heading,
  aside,
  ctaLabel,
}: {
  onEnquire: (context: string) => void;
  items: typeof testimonials;
  label: string;
  heading: string;
  aside: string;
  ctaLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonial = items[Math.min(activeIndex, items.length - 1)];

  const goTo = (direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + items.length) % items.length);
  };

  if (!testimonial) return null;

  return (
    <section className="testimonial-section dark-section" id="testimonials">
      <div className="page-shell">
        <Reveal className="section-heading testimonial-heading">
          <div>
            <p className="section-label">{label}</p>
            <h2>{heading}</h2>
          </div>
          <p className="section-aside">{aside}</p>
        </Reveal>
        <Reveal className="testimonial-layout" delay={0.08} aria-live="polite">
          <div className="testimonial-copy">
            <div className="testimonial-author">
              <img
                src={testimonial.portrait}
                alt=""
                width="64"
                height="64"
                loading="lazy"
                decoding="async"
              />
              <h3>{testimonial.name}</h3>
            </div>
            <p className="testimonial-quote">&ldquo;{testimonial.quote}&rdquo;</p>
            <div className="testimonial-controls">
              <button
                type="button"
                className="round-control"
                aria-label="Previous testimonial"
                onClick={() => goTo(-1)}
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                type="button"
                className="round-control"
                aria-label="Next testimonial"
                onClick={() => goTo(1)}
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          </div>
          <div className="testimonial-image-wrap" key={testimonial.image}>
            <ParallaxImage
              strength={0.05}
              src={testimonial.image}
              alt={testimonial.imageAlt}
              width="2150"
              height="1229"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Reveal>
        <SectionCta
          context="Testimonials section"
          label={ctaLabel}
          variant="light"
          onEnquire={onEnquire}
        />
      </div>
    </section>
  );
}

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
    </a>
  );
}

function SiteFooter({
  settings,
  links,
  socials,
}: {
  settings: SiteSettings;
  links: FooterLinkRow[];
  socials: SocialLink[];
}) {
  // Group into columns, then order the columns by their first link, so
  // moving a link to the top of the list in the CMS moves its column too.
  const columns = links.reduce<Record<string, FooterLinkRow[]>>((acc, link) => {
    (acc[link.column_label] ??= []).push(link);
    return acc;
  }, {});
  const columnNames = Object.keys(columns).sort((a, b) => {
    const first = (rows: FooterLinkRow[]) =>
      Math.min(...rows.map((row) => row.position));
    return first(columns[a]) - first(columns[b]) || a.localeCompare(b);
  });

  return (
    <footer className="site-footer dark-section">
      <div className="page-shell">
        <div className="footer-top">
          <div className="footer-intro">
            <a href="#home" className="footer-brand">
              {settings.name}
            </a>
            <p>{settings.footer_intro}</p>
            <SocialLinks links={socials} />
          </div>
          <div className="footer-link-columns">
            {columnNames.map((name) => (
              <div className="footer-link-column" key={name}>
                <p className="footer-column-label">{name}</p>
                {columns[name].map((link) => (
                  <FooterLink
                    href={link.href}
                    external={link.is_external}
                    key={link.id}
                  >
                    {link.label}
                  </FooterLink>
                ))}
              </div>
            ))}
          </div>
        </div>
        <Parallax distance={70} direction={-1}>
          <Reveal className="footer-wordmark" aria-label={settings.name} delay={0.05}>
            {settings.name}
          </Reveal>
        </Parallax>
        <div className="footer-bottom">
          <p>{settings.footer_note}</p>
          <p>{settings.email}</p>
        </div>
      </div>
    </footer>
  );
}

function NotFoundPage() {
  const { data: settings = fallbackSettings } = useSiteSettings();
  return (
    <main className="not-found-page">
      <a href="/" className="site-brand">
        {settings.logo_url ? (
          <img className="site-brand__logo" src={settings.logo_url} alt={settings.name} />
        ) : (
          settings.name
        )}
      </a>
      <p className="section-label">404</p>
      <h1>{settings.not_found_heading}</h1>
      <p>{settings.not_found_body}</p>
      <a href="/" className="button button-light">
        Back to {settings.name}
      </a>
    </main>
  );
}

/**
 * Every section CTA routes to the one pop-up enquiry form, per the Ads
 * audit ("all buttons redirect users to a single pop-up lead form").
 */
function SectionCta({
  label = "Get free consultation",
  context,
  variant = "dark",
  onEnquire,
}: {
  label?: string;
  context: string;
  variant?: "dark" | "light" | "outline";
  onEnquire: (context: string) => void;
}) {
  return (
    <Reveal className="section-cta">
      <button
        type="button"
        className={`button button-${variant}`}
        onClick={() => onEnquire(context)}
      >
        {label}
      </button>
    </Reveal>
  );
}

/**
 * Ads audit: the single enquiry form should appear as a pop-up 2–3 seconds
 * after the page loads.
 */
const ENQUIRY_DELAY_MS = 3000;

function HomePage() {
  const { data: settings = fallbackSettings } = useSiteSettings();
  const { data: cmsProjects = [] } = useProjects();
  const { data: cmsServices = [] } = useServices();
  const { data: cmsSteps = [] } = useProcessSteps();
  const { data: cmsTestimonials = [] } = useTestimonials();
  const { data: cmsArticles = [] } = useArticles();
  const { data: cmsFooterLinks = [] } = useFooterLinks();
  const { data: cmsSocials = [] } = useSocialLinks();
  const { data: cmsNavLinks = [] } = useNavLinks();
  const navItems = cmsNavLinks.length
    ? cmsNavLinks
        .filter((link) => link.is_published)
        .map((link) => ({ label: link.label, href: link.href }))
    : navigation;

  /* Each list falls back to the built-in content, so an empty table or a
     missing environment variable degrades to the shipped design rather
     than an empty section. */
  const projectList = cmsProjects.filter((project) => project.is_published);
  const serviceItems = cmsServices.length
    ? cmsServices.map((item) => ({
        title: item.title,
        description: item.body,
        image: item.image_url,
        alt: item.image_alt,
      }))
    : services;
  const stepItems = cmsSteps.length
    ? cmsSteps.map((item) => ({
        number: item.number,
        title: item.title,
        description: item.description,
      }))
    : processSteps;
  const testimonialItems = cmsTestimonials.length
    ? cmsTestimonials.map((item) => ({
        name: item.name,
        portrait: item.portrait_url,
        image: item.image_url,
        imageAlt: item.image_alt,
        quote: item.quote,
      }))
    : testimonials;
  const articleItems = cmsArticles.length
    ? cmsArticles
        .filter((item) => item.is_published)
        .map((item) => ({
          title: item.title,
          date: item.date_label,
          dateTime: item.date_value ?? "",
          image: item.image_url,
          alt: item.image_alt,
          source: item as CmsArticle | null,
        }))
    : articles.map((item) => ({ ...item, source: null }));

  const [activeProject, setActiveProject] = useState<CmsProject | null>(null);
  const [activeArticle, setActiveArticle] = useState<CmsArticle | null>(null);
  const [enquiryContext, setEnquiryContext] = useState<string | undefined>();
  // The timed prompt holds off while a project is open — two stacked
  // dialogs would be the worst version of this pattern.
  const [enquiryOpen, setEnquiryOpen] = useDelayedEnquiry(
    settings.enquiry_delay_ms || ENQUIRY_DELAY_MS,
    activeProject !== null || activeArticle !== null,
  );

  const openEnquiry = (context?: string) => {
    setEnquiryContext(context);
    setEnquiryOpen(true);
  };

  return (
    <>
      <SiteNavigation
        onEnquire={() => openEnquiry("Header button")}
        brand={settings.name}
        logo={settings.show_logo_in_nav ? settings.logo_url : ""}
        links={navItems}
        ctaLabel={settings.nav_cta_label}
      />
      <main>
        <section className="hero" id="home" aria-label="Nabasrishti Interior Design Studio">
          <ParallaxImage
            className="hero__image"
            strength={0.06}
            src={settings.hero_image_url || media.hero}
            alt={settings.hero_image_alt}
            width="2150"
            height="1229"
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero__shade" aria-hidden="true" />
          {/* Fine grain stops the gradient wash from banding on large
              screens and gives the photograph a little tooth. */}
          <div className="hero__grain" aria-hidden="true" />

          <Parallax className="hero__parallax" distance={90}>
            <motion.div
              className="hero__content"
              variants={heroStagger}
              initial="hidden"
              animate="show"
            >
              {/* The h1 carries the full keyword phrase the Ads audit asked
                  for; the wordmark is simply its first line. */}
              <h1>
                <motion.span className="hero__wordmark" variants={heroItem}>
                  {settings.name}
                </motion.span>
                <motion.span className="hero__headline" variants={heroItem}>
                  {settings.headline}
                </motion.span>
              </h1>
              <motion.div className="hero__actions" variants={heroItem}>
                <button
                  type="button"
                  className="button button-light hero__cta-primary"
                  onClick={() => openEnquiry("Hero banner")}
                >
                  {settings.cta_primary_label}
                </button>
                <a className="hero__cta-call" href={`tel:+${settings.phone_digits}`}>
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <path d="M5.2 2.5 6.6 5 5.3 6.4a8 8 0 0 0 4.3 4.3L11 9.4l2.5 1.4v2.4c0 .4-.3.8-.8.8A10.6 10.6 0 0 1 2.4 3.3c0-.5.4-.8.8-.8h2z" />
                  </svg>
                  <span>{settings.phone}</span>
                </a>
              </motion.div>
            </motion.div>
          </Parallax>

          {/* Baseline rail: services on the left, a scroll cue on the right,
              sharing one hairline. Frames the composition instead of
              floating a second centred block under the title. */}
          <motion.div
            className="hero__rail"
            variants={heroRail}
            initial="hidden"
            animate="show"
          >
            <div className="hero__rail-inner">
              <ul className="hero__highlights" aria-label="Services">
                {settings.service_highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a className="hero__scroll" href="#studio">
                <span>Scroll</span>
                <span className="hero__scroll-track" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </section>

        {/* The audit's supporting tagline, moved out of the banner so the
            hero can breathe. The USPs it also asks for are the studio
            stats immediately below. */}
        <section className="promise-band light-section" aria-label="Our promise">
          <div className="page-shell">
            <Reveal as="p" className="promise-band__text">
              {settings.tagline}
            </Reveal>
          </div>
        </section>

        <section className="studio-section light-section" id="studio">
          <div className="page-shell studio-layout">
            <Reveal className="studio-image" preset="image">
              <ParallaxImage
                strength={0.055}
                src={settings.studio_image_url || media.studio}
                alt={settings.studio_image_alt}
                width="1440"
                height="1440"
                loading="lazy"
                decoding="async"
              />
            </Reveal>
            <div className="studio-copy">
              <TextReveal
                className="studio-statement"
                text={settings.studio_statement}
              />
              <Stagger
                className="studio-stats"
                stagger={0.1}
                aria-label="Studio statistics"
              >
                {settings.stats.map((stat) => (
                  <RevealItem className="studio-stat" key={stat.label}>
                    <p className="studio-stat__value">
                      <CountUp value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="studio-stat__label">{stat.label}</p>
                  </RevealItem>
                ))}
              </Stagger>
              <SectionCta
                context="Studio section"
                label={settings.cta_studio_label}
                onEnquire={openEnquiry}
              />
            </div>
          </div>
        </section>

        <section className="projects-section light-section" id="projects">
          <div className="page-shell">
            <Reveal className="section-heading projects-heading">
              <div>
                <p className="section-label">{settings.projects_label}</p>
                <h2>{settings.projects_heading}</h2>
              </div>
              <button
                type="button"
                className="button button-dark"
                onClick={() => openEnquiry("Projects section")}
              >
                {settings.cta_projects_label}
              </button>
            </Reveal>
            <div className="projects-gallery" id="project-list">
              {projectList.map((project) => (
                <ProjectFigure
                  project={project}
                  onOpen={setActiveProject}
                  key={project.id}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="services-section dark-section" id="services">
          <div className="page-shell">
            <Reveal className="section-heading section-heading-stacked">
              <p className="section-label">{settings.services_label}</p>
              <h2>{settings.services_heading}</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <ServicesAccordion items={serviceItems} />
            </Reveal>
            <SectionCta
              context="Services section"
              label={settings.cta_services_label}
              variant="light"
              onEnquire={openEnquiry}
            />
          </div>
        </section>

        <section className="comparison-section dark-section">
          <div className="page-shell">
            <Reveal as="h2" className="centered-heading">
              {settings.comparison_heading}
            </Reveal>
            <Reveal preset="image" delay={0.08}>
              <ImageComparison
                beforeUrl={settings.comparison_before_url}
                afterUrl={settings.comparison_after_url}
              />
            </Reveal>
          </div>
        </section>

        <section className="process-section dark-section" id="process">
          <div className="page-shell">
            <Reveal className="centered-section-heading">
              <p className="section-label">{settings.process_label}</p>
              <h2>{settings.process_heading}</h2>
            </Reveal>
            <Stagger className="process-list" stagger={0.1}>
              {stepItems.map((step) => (
                <RevealItem
                  as="article"
                  className="process-card"
                  key={step.number}
                >
                  <p className="process-card__number">{step.number}</p>
                  <div className="process-card__content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </RevealItem>
              ))}
            </Stagger>
            <SectionCta
              context="Process section"
              label={settings.cta_process_label}
              variant="light"
              onEnquire={openEnquiry}
            />
          </div>
        </section>

        <TestimonialsSection
          onEnquire={openEnquiry}
          items={testimonialItems}
          label={settings.testimonials_label}
          heading={settings.testimonials_heading}
          aside={settings.testimonials_aside}
          ctaLabel={settings.cta_testimonials_label}
        />

        <section className="journal-section dark-section" id="blog">
          <div className="page-shell">
            <Reveal className="section-heading journal-heading">
              <div>
                <p className="section-label">{settings.journal_label}</p>
                <h2>{settings.journal_heading}</h2>
              </div>
              <p className="section-aside">{settings.journal_aside}</p>
            </Reveal>
            <Stagger className="article-grid" stagger={0.09}>
              {articleItems.map((article) => (
                <RevealItem as="article" className="article" key={article.title}>
                  <button
                    type="button"
                    className="article__link"
                    onClick={() => setActiveArticle(article.source)}
                    aria-label={`Read ${article.title}`}
                  >
                  <div className="article__image">
                    <ParallaxImage
                      strength={0.045}
                      hoverScale={1.025}
                      src={article.image}
                      alt={article.alt}
                      width="1200"
                      height="1500"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <time dateTime={article.dateTime}>{article.date}</time>
                  <h3>{article.title}</h3>
                  </button>
                </RevealItem>
              ))}
            </Stagger>
            <SectionCta
              context="Journal section"
              label={settings.cta_journal_label}
              variant="light"
              onEnquire={openEnquiry}
            />
          </div>
        </section>

        <section className="contact-banner" id="contact">
          <ParallaxImage
            strength={0.08}
            src={settings.closing_image_url || media.closing}
            alt={settings.closing_image_alt}
            width="2200"
            height="940"
            loading="lazy"
            decoding="async"
          />
          <div className="contact-banner__shade" aria-hidden="true" />
          <Reveal className="contact-banner__content">
            <h2>{settings.closing_heading}</h2>
            <p>{settings.closing_body}</p>
            <div className="contact-banner__actions">
              <button
                type="button"
                className="button button-light"
                onClick={() => openEnquiry("Closing banner")}
              >
                Get free consultation
              </button>
              <a className="button button-outline" href={`tel:+${settings.phone_digits}`}>
                Call {settings.phone}
              </a>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter settings={settings} links={cmsFooterLinks} socials={cmsSocials} />

      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onEnquire={(project) => {
          setActiveProject(null);
          openEnquiry(project.title);
        }}
      />
      <ArticleModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
        onEnquire={(article) => {
          setActiveArticle(null);
          openEnquiry(`Journal — ${article.title}`);
        }}
      />
      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        context={enquiryContext}
      />
      <WhatsAppFab settings={settings} />
      <Preloader settings={settings} />
    </>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  // The content manager. Its styles load with it, not on the public site.
  if (path === "/admin" || path.startsWith("/admin/")) {
    return (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    );
  }
  // Google Ads counts a conversion when this URL loads — see ThankYouPage.
  if (path === "/thank-you") return <ThankYouPage />;
  if (path === "/" || path === "/index.html") return <HomePage />;

  /* Vercel rewrites every unmatched path to index.html, so anything that
     reaches here is a URL the site does not have. */
  return <NotFoundPage />;
}
