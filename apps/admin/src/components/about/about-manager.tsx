"use client";

import {
  AboutHeroPresentation,
  MediaApprovalStatus,
  MediaType,
  type AdminAboutSettings,
  type AdminMediaListItem,
  type AdminPartner,
  type AdminTeamMember,
  type SaveAboutSettingsRequest,
  type SaveTeamMemberRequest,
} from "@the-domain/types";
import { Card, Input, Select, Textarea, buttonClasses } from "@the-domain/ui";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { aboutChanged, aboutPreviewWidth, safeAboutHref } from "@the-domain/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CmsCheckbox, CmsFeedback, CmsField, ConfirmAction } from "@/components/cms/cms-controls";
import {
  createTeam,
  deleteTeam,
  getAbout,
  listTeam,
  reorderTeam,
  saveAbout,
  teamVisibility,
  updateTeam,
} from "@/lib/about/about-client";
import { listAdminMedia, uploadAdminMedia } from "@/lib/media/admin-media-client";
import { listAdminPartners } from "@/lib/cms/admin-cms-client";

const defaults: SaveAboutSettingsRequest = {
  isPublished: false,
  isHeroEnabled: true,
  heroEyebrow: "The company",
  heroHeading: "About The Domain",
  heroText: "Entertainment composed with intention.",
  heroMediaAssetId: null,
  heroPresentation: AboutHeroPresentation.EditorialSplit,
  introStatement:
    "We shape experiences where atmosphere, production, people, and place move as one.",
  isStoryEnabled: true,
  storyHeading: "A considered approach to entertainment.",
  storyText:
    "The Domain brings creative direction and operational detail into one clear experience.",
  storyHighlight: null,
  isTeamEnabled: true,
  teamHeading: "The people behind the experience.",
  teamText: "A focused team connecting vision with execution.",
  isPartnersEnabled: true,
  partnersHeading: "Built with trusted partners.",
  partnersText: "Relationships that strengthen every production.",
  isReachOutEnabled: true,
  reachOutHeading: "Let’s create what comes next.",
  reachOutText: "Talk to The Domain about your next experience.",
  reachOutCtaLabel: "Reach out",
  reachOutCtaHref: "/contact",
  seoTitle: null,
  seoDescription: null,
  socialImageMediaAssetId: null,
};
const emptyTeam: SaveTeamMemberRequest = {
  name: "",
  role: "",
  biography: null,
  photoMediaAssetId: "",
  profileUrl: null,
  isVisible: true,
};

