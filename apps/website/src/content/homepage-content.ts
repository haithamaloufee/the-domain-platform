export const homepageContent = {
  hero: {
    eyebrow: "The Domain · Jordan",
    headline: "Entertainment,",
    accent: "framed differently.",
    description:
      "Discover upcoming events, previous highlights, and the visual stories behind The Domain.",
  },
  whyDomain: {
    eyebrow: "Why The Domain",
    title: "Every detail serves the experience.",
    paragraphs: [
      "The Domain approaches entertainment as a complete composition: atmosphere, production, people, and place working together.",
      "Our public archive keeps each experience alive beyond the event itself, through carefully selected moments and stories.",
    ],
  },
  statistics: [
    { label: "Events", value: "—", note: "Awaiting verified data" },
    { label: "Experiences", value: "—", note: "Awaiting verified data" },
    { label: "Partners", value: "—", note: "Awaiting verified data" },
    { label: "Media Moments", value: "—", note: "Awaiting verified data" },
  ],
  services: [
    {
      title: "Event Management",
      description: "Structured planning and delivery shaped around the character of each event.",
    },
    {
      title: "Corporate Events",
      description:
        "Considered experiences for organizations, teams, clients, and invited audiences.",
    },
    {
      title: "Entertainment Solutions",
      description:
        "Creative entertainment direction aligned with the setting, audience, and occasion.",
    },
    {
      title: "Event Production",
      description: "Production thinking that connects staging, atmosphere, and the guest journey.",
    },
    {
      title: "Private Experiences",
      description: "Tailored concepts for private occasions that call for a more personal frame.",
    },
  ],
  partners: {
    eyebrow: "Partners & Sponsors",
    title: "Built for meaningful collaboration.",
    emptyMessage: "Partner profiles will appear here when verified content is available.",
  },
  contact: {
    eyebrow: "Start a conversation",
    title: "Bring the next experience into focus.",
    description: "Tell us what you are planning and where The Domain can add perspective.",
  },
} as const;
