export const blogCategories = ["All", "SEO & GEO", "Agentic AI", "Strategy", "Social Media"] as const;
export type BlogCategory = (typeof blogCategories)[number];
export type ArticleCategory = Exclude<BlogCategory, "All">;

export type ArticleSection = {
  slug: string;
  title: string;
  paragraphs: readonly string[];
};

export type BlogArticle = {
  slug: string;
  title: string;
  category: ArticleCategory;
  excerpt: string;
  description: string;
  artwork: string;
  cover: string;
  alt: string;
  sections: readonly ArticleSection[];
  minutes: number;
  status: "Editorial sample";
};

/**
 * Original editorial DEMONSTRATIONS, not yet published commercial articles.
 * No invented author, publication timestamp, customer performance or statistics.
 * Trusted, typed sections render as React text nodes: never inject HTML.
 */
export const articles: readonly BlogArticle[] = [
  {
    slug: "search",
    title: "A clearer path from search to your business",
    category: "SEO & GEO",
    excerpt: "Turn useful customer questions into clear, connected pages and a thoughtful next step.",
    description: "Explore clear service information, relevant search intent and accessible customer journeys.",
    artwork: "/design/artwork/editorial-search-640.webp",
    cover: "/design/artwork/editorial-search-1200.webp",
    alt: "Original abstract violet SEO and search illustration",
    minutes: 5,
    status: "Editorial sample",
    sections: [
      {
        slug: "start-with-the-question",
        title: "Start with the question",
        paragraphs: [
          "Before choosing keywords or a new campaign, understand what someone is trying to solve. Are they comparing options, learning about a service or ready to get in touch? A useful page begins by giving that visitor an understandable answer.",
          "Write down a few real questions a potential customer might ask. Use them to shape headings and supporting details. The goal is not to force a phrase onto every line, but to give each section a reason to exist."
        ]
      },
      {
        slug: "make-the-offer-understandable",
        title: "Make the offer understandable",
        paragraphs: [
          "Explain what the service covers, who it is designed for and what someone should expect next. The most important details should be visible without hunting through decorative sections.",
          "Use plain words and a readable heading hierarchy. Where evidence is available, identify its source. Avoid invented testimonials, ranking promises or statistics that cannot be verified."
        ]
      },
      {
        slug: "connect-the-experience",
        title: "Connect the experience",
        paragraphs: [
          "Someone arriving from a search result should recognize the subject they came to explore. The wording of the result, the page introduction and the eventual contact action should feel like parts of the same conversation.",
          "Check this sequence on a phone. A beautiful layout is not especially helpful if the business details become difficult to find or a contact form feels impossible to use."
        ]
      },
      {
        slug: "support-discovery",
        title: "Support helpful discovery",
        paragraphs: [
          "Search and generative discovery both benefit from pages that make important facts easy to interpret. Give services descriptive names, keep navigation organized and use structured information where it genuinely describes the content.",
          "Good presentation is not a guarantee of visibility. Treat search performance as something to evaluate using real observations rather than as a promise attached to a single design change."
        ]
      },
      {
        slug: "build-the-next-step",
        title: "Build a useful next step",
        paragraphs: [
          "A clear call to action tells visitors what happens when they continue. If the next step is an inquiry, ask only for information the team can use and make any required details understandable.",
          "Review the full journey: question, answer, supporting detail and contact. Each part should help a person move forward without asking them to guess."
        ]
      }
    ]
  },
  {
    slug: "ai",
    title: "Give every website interaction a purpose",
    category: "Agentic AI",
    excerpt: "Design useful AI experiences around customer needs, clear boundaries and sensible human handoffs.",
    description: "A practical way to think about helpful AI-powered website interactions.",
    artwork: "/design/artwork/editorial-ai-640.webp",
    cover: "/design/artwork/editorial-ai-1200.webp",
    alt: "Original abstract AI interface illustration in purple",
    minutes: 4,
    status: "Editorial sample",
    sections: [
      {
        slug: "define-the-job",
        title: "Define the job",
        paragraphs: [
          "Start with one concrete customer need. Maybe visitors need to understand available services or find the right point of contact. Decide what a new interaction should help them accomplish before adding a conversation box.",
          "A clearly limited task makes the experience easier to test. It also helps the team understand where the interface should stop and where a person may need to take over."
        ]
      },
      {
        slug: "make-expectations-clear",
        title: "Make expectations clear",
        paragraphs: [
          "Tell people what the assistant can help with and which information is useful. Avoid suggesting that it knows more about a business than it actually does.",
          "If the interface collects personal information, explain the purpose and limit the collection to what is necessary. Clear expectations matter as much as responsive styling."
        ]
      },
      {
        slug: "design-the-handoff",
        title: "Design the handoff",
        paragraphs: [
          "Some questions cannot be answered responsibly by an automated interface. A visible route to the team is part of the feature, not a failure state.",
          "When escalating a request, provide a useful summary where appropriate and explain what the person should expect without inventing a response-time promise."
        ]
      },
      {
        slug: "plan-for-uncertainty",
        title: "Plan for uncertainty",
        paragraphs: [
          "Loading, unavailable, incorrect and unclear responses all need thoughtful treatment. A helpful message should say what happened and how the visitor can continue.",
          "Make retries understandable, preserve inputs where it is safe to do so and avoid endlessly looping animations that obscure the actual outcome."
        ]
      },
      {
        slug: "review-accessibility",
        title: "Review accessibility",
        paragraphs: [
          "Try the flow using a keyboard, a screen reader and a small screen. New content should be announced sensibly, controls should have clear names and reduced-motion users should not be forced through an animated sequence.",
          "A purposeful interface is one that remains useful when the decorative elements are taken away."
        ]
      }
    ]
  },
  {
    slug: "strategy",
    title: "Start with the business. Build the growth plan.",
    category: "Strategy",
    excerpt: "Set priorities, connect the disciplines and make room to learn from your work.",
    description: "How a clear business starting point can guide a joined-up growth plan.",
    artwork: "/design/artwork/editorial-strategy-640.webp",
    cover: "/design/artwork/editorial-strategy-1200.webp",
    alt: "Original geometric strategy and growth illustration",
    minutes: 4,
    status: "Editorial sample",
    sections: [
      {
        slug: "understand-the-starting-point",
        title: "Understand the starting point",
        paragraphs: [
          "An effective plan starts with the business, not the list of available marketing channels. What does it offer, who benefits and what is currently difficult to explain or deliver?",
          "Make the starting assumptions explicit. A short shared picture of the situation is more useful than a complicated plan built on information nobody has verified."
        ]
      },
      {
        slug: "choose-the-priorities",
        title: "Choose the priorities",
        paragraphs: [
          "A useful plan makes tradeoffs visible. Decide which problem needs attention first, which activities depend on others and what can wait.",
          "A focused sequence is easier to explain and evaluate than a long list of tasks assigned the same urgency. Keep the first milestone specific enough to act on."
        ]
      },
      {
        slug: "connect-the-disciplines",
        title: "Connect the disciplines",
        paragraphs: [
          "Websites, content, creative production and marketing touch the same customer experience. Shared language helps the work feel coherent.",
          "Bring people together around the goal before debating tools. Once the purpose is clear, it becomes easier to choose which technology or channel is appropriate."
        ]
      },
      {
        slug: "make-room-to-learn",
        title: "Make room to learn",
        paragraphs: [
          "Review decisions at regular intervals. What has changed? Which assumptions still seem reasonable? Where does the team need better evidence?",
          "Use observations from actual work rather than invented results. A plan should be able to change without losing its underlying direction."
        ]
      },
      {
        slug: "agree-on-the-next-step",
        title: "Agree on the next step",
        paragraphs: [
          "Finish every planning conversation with a clear action, a responsible owner and a practical scope. That creates a useful bridge between strategic thinking and day-to-day execution.",
          "The point is shared progress, not the appearance of complexity. Keep the next step understandable to everyone who needs to participate."
        ]
      }
    ]
  },
  {
    slug: "social",
    title: "One message. A more coherent social presence.",
    category: "Social Media",
    excerpt: "Carry a brand story consistently from planning and shooting to editing and publishing.",
    description: "A connected approach to social content design, production and review.",
    artwork: "/design/artwork/editorial-social-640.webp",
    cover: "/design/artwork/editorial-social-1200.webp",
    alt: "Original abstract social media storytelling illustration",
    minutes: 4,
    status: "Editorial sample",
    sections: [
      {
        slug: "find-the-central-idea",
        title: "Find the central idea",
        paragraphs: [
          "Before planning a shoot or a posting schedule, decide what people should understand about the business. The central message can connect many formats without making every post look identical.",
          "Ask why that message matters to the audience and how it fits the wider business story."
        ]
      },
      {
        slug: "plan-the-content",
        title: "Plan the content",
        paragraphs: [
          "Give each piece a job. A short introduction, an explanation or a product demonstration may each need different visual pacing and supporting copy.",
          "Connect the brief with the practical work of filming, editing and publishing. Clear decisions early can prevent unnecessary changes later."
        ]
      },
      {
        slug: "create-with-consistency",
        title: "Create with consistency",
        paragraphs: [
          "A recognizable presence grows from repeated choices about tone, typography, color and the way information is introduced. Use a consistent system without flattening every idea into the same template.",
          "Keep captions and visuals complementary. Important details should remain understandable even when someone cannot hear a video or see every decorative element."
        ]
      },
      {
        slug: "review-before-publishing",
        title: "Review before publishing",
        paragraphs: [
          "Check factual statements, permissions, spelling, brand references and destination links. Make sure the published item says what the business intends it to say.",
          "Good production is also responsible production. Do not insert fabricated endorsements, unverified performance statistics or images of people without suitable permission."
        ]
      },
      {
        slug: "learn-from-the-work",
        title: "Learn from the work",
        paragraphs: [
          "Keep notes about creative decisions and the questions that arise during review. Compare observations with the original goals, but avoid drawing conclusions from a single isolated signal.",
          "Use the findings to improve the next brief and make the production process clearer for everyone involved."
        ]
      }
    ]
  }
] as const;

export function findArticle(slug: string | null | undefined): BlogArticle | undefined {
  return slug ? articles.find((article) => article.slug === slug) : undefined;
}

export function getRelatedArticles(slug: string, maxCount = 2): BlogArticle[] {
  return articles.filter((article) => article.slug !== slug).slice(0, maxCount);
}