export function AboutManager() {
  const [fields, setFields] = useState(defaults);
  const [canonical, setCanonical] = useState(defaults);
  const [team, setTeam] = useState<AdminTeamMember[]>([]);
  const [media, setMedia] = useState<AdminMediaListItem[]>([]);
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [editing, setEditing] = useState<AdminTeamMember | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [feedback, setFeedback] = useState({ message: "", tone: "success" as "success" | "error" });
  const dirty = useMemo(() => aboutChanged(canonical, fields), [fields, canonical]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  useEffect(() => {
    void Promise.all([
      getAbout(),
      listTeam(),
      listAdminMedia({ pageNumber: 1, pageSize: 100, isArchived: false }),
      listAdminPartners(),
    ])
      .then(([about, people, assets, partnerItems]) => {
        const value = about ? requestOf(about) : defaults;
        setFields(value);
        setCanonical(value);
        setTeam(people);
        setMedia([...assets.items]);
        setPartners(partnerItems.filter((item) => item.isVisible));
      })
      .catch(() => setFeedback({ message: "Unable to load About content.", tone: "error" }));
  }, []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const set = <K extends keyof SaveAboutSettingsRequest>(
    key: K,
    value: SaveAboutSettingsRequest[K],
  ) => setFields((current) => ({ ...current, [key]: value }));
  async function save() {
    const error = validateAbout(fields);
    if (error) {
      setFeedback({ message: error, tone: "error" });
      document.getElementById(firstInvalidAboutField(fields))?.focus();
      return;
    }
    setBusy(true);
    try {
      const saved = await saveAbout(fields);
      const value = requestOf(saved);
      setFields(value);
      setCanonical(value);
      setFeedback({ message: "About page saved.", tone: "success" });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Unable to save About content.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }
  async function drag(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = team.findIndex((x) => x.id === event.active.id);
    const newIndex = team.findIndex((x) => x.id === event.over!.id);
    const before = team;
    const next = arrayMove(team, oldIndex, newIndex);
    setTeam(next);
    try {
      setTeam(await reorderTeam(next.map((x) => x.id)));
      setFeedback({
        message: `Team order saved. ${next[newIndex]?.name} is position ${newIndex + 1}.`,
        tone: "success",
      });
    } catch {
      setTeam(before);
      setFeedback({
        message: "Unable to save Team order; the previous order was restored.",
        tone: "error",
      });
    }
  }
  const hero = media.find((x) => x.id === fields.heroMediaAssetId);
  return (
    <div className="space-y-6">
      <CmsFeedback message={feedback.message} tone={feedback.tone} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,.8fr)]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="font-display text-2xl font-bold">Page structure</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["isHeroEnabled", "Hero"],
                  ["isStoryEnabled", "Story"],
                  ["isTeamEnabled", "Team"],
                  ["isPartnersEnabled", "Partners"],
                  ["isReachOutEnabled", "Reach Out"],
                ] as const
              ).map(([key, label]) => (
                <CmsCheckbox
                  checked={Boolean(fields[key as keyof typeof fields])}
                  key={key}
                  label={label}
                  name={key}
                  onChange={(value) => set(key as keyof SaveAboutSettingsRequest, value as never)}
                />
              ))}
            </div>
          </Card>
          <Editor title="Hero">
            <Fields
              fields={fields}
              set={set}
              names={[
                ["heroEyebrow", "Eyebrow", 100],
                ["heroHeading", "Heading", 200],
                ["heroText", "Supporting text", 700],
              ]}
            />
            <MediaSelect
              label="Hero image or video"
              media={media}
              value={fields.heroMediaAssetId}
              onChange={(value) => set("heroMediaAssetId", value)}
              allowVideo
              onUpload={async (file) => {
                const item = await uploadAdminMedia(file, {
                  approvalStatus: MediaApprovalStatus.Approved,
                  category: "About hero",
                  altText: fields.heroHeading,
                });
                setMedia((current) => [item, ...current]);
                set("heroMediaAssetId", item.id);
              }}
            />
            <CmsField label="Presentation" name="heroPresentation">
              <Select
                value={fields.heroPresentation}
                onChange={(e) =>
                  set("heroPresentation", Number(e.target.value) as typeof fields.heroPresentation)
                }
              >
                {Object.entries({
                  "Full bleed": 1,
                  "Editorial split": 2,
                  "Contained cinematic": 3,
                  "Minimal statement": 4,
                }).map(([label, value]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </CmsField>
          </Editor>
          <Editor title="Brand statement & story">
            <Fields
              fields={fields}
              set={set}
              names={[
                ["introStatement", "Intro statement", 700],
                ["storyHeading", "Story heading", 200],
                ["storyText", "Story paragraphs", 2500],
                ["storyHighlight", "Optional highlight", 300],
              ]}
            />
          </Editor>
          <Editor title="Team">
            <div className="flex justify-between">
              <p className="text-sm text-ink-muted">
                Drag with the handle or use keyboard and Move controls.
              </p>
              <button
                className={buttonClasses("primary")}
                onClick={() => setEditing("new")}
                type="button"
              >
                Add member
              </button>
            </div>
            <DndContext collisionDetection={closestCenter} onDragEnd={drag} sensors={sensors}>
              <SortableContext items={team.map((x) => x.id)} strategy={verticalListSortingStrategy}>
                <div className="mt-4 space-y-2">
                  {team.map((person, index) => (
                    <TeamRow
                      busy={busy}
                      index={index}
                      item={person}
                      key={person.id}
                      onEdit={() => setEditing(person)}
                      onMove={async (direction) => {
                        const target = index + direction;
                        if (target < 0 || target >= team.length) return;
                        const next = arrayMove(team, index, target);
                        setTeam(next);
                        setTeam(await reorderTeam(next.map((x) => x.id)));
                      }}
                      onVisibility={async () => {
                        const updated = await teamVisibility(person.id, !person.isVisible);
                        setTeam((current) =>
                          current.map((x) => (x.id === updated.id ? updated : x)),
                        );
                      }}
                      onDelete={async () => {
                        await deleteTeam(person.id);
                        setTeam((current) => current.filter((x) => x.id !== person.id));
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {editing && (
              <TeamEditor
                editing={editing}
                media={media}
                onClose={() => setEditing(null)}
                onMedia={(item) => setMedia((current) => [item, ...current])}
                onSaved={(item) => {
                  setTeam((current) =>
                    editing === "new"
                      ? [...current, item]
                      : current.map((x) => (x.id === item.id ? item : x)),
                  );
                  setEditing(null);
                }}
              />
            )}
          </Editor>
          <Editor title="Partners placement">
            <Fields
              fields={fields}
              set={set}
              names={[
                ["partnersHeading", "Heading", 200],
                ["partnersText", "Supporting text", 700],
              ]}
            />
            <Link className={buttonClasses("secondary")} href="/dashboard/partners">
              Open Partners Manager
            </Link>
          </Editor>
          <Editor title="Reach Out">
            <Fields
              fields={fields}
              set={set}
              names={[
                ["reachOutHeading", "Heading", 200],
                ["reachOutText", "Supporting text", 700],
                ["reachOutCtaLabel", "CTA label", 100],
                ["reachOutCtaHref", "Safe destination", 2048],
              ]}
            />
          </Editor>
          <Editor title="SEO">
            <Fields
              fields={fields}
              set={set}
              names={[
                ["seoTitle", "Optional page title", 70],
                ["seoDescription", "Optional description", 180],
              ]}
            />
            <MediaSelect
              label="Optional social image"
              media={media}
              value={fields.socialImageMediaAssetId}
              onChange={(value) => set("socialImageMediaAssetId", value)}
            />
          </Editor>
          <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <CmsCheckbox
                checked={fields.isPublished}
                label="Publish About page"
                name="isPublished"
                onChange={(value) => set("isPublished", value)}
              />
              <p className="mt-2 text-xs text-ink-muted">
                {dirty ? "Unsaved changes" : "All changes saved"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className={buttonClasses("secondary")}
                disabled={!dirty || busy}
                onClick={() => setFields(canonical)}
                type="button"
              >
                Cancel changes
              </button>
              <button
                className={buttonClasses("primary")}
                disabled={!dirty || busy}
                onClick={save}
                type="button"
              >
                {busy ? "Saving…" : "Save About page"}
              </button>
            </div>
          </Card>
        </div>
        <Card className="h-fit p-4 xl:sticky xl:top-6">
          <div className="flex gap-2" role="group" aria-label="Preview width">
            {(["desktop", "tablet", "mobile"] as const).map((value) => (
              <button
                aria-pressed={mode === value}
                className={buttonClasses(mode === value ? "primary" : "secondary", "px-3")}
                key={value}
                onClick={() => setMode(value)}
                type="button"
              >
                {value}
              </button>
            ))}
          </div>
          <div
            className={`mx-auto mt-4 overflow-hidden border border-line bg-canvas ${aboutPreviewWidth(mode)}`}
          >
            <Preview fields={fields} hero={hero} partners={partners} team={team} />
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Approximate preview. Buttons do not navigate.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Editor({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="border border-line bg-surface" open>
      <summary className="cursor-pointer p-5 font-display text-xl font-bold">{title}</summary>
      <div className="space-y-5 border-t border-line p-5">{children}</div>
    </details>
  );
}
function Fields({
  fields,
  set,
  names,
}: {
  fields: SaveAboutSettingsRequest;
  set: <K extends keyof SaveAboutSettingsRequest>(
    key: K,
    value: SaveAboutSettingsRequest[K],
  ) => void;
  names: readonly (readonly [keyof SaveAboutSettingsRequest, string, number])[];
}) {
  return (
    <div className="grid gap-4">
      {names.map(([key, label, max]) => (
        <CmsField key={key} label={label} name={key}>
          <Textarea
            className="min-h-20"
            id={String(key)}
            maxLength={max}
            onChange={(e) => set(key, e.target.value as never)}
            value={(fields[key] as string | null) ?? ""}
          />
        </CmsField>
      ))}
    </div>
  );
}
function MediaSelect({
  label,
  media,
  value,
  onChange,
  allowVideo = false,
  onUpload,
}: {
  label: string;
  media: AdminMediaListItem[];
  value: string | null;
  onChange: (value: string | null) => void;
  allowVideo?: boolean;
  onUpload?: (file: File) => Promise<void>;
}) {
  const candidates = media.filter(
    (x) => x.mediaType === MediaType.Image || (allowVideo && x.mediaType === MediaType.Video),
  );
  return (
    <CmsField label={label} name={label}>
      <Select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">Intentional no-media fallback</option>
        {candidates.map((x) => (
          <option
            disabled={
              x.isArchived ||
              x.approvalStatus !== MediaApprovalStatus.Approved ||
              !x.url.startsWith("https://")
            }
            key={x.id}
            value={x.id}
          >
            {x.caption || x.originalFileName} ·{" "}
            {x.isArchived
              ? "Archived — unavailable"
              : x.approvalStatus !== MediaApprovalStatus.Approved
                ? "Approval required"
                : x.mediaType === MediaType.Video
                  ? "Video"
                  : "Image"}
          </option>
        ))}
      </Select>
      {onUpload && (
        <input
          accept={allowVideo ? "image/*,video/*" : "image/*"}
          className="mt-3"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onUpload(file);
          }}
          type="file"
        />
      )}
    </CmsField>
  );
}
function TeamRow({
  item,
  index,
  onEdit,
  onMove,
  onVisibility,
  onDelete,
}: {
  item: AdminTeamMember;
  index: number;
  busy: boolean;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => Promise<void>;
  onVisibility: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="flex flex-wrap items-center gap-3 border border-line p-3"
    >
      <button
        aria-label={`Drag ${item.name}, position ${index + 1}`}
        className="cursor-grab p-2"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="min-w-0 flex-1">
        <p className="break-words font-semibold">{item.name}</p>
        <p className="break-words text-xs text-ink-muted">
          {item.role} · {item.isVisible ? "Visible" : "Hidden"}
        </p>
      </div>
      <button
        className={buttonClasses("ghost", "px-2")}
        onClick={() => void onMove(-1)}
        type="button"
      >
        Up
      </button>
      <button
        className={buttonClasses("ghost", "px-2")}
        onClick={() => void onMove(1)}
        type="button"
      >
        Down
      </button>
      <button className={buttonClasses("secondary", "px-2")} onClick={onEdit} type="button">
        Edit
      </button>
      <button
        className={buttonClasses("ghost", "px-2")}
        onClick={() => void onVisibility()}
        type="button"
      >
        {item.isVisible ? "Hide" : "Show"}
      </button>
      <ConfirmAction
        description="The media asset remains in the Media Library."
        label="Delete"
        onConfirm={onDelete}
        title={`Delete ${item.name}?`}
      />
    </div>
  );
}
function TeamEditor({
  editing,
  media,
  onClose,
  onSaved,
  onMedia,
}: {
  editing: AdminTeamMember | "new";
  media: AdminMediaListItem[];
  onClose: () => void;
  onSaved: (item: AdminTeamMember) => void;
  onMedia: (item: AdminMediaListItem) => void;
}) {
  const [form, setForm] = useState<SaveTeamMemberRequest>(
    editing === "new"
      ? emptyTeam
      : {
          name: editing.name,
          role: editing.role,
          biography: editing.biography,
          photoMediaAssetId: editing.photoMediaAssetId,
          profileUrl: editing.profileUrl,
          isVisible: editing.isVisible,
        },
  );
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-5 space-y-4 border border-gold/40 p-4">
      <h3 className="font-display text-xl font-bold">
        {editing === "new" ? "New Team member" : `Edit ${editing.name}`}
      </h3>
      {(
        [
          ["name", "Name"],
          ["role", "Role/title"],
          ["biography", "Short biography"],
          ["profileUrl", "Optional HTTPS profile"],
        ] as const
      ).map(([key, label]) => (
        <CmsField key={key} label={label} name={key}>
          <Input
            onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value || null }))}
            value={(form[key as keyof typeof form] as string | null) ?? ""}
          />
        </CmsField>
      ))}
      <MediaSelect
        allowVideo={false}
        label="Photo"
        media={media}
        value={form.photoMediaAssetId || null}
        onChange={(value) => setForm((current) => ({ ...current, photoMediaAssetId: value ?? "" }))}
        onUpload={async (file) => {
          const item = await uploadAdminMedia(file, {
            approvalStatus: MediaApprovalStatus.Approved,
            category: "Team photo",
            altText: form.name,
          });
          onMedia(item);
          setForm((current) => ({ ...current, photoMediaAssetId: item.id }));
        }}
      />
      <div className="flex gap-2">
        <button className={buttonClasses("secondary")} onClick={onClose} type="button">
          Cancel
        </button>
        <button
          className={buttonClasses("primary")}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              onSaved(
                editing === "new" ? await createTeam(form) : await updateTeam(editing.id, form),
              );
            } finally {
              setBusy(false);
            }
          }}
          type="button"
        >
          Save member
        </button>
      </div>
    </div>
  );
}
function Preview({
  fields,
  hero,
  partners,
  team,
}: {
  fields: SaveAboutSettingsRequest;
  hero?: AdminMediaListItem;
  partners: AdminPartner[];
  team: AdminTeamMember[];
}) {
  return (
    <div>
      <section className="relative min-h-72 overflow-hidden p-6">
        {hero &&
          (hero.mediaType === MediaType.Video ? (
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-30"
              muted
              playsInline
              poster={hero.thumbnailUrl ?? undefined}
              src={hero.url}
            />
          ) : (
            <Image alt="" className="object-cover opacity-30" fill sizes="50vw" src={hero.url} />
          ))}
        <div className="relative">
          <p className="text-xs uppercase text-gold">{fields.heroEyebrow}</p>
          <h2 className="mt-4 break-words font-display text-4xl font-bold">{fields.heroHeading}</h2>
          <p className="mt-3 text-sm text-ink-muted">{fields.heroText}</p>
        </div>
      </section>
      <section className="border-t border-line p-6">
        <p className="font-display text-2xl font-bold">{fields.introStatement}</p>
      </section>
      {fields.isStoryEnabled && (
        <section className="border-t border-line p-6">
          <h3 className="font-display text-2xl font-bold">{fields.storyHeading}</h3>
          <p className="mt-3 whitespace-pre-line text-sm text-ink-muted">{fields.storyText}</p>
        </section>
      )}
      {fields.isTeamEnabled && (
        <section className="border-t border-line p-6">
          <h3 className="font-display text-2xl font-bold">{fields.teamHeading}</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {team
              .filter((x) => x.isVisible)
              .map((x) => (
                <div className="border border-line p-3" key={x.id}>
                  <p className="break-words font-semibold">{x.name}</p>
                  <p className="break-words text-xs text-ink-muted">{x.role}</p>
                </div>
              ))}
          </div>
        </section>
      )}
      {fields.isPartnersEnabled && (
        <section className="border-t border-line p-6">
          <h3 className="font-display text-2xl font-bold">{fields.partnersHeading}</h3>
          <p className="mt-2 text-sm text-ink-muted">
            {partners.length
              ? partners.map((item) => item.name).join(" · ")
              : "Canonical visible Partners appear here."}
          </p>
        </section>
      )}
      {fields.isReachOutEnabled && (
        <section className="border-t border-line bg-surface p-6">
          <h3 className="font-display text-3xl font-bold">{fields.reachOutHeading}</h3>
          <button className={buttonClasses("primary", "mt-4")} type="button">
            {fields.reachOutCtaLabel}
          </button>
        </section>
      )}
    </div>
  );
}
function requestOf(value: AdminAboutSettings): SaveAboutSettingsRequest {
  const { id, heroMedia, socialImage, createdAtUtc, updatedAtUtc, ...request } = value;
  void id;
  void heroMedia;
  void socialImage;
  void createdAtUtc;
  void updatedAtUtc;
  return request;
}
export function validateAbout(value: SaveAboutSettingsRequest): string | null {
  if (
    !value.heroHeading.trim() ||
    !value.introStatement.trim() ||
    !value.storyHeading.trim() ||
    !value.teamHeading.trim() ||
    !value.partnersHeading.trim() ||
    !value.reachOutHeading.trim()
  )
    return "Complete all required About headings.";
  if (!safeAboutHref(value.reachOutCtaHref))
    return "Enter a safe internal, HTTPS, mail, or telephone CTA destination.";
  return null;
}

function firstInvalidAboutField(value: SaveAboutSettingsRequest): string {
  for (const field of [
    "heroHeading",
    "introStatement",
    "storyHeading",
    "teamHeading",
    "partnersHeading",
    "reachOutHeading",
  ] as const) {
    if (!value[field].trim()) return field;
  }
  return "reachOutCtaHref";
}
