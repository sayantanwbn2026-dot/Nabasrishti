import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { SettingsPanel } from "./SettingsPanel";
import { ProjectsPanel } from "./ProjectsPanel";
import { ArticlesPanel } from "./ArticlesPanel";
import { EnquiriesPanel } from "./EnquiriesPanel";
import { COLLECTIONS, CollectionPanel } from "./CollectionPanel";
import { SectionsPanel } from "./SectionsPanel";
import { confirmDiscard } from "./unsaved";
import { PanelBoundary } from "./PanelBoundary";
import { useNoIndex, usePageMeta } from "@/lib/usePageMeta";
import "./admin.css";

const SECTIONS = [
  { id: "enquiries", label: "Enquiries" },
  { id: "site", label: "Site content" },
  { id: "sections", label: "Page sections" },
  { id: "projects", label: "Projects" },
  { id: "articles", label: "Journal" },
  { id: "transformations", label: "Transformations" },
  { id: "pricing_packages", label: "Pricing" },
  { id: "sketches", label: "3D sketches" },
  { id: "services", label: "Services" },
  { id: "process_steps", label: "Process" },
  { id: "testimonials", label: "Testimonials" },
  { id: "nav_links", label: "Navigation" },
  { id: "footer_links", label: "Footer links" },
  { id: "social_links", label: "Social links" },
] as const;

/** Sections that have a panel written for them by hand. */
const KNOWN_PANELS = new Set([
  "enquiries",
  "site",
  "sections",
  "projects",
  "articles",
]);

type SectionId = (typeof SECTIONS)[number]["id"];

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) setError(signInError.message);
    setBusy(false);
  };

  return (
    <div className="alogin">
      <form className="alogin__card" onSubmit={submit}>
        <p className="af__label">Nabasrishti</p>
        <h1>Content manager</h1>
        <p className="amuted">Sign in with the studio account.</p>

        <label className="af">
          <span className="af__label">Email</span>
          <input
            className="af__input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label className="af">
          <span className="af__label">Password</span>
          <input
            className="af__input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error ? <p className="aerror">{error}</p> : null}

        <button type="submit" className="abtn alogin__submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <a className="alogin__back" href="/">
          Back to the website
        </a>
      </form>
    </div>
  );
}

export function AdminApp() {
  /* robots.txt asks crawlers not to come here; this tells the ones that
     fetch the page anyway not to index what they found. The CMS has
     nothing to gain from being in search results. */
  useNoIndex();
  usePageMeta({ title: "Content manager" });

  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState<SectionId>("enquiries");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="alogin">
        <div className="alogin__card">
          <h1>Not connected</h1>
          <p className="amuted">
            The content manager needs <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code>. Add them to the site’s
            environment variables and deploy again.
          </p>
        </div>
      </div>
    );
  }

  if (checking) return <div className="alogin"><p className="amuted">Loading…</p></div>;
  if (!session) return <LoginScreen />;

  const client = supabase;

  const current = SECTIONS.find((item) => item.id === section);

  return (
    <div className={`ashell ${navOpen ? "is-nav-open" : ""}`}>
      <aside className="anav">
        <div className="anav__brand">
          <span className="af__label">Nabasrishti</span>
          <strong>Content manager</strong>
        </div>

        <nav className="anav__list">
          {SECTIONS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`anav__item ${section === item.id ? "is-active" : ""}`}
              onClick={() => {
                if (item.id !== section && !confirmDiscard()) return;
                setSection(item.id);
                setNavOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="anav__foot">
          <a className="anav__link" href="/" target="_blank" rel="noreferrer">
            View website ↗
          </a>
          <p className="anav__user">{session.user.email}</p>
          <button
            type="button"
            className="abtn abtn--quiet"
            onClick={() => client.auth.signOut()}
          >
            Sign out
          </button>
        </div>
      </aside>

      <header className="atopbar">
        <button
          type="button"
          className="abtn abtn--ghost"
          onClick={() => setNavOpen((open) => !open)}
        >
          {navOpen ? "Close" : "Menu"}
        </button>
        <span>{current?.label}</span>
      </header>

      <main className="amain">
        <PanelBoundary resetKey={section}>
          {section === "enquiries" ? <EnquiriesPanel /> : null}
          {section === "site" ? <SettingsPanel /> : null}
          {section === "sections" ? <SectionsPanel /> : null}
          {section === "projects" ? <ProjectsPanel /> : null}
          {section === "articles" ? <ArticlesPanel /> : null}
          {COLLECTIONS[section] ? (
            <CollectionPanel spec={COLLECTIONS[section]} />
          ) : null}

          {/* A section in the sidebar with no panel behind it would simply
              draw nothing, which reads as a broken page. Say so instead. */}
          {!KNOWN_PANELS.has(section) && !COLLECTIONS[section] ? (
            <div className="apanel">
              <header className="apanel__head">
                <div>
                  <h1>{current?.label ?? "Not available"}</h1>
                  <p className="amuted">
                    This section has no editor yet. Pick another on the left.
                  </p>
                </div>
              </header>
            </div>
          ) : null}
        </PanelBoundary>
      </main>
    </div>
  );
}
