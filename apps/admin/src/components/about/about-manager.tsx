"use client";

import {
  AboutHeroPresentation,
  MediaApprovalStatus,
  MediaType,
  type AdminAboutSettings,
  type AdminMediaListItem,
  type AdminTeamMember,
  type SaveAboutSettingsRequest,
  type SaveTeamMemberRequest,
} from "@the-domain/types";
import { Card, Input, Textarea, buttonClasses } from "@the-domain/ui";
import { useEffect, useMemo, useState } from "react";
import { CmsCheckbox, CmsFeedback, CmsField } from "@/components/cms/cms-controls";
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
import { listAdminMedia } from "@/lib/media/admin-media-client";

const defaults: SaveAboutSettingsRequest = {
  isPublished: false,
  isHeroEnabled: true,
  heroMediaAssetId: null,
  heroPresentation: AboutHeroPresentation.EditorialSplit,
  isStoryEnabled: true,
  isTeamEnabled: true,
  isPartnersEnabled: true,
  isReachOutEnabled: true,
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
  const [editing, setEditing] = useState<{
    id: string | null;
    value: SaveTeamMemberRequest;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", tone: "success" as "success" | "error" });
  useEffect(() => {
    Promise.all([
      getAbout(),
      listTeam(),
      listAdminMedia({ pageNumber: 1, pageSize: 100, isArchived: false }),
    ])
      .then(([about, members, assets]) => {
        const value = about ? toRequest(about) : defaults;
        setFields(value);
        setCanonical(value);
        setTeam(members);
        setMedia([...assets.items]);
      })
      .catch((error: unknown) =>
        setFeedback({
          message: error instanceof Error ? error.message : "Unable to load About management.",
          tone: "error",
        }),
      );
  }, []);
  const eligible = useMemo(
    () =>
      media.filter(
        (item) => !item.isArchived && item.approvalStatus === MediaApprovalStatus.Approved,
      ),
    [media],
  );
  const images = eligible.filter((item) => item.mediaType === MediaType.Image);
  const dirty = JSON.stringify(fields) !== JSON.stringify(canonical);
  const update = <K extends keyof SaveAboutSettingsRequest>(
    key: K,
    value: SaveAboutSettingsRequest[K],
  ) => setFields((current) => ({ ...current, [key]: value }));

  async function saveSettings() {
    setBusy(true);
    try {
      const saved = await saveAbout(fields);
      const value = toRequest(saved);
      setFields(value);
      setCanonical(value);
      setFeedback({
        message:
          "About presentation saved. Public prose and the fixed contact route remain code-owned.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Unable to save About presentation.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }
  async function saveMember() {
    if (
      !editing ||
      !editing.value.name.trim() ||
      !editing.value.role.trim() ||
      !editing.value.photoMediaAssetId
    ) {
      setFeedback({ message: "Name, role and approved photo are required.", tone: "error" });
      return;
    }
    setBusy(true);
    try {
      const member = editing.id
        ? await updateTeam(editing.id, editing.value)
        : await createTeam(editing.value);
      setTeam((items) =>
        editing.id
          ? items.map((item) => (item.id === member.id ? member : item))
          : [...items, member],
      );
      setEditing(null);
      setFeedback({ message: "Team member saved.", tone: "success" });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Unable to save Team member.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  }
  async function changeVisibility(member: AdminTeamMember) {
    const updated = await teamVisibility(member.id, !member.isVisible);
    setTeam((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  }
  async function remove(member: AdminTeamMember) {
    if (!window.confirm(`Delete ${member.name}?`)) return;
    await deleteTeam(member.id);
    setTeam((items) => items.filter((item) => item.id !== member.id));
  }
  async function shift(index: number, direction: -1 | 1) {
    const reordered = move(team, index, index + direction);
    setTeam(reordered);
    try {
      setTeam(await reorderTeam(reordered.map((item) => item.id)));
    } catch {
      setTeam(team);
    }
  }

  return (
    <div className="space-y-7">
      <CmsFeedback message={feedback.message} tone={feedback.tone} />
      <Card className="p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[.14em] text-gold">Ownership boundary</p>
        <h2 className="mt-2 font-display text-2xl font-bold">About presentation</h2>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          Section switches, media, team records and social artwork remain CMS-owned. About prose,
          static SEO and the fixed reach-out action are maintained in Website content modules.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <CmsCheckbox
            checked={fields.isPublished}
            label="Publish About presentation"
            name="about-published"
            onChange={(value) => update("isPublished", value)}
          />
          <CmsCheckbox
            checked={fields.isHeroEnabled}
            label="Show Hero"
            name="about-hero"
            onChange={(value) => update("isHeroEnabled", value)}
          />
          <CmsCheckbox
            checked={fields.isStoryEnabled}
            label="Show Story"
            name="about-story"
            onChange={(value) => update("isStoryEnabled", value)}
          />
          <CmsCheckbox
            checked={fields.isTeamEnabled}
            label="Show Team"
            name="about-team"
            onChange={(value) => update("isTeamEnabled", value)}
          />
          <CmsCheckbox
            checked={fields.isPartnersEnabled}
            label="Show Partners"
            name="about-partners"
            onChange={(value) => update("isPartnersEnabled", value)}
          />
          <CmsCheckbox
            checked={fields.isReachOutEnabled}
            label="Show Reach-out section"
            name="about-reach-out"
            onChange={(value) => update("isReachOutEnabled", value)}
          />
          <CmsField label="Hero presentation" name="about-hero-presentation">
            <select
              className="min-h-11 w-full border border-line bg-canvas px-3"
              value={fields.heroPresentation}
              onChange={(event) =>
                update("heroPresentation", Number(event.target.value) as AboutHeroPresentation)
              }
            >
              <option value={AboutHeroPresentation.FullBleed}>Full bleed</option>
              <option value={AboutHeroPresentation.EditorialSplit}>Editorial split</option>
              <option value={AboutHeroPresentation.ContainedCinematic}>Contained cinematic</option>
              <option value={AboutHeroPresentation.MinimalStatement}>Minimal statement</option>
            </select>
          </CmsField>
          <MediaSelect
            label="Hero media"
            items={eligible}
            value={fields.heroMediaAssetId}
            onChange={(value) => update("heroMediaAssetId", value)}
          />
          <MediaSelect
            label="Social image"
            items={images}
            value={fields.socialImageMediaAssetId}
            onChange={(value) => update("socialImageMediaAssetId", value)}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className={buttonClasses("primary")}
            disabled={!dirty || busy}
            onClick={() => void saveSettings()}
            type="button"
          >
            {busy ? "Saving…" : "Save About presentation"}
          </button>
        </div>
      </Card>

      <Card className="p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Team</h2>
            <p className="mt-1 text-sm text-ink-muted">
              People, approved photos, profiles, visibility and order remain CMS-owned.
            </p>
          </div>
          <button
            className={buttonClasses("secondary")}
            onClick={() => setEditing({ id: null, value: emptyTeam })}
            type="button"
          >
            Add member
          </button>
        </div>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {team.map((member, index) => (
            <li className="flex flex-wrap items-center gap-3 py-4" key={member.id}>
              <div className="min-w-48 flex-1">
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-ink-muted">
                  {member.role} · {member.isVisible ? "Visible" : "Hidden"}
                </p>
              </div>
              <button
                className={buttonClasses("secondary", "min-h-9 px-3")}
                disabled={index === 0}
                onClick={() => void shift(index, -1)}
                type="button"
              >
                Up
              </button>
              <button
                className={buttonClasses("secondary", "min-h-9 px-3")}
                disabled={index === team.length - 1}
                onClick={() => void shift(index, 1)}
                type="button"
              >
                Down
              </button>
              <button
                className={buttonClasses("secondary", "min-h-9 px-3")}
                onClick={() => void changeVisibility(member)}
                type="button"
              >
                {member.isVisible ? "Hide" : "Show"}
              </button>
              <button
                className={buttonClasses("secondary", "min-h-9 px-3")}
                onClick={() => setEditing({ id: member.id, value: toTeamRequest(member) })}
                type="button"
              >
                Edit
              </button>
              <button
                className={buttonClasses("secondary", "min-h-9 px-3")}
                onClick={() => void remove(member)}
                type="button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {editing && (
        <Card className="grid gap-5 p-5 sm:p-7 md:grid-cols-2">
          <h2 className="font-display text-2xl font-bold md:col-span-2">
            {editing.id ? "Edit team member" : "New team member"}
          </h2>
          <CmsField label="Name" name="team-name">
            <Input
              value={editing.value.name}
              onChange={(event) =>
                setEditing({ ...editing, value: { ...editing.value, name: event.target.value } })
              }
            />
          </CmsField>
          <CmsField label="Role" name="team-role">
            <Input
              value={editing.value.role}
              onChange={(event) =>
                setEditing({ ...editing, value: { ...editing.value, role: event.target.value } })
              }
            />
          </CmsField>
          <CmsField label="Biography" name="team-biography">
            <Textarea
              value={editing.value.biography ?? ""}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  value: { ...editing.value, biography: event.target.value || null },
                })
              }
            />
          </CmsField>
          <MediaSelect
            label="Approved photo"
            items={images}
            value={editing.value.photoMediaAssetId || null}
            onChange={(value) =>
              setEditing({
                ...editing,
                value: { ...editing.value, photoMediaAssetId: value ?? "" },
              })
            }
          />
          <CmsField label="Public profile URL" name="team-profile-url">
            <Input
              value={editing.value.profileUrl ?? ""}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  value: { ...editing.value, profileUrl: event.target.value || null },
                })
              }
            />
          </CmsField>
          <CmsCheckbox
            checked={editing.value.isVisible}
            label="Visible publicly"
            name="team-visible"
            onChange={(value) =>
              setEditing({ ...editing, value: { ...editing.value, isVisible: value } })
            }
          />
          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              className={buttonClasses("secondary")}
              onClick={() => setEditing(null)}
              type="button"
            >
              Cancel
            </button>
            <button
              className={buttonClasses("primary")}
              disabled={busy}
              onClick={() => void saveMember()}
              type="button"
            >
              Save member
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

function MediaSelect({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: AdminMediaListItem[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <CmsField label={label} name={`about-media-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <select
        className="min-h-11 w-full border border-line bg-canvas px-3"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">No media selected</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.originalFileName}
          </option>
        ))}
      </select>
    </CmsField>
  );
}
function toRequest(value: AdminAboutSettings): SaveAboutSettingsRequest {
  return {
    isPublished: value.isPublished,
    isHeroEnabled: value.isHeroEnabled,
    heroMediaAssetId: value.heroMediaAssetId,
    heroPresentation: value.heroPresentation,
    isStoryEnabled: value.isStoryEnabled,
    isTeamEnabled: value.isTeamEnabled,
    isPartnersEnabled: value.isPartnersEnabled,
    isReachOutEnabled: value.isReachOutEnabled,
    socialImageMediaAssetId: value.socialImageMediaAssetId,
  };
}
function toTeamRequest(value: AdminTeamMember): SaveTeamMemberRequest {
  return {
    name: value.name,
    role: value.role,
    biography: value.biography,
    photoMediaAssetId: value.photoMediaAssetId,
    profileUrl: value.profileUrl,
    isVisible: value.isVisible,
  };
}
function move<T>(items: T[], from: number, to: number) {
  const result = [...items];
  const [item] = result.splice(from, 1);
  if (item !== undefined) result.splice(to, 0, item);
  return result;
}
