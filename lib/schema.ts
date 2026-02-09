import { z } from "zod";

export const metaJsonSchema = z.object({
  slug: z.string(), // Must match parent folder name
  name: z.string(),
  logoUrl: z.string(), // Can be "./logo.png" or "https://..."
  category: z.string(), // e.g., "DeFi", "NFT"
  chains: z.array(z.string()),
  tags: z.array(z.string()),
  pricing: z.string(), // e.g., "Free", "Paid"
  content: z.object({
    short: z.string().max(160),
    description: z.string(), // Markdown supported
    meta: z.string().max(160), // SEO Description
    pageTitle: z.string(), // Browser Title
  }),
  links: z.object({
    website: z.string().url(),
    github: z.string().url().optional(),
    docs: z.string().url().optional(),
    twitter: z.string().url().optional(),
    telegram: z.string().url().optional(),
    discord: z.string().url().optional(),
  }),
  relations: z.object({
    alternatives: z.array(z.string()), // Array of existing slugs
    related: z.array(z.string()), // Array of existing slugs
  }),
  source: z
    .object({
      fullyScraped: z.boolean().default(true),
    })
    .optional(),
});

export const appsMinSchema = z.array(
  z.object({
    slug: z.string(),
    name: z.string(),
    logoUrl: z.string(), // Always a Cloudinary URL
    category: z.string(),
    chains: z.array(z.string()),
    tags: z.array(z.string()),
    pricing: z.string(),
    short: z.string(),
    updatedAt: z.string().datetime(), // ISO Timestamp
  }),
);
