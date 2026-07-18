import type { HomepageSectionKey } from "@the-domain/types";

export const HOMEPAGE_SECTION_ORDER = [
  "statistics",
  "events",
  "why",
  "previous",
  "gallery",
  "services",
  "partners",
  "contact",
] as const satisfies readonly HomepageSectionKey[];

export const homeContent = {
  hero: {
    eyebrow: "The Domain · Jordan",
    title: "Where unforgettable moments begin",
    accent: null,
    description: "Live entertainment, bold ideas, and experiences designed to stay with you.",
    primaryCta: { label: "Explore events", href: "/events" },
    secondaryCta: { label: "View the gallery", href: "/gallery" },
  },
  why: {
    title: "Built around memorable moments",
    description:
      "Every experience begins with a clear idea and grows through collaboration, production, and attention to atmosphere.",
  },
  services: { title: "From first idea to final atmosphere" },
  partners: { title: "Created with trusted collaborators" },
  contact: {
    title: "Let us create what comes next",
    description: "Bring us the ambition. We will help shape the experience.",
    cta: { label: "Start a conversation", href: "/contact" },
  },
  statistics: {
    phrase: "We create moments that move with you",
    labels: [
      "Years creating experiences",
      "Events produced",
      "Guests welcomed",
      "Creative partners",
    ],
  },
  events: { title: "Experiences on the horizon" },
  previousEvents: { title: "The night ends. The story remains." },
  gallery: { title: "Moments with their own afterlife" },
} as const;

export const removedUnusedHomepageCopy = {
  ServicesDescription:
    "Creative direction, production, and entertainment brought together under one considered vision.",
  PartnersDescription:
    "A development showcase of the partners that help ideas move from concept to experience.",
  EventsDescription: "Discover the next live moments taking shape at The Domain.",
  PreviousEventsDescription:
    "Return to the stages, rooms, and audiences that shaped earlier experiences.",
  GalleryDescription: "A curated view of live atmosphere and the craft behind every event.",
} as const;
