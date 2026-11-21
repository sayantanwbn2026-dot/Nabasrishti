import { useEffect, useState } from "react";
import { useSaveRow, useSettingsRow } from "./api";
import {
  ImageField,
  NumberField,
  Toggle,
  RecordList,
  StringList,
  TextArea,
  TextField,
} from "./Fields";
import { useSaveShortcut, useUnsavedGuard } from "./unsaved";
import type { SiteSettings } from "@/lib/content";

type Row = SiteSettings & { id: number };

const GROUPS = [
  { id: "identity", label: "Studio & contact" },
  { id: "brand", label: "Logo & chrome" },
  { id: "hero", label: "Hero banner" },
  { id: "studio", label: "Studio section" },
  { id: "sections", label: "Section headings" },
  { id: "contact", label: "Contact & map" },
  { id: "closing", label: "Closing & footer" },
  { id: "enquiry", label: "Enquiry form" },
  { id: "seo", label: "SEO" },
] as const;

export function SettingsPanel() {
  const { data, isLoading, error } = useSettingsRow<Row>();
  const save = useSaveRow("site_settings");
  const [draft, setDraft] = useState<Row | null>(null);
  const [group, setGroup] = useState<(typeof GROUPS)[number]["id"]>("identity");

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  const dirty = Boolean(draft) && JSON.stringify(draft) !== JSON.stringify(data);

  const commit = () => {
    if (draft) save.mutate(draft as unknown as Record<string, unknown>);
  };

  /* Above the early returns: a hook that only runs once the data has
     arrived changes the hook count between renders, and React takes the
     whole page down rather than re-rendering. */
  useUnsavedGuard(dirty);
  useSaveShortcut(dirty && !save.isPending, commit);

  if (isLoading) return <p className="amuted">Loading…</p>;
  if (error) return <p className="aerror">{(error as Error).message}</p>;
  if (!draft) return null;

  const set = <K extends keyof Row>(key: K, value: Row[K]) =>
    setDraft({ ...draft, [key]: value });

  return (
    <div className="apanel">
      <header className="apanel__head">
        <div>
          <h1>Site content</h1>
          <p className="amuted">
            Everything that appears once on the website.
          </p>
        </div>
        <button
          type="button"
          className="abtn"
          disabled={!dirty || save.isPending}
          onClick={commit}
        >
          {save.isPending ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
      </header>

      <nav className="atabs">
        {GROUPS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`atab ${group === item.id ? "is-active" : ""}`}
            onClick={() => setGroup(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {save.isError ? (
        <p className="aerror">{(save.error as Error).message}</p>
      ) : null}

      <div className="aform">
        {group === "identity" && (
          <>
            <TextField label="Studio name" value={draft.name} onChange={(v) => set("name", v)} />
            <TextField
              label="Phone (displayed)"
              hint="Shown on the hero, header and thank-you page."
              value={draft.phone}
              onChange={(v) => set("phone", v)}
            />
            <TextField
              label="Phone (digits only)"
              /* These two fields drifted apart once: the number on screen
                 was the studio's and the number being dialled was still
                 the placeholder, so every call went nowhere. Say so here
                 rather than leaving it to be noticed. */
              hint={
                draft.phone_digits &&
                draft.phone.replace(/\D/g, "") !== draft.phone_digits
                  ? `This does not match the number above (${draft.phone.replace(/\D/g, "")}). The call and WhatsApp buttons use THIS field, so they will dial what is written here.`
                  : "Country code and number, no spaces. The call and WhatsApp buttons use this."
              }
              value={draft.phone_digits}
              onChange={(v) => set("phone_digits", v)}
              mono
            />
            <TextField label="Email" value={draft.email} onChange={(v) => set("email", v)} />
            <TextField label="Location" value={draft.location} onChange={(v) => set("location", v)} />
          </>
        )}

        {group === "brand" && (
          <>
            <ImageField
              label="Logo"
              hint="Shown in the navigation bar. Leave empty to show the studio name as text."
              value={draft.logo_url}
              onChange={(v) => set("logo_url", v)}
            />
            <TextField
              label="Logo description"
              value={draft.logo_alt}
              onChange={(v) => set("logo_alt", v)}
            />
            <ImageField
              label="Loading screen logo"
              hint="Shown on the cream loading screen, where the full lockup with its name and tagline reads well. Falls back to the logo above."
              value={draft.logo_dark_url}
              onChange={(v) => set("logo_dark_url", v)}
            />
            <Toggle
              label="Show the logo in the navigation"
              value={draft.show_logo_in_nav}
              onChange={(v) => set("show_logo_in_nav", v)}
            />
            <Toggle
              label="Show the loading screen"
              hint="The logo shown briefly while the site loads."
              value={draft.preloader_enabled}
              onChange={(v) => set("preloader_enabled", v)}
            />
            <NumberField
              label="Loading screen length (milliseconds)"
              hint="How long the logo is held before the site appears. 3000 = 3 seconds. The enquiry form's own delay starts counting when this ends. Set the switch above off to skip it entirely."
              value={draft.preloader_duration_ms}
              step={500}
              onChange={(v) => set("preloader_duration_ms", v)}
            />
            <Toggle
              label="Show the WhatsApp button"
              hint="The floating green button at the bottom right."
              value={draft.whatsapp_enabled_fab}
              onChange={(v) => set("whatsapp_enabled_fab", v)}
            />
            <TextArea
              label="WhatsApp opening message"
              hint="Pre-filled in WhatsApp when someone taps the button."
              rows={2}
              value={draft.whatsapp_message}
              onChange={(v) => set("whatsapp_message", v)}
            />
            <ImageField
              label="Before image"
              hint="The left side of the before/after slider."
              value={draft.comparison_before_url}
              onChange={(v) => set("comparison_before_url", v)}
            />
            <ImageField
              label="After image"
              value={draft.comparison_after_url}
              onChange={(v) => set("comparison_after_url", v)}
            />
            <TextField
              label="Page-not-found heading"
              value={draft.not_found_heading}
              onChange={(v) => set("not_found_heading", v)}
            />
            <TextArea
              label="Page-not-found text"
              rows={2}
              value={draft.not_found_body}
              onChange={(v) => set("not_found_body", v)}
            />
          </>
        )}

        {group === "hero" && (
          <>
            <ImageField
              label="Hero image"
              hint="The full-screen photograph behind the studio name."
              value={draft.hero_image_url}
              onChange={(v) => set("hero_image_url", v)}
            />
            <TextField
              label="Hero image description"
              hint="Describes the picture for screen readers and search engines."
              value={draft.hero_image_alt}
              onChange={(v) => set("hero_image_alt", v)}
            />
            <TextField
              label="Headline"
              hint="Carries your main search keywords. Keep it to one line."
              value={draft.headline}
              onChange={(v) => set("headline", v)}
            />
            <TextField
              label="Primary button label"
              value={draft.cta_primary_label}
              onChange={(v) => set("cta_primary_label", v)}
            />
            <StringList
              label="Service highlights"
              hint="The short list along the bottom of the hero."
              value={draft.service_highlights}
              onChange={(v) => set("service_highlights", v)}
              addLabel="Add highlight"
            />
            <TextArea
              label="Tagline"
              hint="The line in the band directly below the hero."
              value={draft.tagline}
              onChange={(v) => set("tagline", v)}
              rows={2}
            />
          </>
        )}

        {group === "studio" && (
          <>
            <TextField label="Section label" value={draft.studio_label} onChange={(v) => set("studio_label", v)} />
            <TextArea
              label="Studio statement"
              hint="The large paragraph beside the studio photograph."
              value={draft.studio_statement}
              onChange={(v) => set("studio_statement", v)}
              rows={5}
            />
            <ImageField
              label="Studio image"
              value={draft.studio_image_url}
              onChange={(v) => set("studio_image_url", v)}
            />
            <TextField
              label="Studio image description"
              value={draft.studio_image_alt}
              onChange={(v) => set("studio_image_alt", v)}
            />
            <RecordList
              label="Statistics"
              hint="The counting numbers under the statement."
              value={draft.stats}
              onChange={(v) => set("stats", v)}
              fields={[
                { key: "value", label: "Number", type: "number" },
                { key: "suffix", label: "Suffix" },
                { key: "label", label: "Label" },
              ]}
              blank={{ value: 0, suffix: "+", label: "" }}
              addLabel="Add statistic"
            />
          </>
        )}

        {group === "sections" && (
          <>
            <TextField label="Projects label" value={draft.projects_label} onChange={(v) => set("projects_label", v)} />
            <TextArea label="Projects heading" value={draft.projects_heading} onChange={(v) => set("projects_heading", v)} rows={2} />
            <TextField label="Services label" value={draft.services_label} onChange={(v) => set("services_label", v)} />
            <TextField label="Services heading" value={draft.services_heading} onChange={(v) => set("services_heading", v)} />
            <TextField label="Before/after heading" hint="Heads the carousel. Add the pairs it steps through under Transformations." value={draft.comparison_heading} onChange={(v) => set("comparison_heading", v)} />
            <TextField label="Process label" value={draft.process_label} onChange={(v) => set("process_label", v)} />
            <TextArea label="Process heading" value={draft.process_heading} onChange={(v) => set("process_heading", v)} rows={2} />
            <TextField label="Testimonials label" value={draft.testimonials_label} onChange={(v) => set("testimonials_label", v)} />
            <TextField label="Testimonials heading" value={draft.testimonials_heading} onChange={(v) => set("testimonials_heading", v)} />
            <TextArea label="Testimonials aside" value={draft.testimonials_aside} onChange={(v) => set("testimonials_aside", v)} rows={2} />
            <TextField label="Pricing label" value={draft.pricing_label} onChange={(v) => set("pricing_label", v)} />
            <TextField label="Pricing heading" value={draft.pricing_heading} onChange={(v) => set("pricing_heading", v)} />
            <TextArea label="Pricing intro" hint="Sits beside the heading. Good place to say these are starting points, not quotes." value={draft.pricing_aside} onChange={(v) => set("pricing_aside", v)} rows={3} />
            <TextArea label="Current offer" hint="Shown as a notice above the packages. Leave blank and the notice disappears." value={draft.pricing_offer} onChange={(v) => set("pricing_offer", v)} rows={2} />
            <TextArea label="Pricing small print" hint="Under the packages. What the figures do and do not cover." value={draft.pricing_note} onChange={(v) => set("pricing_note", v)} rows={3} />
            <TextField label="Default pricing button" hint="Used when a package has no button wording of its own." value={draft.cta_pricing_label} onChange={(v) => set("cta_pricing_label", v)} />
            <TextField label="3D sketches label" value={draft.sketches_label} onChange={(v) => set("sketches_label", v)} />
            <TextField label="3D sketches heading" hint="Heads the moving gallery. Add the images under 3D sketches." value={draft.sketches_heading} onChange={(v) => set("sketches_heading", v)} />
            <TextField label="Journal label" value={draft.journal_label} onChange={(v) => set("journal_label", v)} />
            <TextField label="Journal heading" value={draft.journal_heading} onChange={(v) => set("journal_heading", v)} />
            <TextArea label="Journal aside" value={draft.journal_aside} onChange={(v) => set("journal_aside", v)} rows={2} />
          </>
        )}

        {group === "contact" && (
          <>
            <TextField
              label="Section label"
              value={draft.contact_label}
              onChange={(v) => set("contact_label", v)}
            />
            <TextArea
              label="Heading"
              rows={2}
              value={draft.contact_heading}
              onChange={(v) => set("contact_heading", v)}
            />
            <TextArea
              label="Studio address"
              rows={2}
              value={draft.contact_address}
              onChange={(v) => set("contact_address", v)}
            />
            <TextField
              label="Opening hours"
              hint="Optional. Leave blank to hide the row."
              value={draft.contact_hours}
              onChange={(v) => set("contact_hours", v)}
            />
            <TextField
              label="Map embed address"
              hint="In Google Maps: Share → Embed a map → copy the src=&quot;...&quot; value only."
              value={draft.map_embed_url}
              onChange={(v) => set("map_embed_url", v)}
              mono
            />
            <TextField
              label="Open in Maps link"
              hint="Where the button above the map goes."
              value={draft.map_link_url}
              onChange={(v) => set("map_link_url", v)}
              mono
            />
            <Toggle
              label="Also show social icons in the footer"
              hint="The social links already appear in this section."
              value={draft.show_social_in_footer}
              onChange={(v) => set("show_social_in_footer", v)}
            />
          </>
        )}

        {group === "closing" && (
          <>
            <ImageField label="Closing banner image" value={draft.closing_image_url} onChange={(v) => set("closing_image_url", v)} />
            <TextField label="Closing image description" value={draft.closing_image_alt} onChange={(v) => set("closing_image_alt", v)} />
            <TextArea label="Closing heading" value={draft.closing_heading} onChange={(v) => set("closing_heading", v)} rows={2} />
            <TextArea label="Closing body" value={draft.closing_body} onChange={(v) => set("closing_body", v)} rows={3} />
            <TextArea label="Footer introduction" value={draft.footer_intro} onChange={(v) => set("footer_intro", v)} rows={2} />
            <TextField label="Footer small print" value={draft.footer_note} onChange={(v) => set("footer_note", v)} />
          </>
        )}

        {group === "enquiry" && (
          <>
            <TextField label="Form heading" value={draft.enquiry_heading} onChange={(v) => set("enquiry_heading", v)} />
            <TextArea label="Form introduction" value={draft.enquiry_lede} onChange={(v) => set("enquiry_lede", v)} rows={2} />
            <StringList
              label="Service options"
              hint="The choices in the form's Select service menu."
              value={draft.enquiry_services}
              onChange={(v) => set("enquiry_services", v)}
              addLabel="Add option"
            />
            <NumberField
              label="Pop-up delay (milliseconds)"
              hint="How long after the loading screen clears the form appears. 10000 = 10 seconds. It shows once per visit, and again if the page is reloaded."
              value={draft.enquiry_delay_ms}
              step={500}
              onChange={(v) => set("enquiry_delay_ms", v)}
            />
            <TextField label="Thank-you heading" value={draft.thankyou_heading} onChange={(v) => set("thankyou_heading", v)} />
            <TextArea label="Thank-you body" value={draft.thankyou_body} onChange={(v) => set("thankyou_body", v)} rows={3} />
          </>
        )}

        {group === "seo" && (
          <>
            <TextField
              label="Browser tab title"
              hint="Also the headline in Google results."
              value={draft.meta_title}
              onChange={(v) => set("meta_title", v)}
            />
            <TextField
              label="Price range"
              hint="Shown by Google against the business listing. Rupee signs, not figures — ₹₹ for mid-range, ₹₹₹ for premium."
              value={draft.price_range}
              onChange={(v) => set("price_range", v)}
            />
            <TextArea
              label="Search description"
              hint="The grey text under the title in Google. Aim for 150–160 characters."
              value={draft.meta_description}
              onChange={(v) => set("meta_description", v)}
              rows={3}
            />
          </>
        )}
      </div>
    </div>
  );
}
