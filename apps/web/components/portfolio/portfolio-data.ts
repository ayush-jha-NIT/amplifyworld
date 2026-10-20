export const portfolioCategories = [
  "All",
  "Web Development",
  "SEO & GEO",
  "Performance Marketing",
  "Social Media"
] as const;

export type PortfolioCategory = (typeof portfolioCategories)[number];
export type ProjectCategory = Exclude<PortfolioCategory, "All">;

export type PortfolioProject = {
  id: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  objective: string;
  image: string;
  imageAlt: string;
  services: readonly string[];
  approach: readonly string[];
  status: "Concept / Placeholder";
};

/**
 * Concept artwork provided by the approved design package.
 * These are explicitly NOT clients, delivered engagements, or performance evidence.
 * Replace with permission-cleared case studies from the CMS in Module 14.
 */
export const portfolioProjects: readonly PortfolioProject[] = [
  {
    id: "growth-website-concept",
    title: "Growth website concept",
    category: "Web Development",
    summary: "A conversion-conscious website layout demonstrating clear journeys from interest to inquiry.",
    objective: "Explore how a distinctive business website could connect brand storytelling with a straightforward path to contact.",
    image: "/design/templates/project-website.svg",
    imageAlt: "Original illustrative purple growth website design, not a live client website",
    services: ["Website strategy", "UI/UX design", "Conversion-oriented layout"],
    approach: [
      "Give the brand a clear headline and visual hierarchy.",
      "Organize service information around customer questions.",
      "Make contact actions easy to find across screen sizes."
    ],
    status: "Concept / Placeholder"
  },
  {
    id: "campaign-creative-concept",
    title: "Campaign creative concept",
    category: "Performance Marketing",
    summary: "A visual direction for connected campaigns and performance-minded creative work.",
    objective: "Explore a coherent creative system that could work across awareness and conversion touchpoints.",
    image: "/design/templates/project-campaign.svg",
    imageAlt: "Original illustrative campaign dashboard and creative shapes, not an actual client campaign",
    services: ["Creative direction", "Meta Ads planning", "Campaign storytelling"],
    approach: [
      "Establish one recognizable message across variations.",
      "Design clear creative calls to action.",
      "Make room for responsible measurement and iteration."
    ],
    status: "Concept / Placeholder"
  },
  {
    id: "local-discovery-concept",
    title: "Local discovery concept",
    category: "SEO & GEO",
    summary: "A conceptual local-discovery experience for helping nearby customers find relevant businesses.",
    objective: "Show how well-organized local information and clear business details could improve discoverability.",
    image: "/design/templates/project-local.svg",
    imageAlt: "Original illustrative local discovery interface, not a real business listing",
    services: ["Local search", "Google Business Profile", "SEO and GEO"],
    approach: [
      "Organize helpful location and service information.",
      "Make key contact and discovery details easy to scan.",
      "Support search-friendly, accessible content structures."
    ],
    status: "Concept / Placeholder"
  }
];
