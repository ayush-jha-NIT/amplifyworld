import type { ServiceId } from "@amplifyworld/shared";

export const serviceDetails: Record<ServiceId, { icon: string; description: string }> = {
  performance: {
    icon: "performance",
    description: "Campaign strategy, conversion tracking, optimization and reporting across performance channels."
  },
  local: {
    icon: "local",
    description: "Improve your Google Business Profile and help nearby customers discover your business."
  },
  website: {
    icon: "website",
    description: "Responsive, accessible websites designed around real business goals and clear conversion paths."
  },
  "seo-geo": {
    icon: "search",
    description: "Build organic discoverability and content structured for traditional and AI-powered search."
  },
  "agentic-ai": {
    icon: "agent",
    description: "Practical AI-powered website assistants and workflows tailored to useful customer experiences."
  },
  social: {
    icon: "social",
    description: "From concept and filming to editing, publishing and ongoing social media management."
  }
};

export const benefits = [
  {
    id: "strategy",
    icon: "strategy",
    title: "Purposeful strategy",
    description: "A thoughtful plan shaped around your audience, business needs and goals."
  },
  {
    id: "partnership",
    icon: "partnership",
    title: "Connected expertise",
    description: "Marketing, creative and technical work developed as one consistent experience."
  },
  {
    id: "innovation",
    icon: "innovation",
    title: "Practical innovation",
    description: "Modern tools and creative approaches selected because they serve a real purpose."
  },
  {
    id: "results",
    icon: "results",
    title: "Clear collaboration",
    description: "An open process with shared priorities, transparent decisions and room to improve."
  }
] as const;

export const conceptProjects = [
  {
    id: "growth-website",
    title: "Growth website concept",
    category: "Web Development",
    image: "project-website.svg",
    description: "An illustrative conversion-led website layout for a modern business."
  },
  {
    id: "campaign",
    title: "Campaign creative concept",
    category: "Performance Marketing",
    image: "project-campaign.svg",
    description: "A sample creative direction for a multi-channel marketing campaign."
  },
  {
    id: "local-discovery",
    title: "Local discovery concept",
    category: "Local SEO",
    image: "project-local.svg",
    description: "A conceptual local-search and Google Business Profile experience."
  }
] as const;

export const growthProcess = [
  { id: "discover", number: "01", icon: "discover", title: "Discover", description: "Understand your business, your audience and the opportunity." },
  { id: "strategize", number: "02", icon: "strategy", title: "Strategize", description: "Create a clear direction around your priorities." },
  { id: "execute", number: "03", icon: "execute", title: "Execute", description: "Design, build and launch the right solutions." },
  { id: "grow", number: "04", icon: "growth", title: "Grow", description: "Review, learn and improve your approach over time." }
] as const;
