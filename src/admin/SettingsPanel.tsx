import { useEffect, useState } from "react";
import { useSaveRow, useSettingsRow } from "./api";
import {
  ImageField,
  NumberField,
  RecordList,
  StringList,
  TextArea,
  TextField,
} from "./Fields";
import type { SiteSettings } from "@/lib/content";

type Row = SiteSettings & { id: number };

const GROUPS = [
  { id: "identity", label: "Studio & contact" },
  { id: "hero", label: "Hero banner" },
  { id: "studio", label: "Studio section" },
  { id: "sections", label: "Section headings" },
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

  if (isLoading) return <p className="amuted">Loading…</p>;
  if (error) return <p className="aerror">{(error as Error).message}</p>;
  if (!draft) return null;

  const set = <K extends keyof Row>(key: K, value: Row[K]) =>
    setDraft({ ...draft, [key]: value });

  const dirty = JSON.stringify(draft) !== JSON.stringify(data);

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
          onClick={() => save.mutate(draft as unknown as Record<string, unknown>)}
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
              hint="Used for the call and WhatsApp links, e.g. 919000000000"
              value={draft.phone_digits}
              onChange={(v) => set("phone_digits", v)}
              mono
            />
            <TextField label="Email" value={draft.email} onChange={(v) => set("email", v)} />
            <TextField label="Location" value={draft.location} onChange={(v) => set("location", v)} />
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
            <TextField label="Before/after heading" value={draft.comparison_heading} onChange={(v) => set("comparison_heading", v)} />
            <TextField label="Process label" value={draft.process_label} onChange={(v) => set("process_label", v)} />
            <TextArea label="Process heading" value={draft.process_heading} onChange={(v) => set("process_heading", v)} rows={2} />
            <TextField label="Testimonials label" value={draft.testimonials_label} onChange={(v) => set("testimonials_label", v)} />
            <TextField label="Testimonials heading" value={draft.testimonials_heading} onChange={(v) => set("testimonials_heading", v)} />
            <TextArea label="Testimonials aside" value={draft.testimonials_aside} onChange={(v) => set("testimonials_aside", v)} rows={2} />
            <TextField label="Journal label" value={draft.journal_label} onChange={(v) => set("journal_label", v)} />
            <TextField label="Journal heading" value={draft.journal_heading} onChange={(v) => set("journal_heading", v)} />
            <TextArea label="Journal aside" value={draft.journal_aside} onChange={(v) => set("journal_aside", v)} rows={2} />
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
              hint="How long after landing the form appears. 3000 = 3 seconds."
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
