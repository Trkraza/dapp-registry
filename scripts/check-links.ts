// import { promises as fs } from 'fs';
// import path from 'path';
// import { metaJsonSchema } from '../lib/schema';
// import logger from '../lib/logger';
// import fetch, { Response } from 'node-fetch'; // Import Response as well
// import { z } from 'zod';

// // Define the root directory for apps data
// const APPS_DIR = path.join(process.cwd(), 'data', 'apps');

// // Helper to extract all URLs from a meta.json entry
// function extractUrls(meta: z.infer<typeof metaJsonSchema>): string[] {
//   const urls: string[] = [];

//   // Add logoUrl if it's an external URL
//   if (meta.logoUrl.startsWith('http')) {
//     urls.push(meta.logoUrl);
//   }

//   // Add all links from the links object
//   for (const key in meta.links) {
//     const url = meta.links[key as keyof typeof meta.links];
//     if (url && typeof url === 'string' && url.startsWith('http')) {
//       urls.push(url);
//     }
//   }
//   return urls;
// }

// async function checkLink(url: string): Promise<{ url: string; status: 'accessible' | 'inaccessible'; statusCode?: number; error?: string }> {
//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

//   try {
//     const response = await fetch(url, { method: 'HEAD', signal: controller.signal }); // Pass the signal
//     clearTimeout(timeoutId); // Clear the timeout if fetch resolves/rejects before timeout

//     if (response.ok) {
//       return { url, status: 'accessible', statusCode: response.status };
//     } else {
//       return { url, status: 'inaccessible', statusCode: response.status, error: response.statusText };
//     }
//   } catch (error: any) {
//     clearTimeout(timeoutId); // Ensure timeout is cleared on error as well
//     if (error.name === 'AbortError') {
//       return { url, status: 'inaccessible', error: `Timeout of 5000ms exceeded for ${url}.` };
//     }
//     return { url, status: 'inaccessible', error: error.message };
//   }
// }

// export default async function checkLinksScript(appsDir: string = APPS_DIR) { // Exported as default and parameterized
//   logger.info('Starting link accessibility check...');
//   let hasBrokenLinks = false;
//   const allLinksToCheck: { dappSlug: string; url: string; type: string }[] = [];

//   try {
//     const slugs = await fs.readdir(appsDir); // Use appsDir parameter

//     for (const slug of slugs) {
//       const metaPath = path.join(appsDir, slug, 'meta.json'); // Use appsDir parameter
//       try {
//         const fileContent = await fs.readFile(metaPath, 'utf-8');
//         const meta = metaJsonSchema.parse(JSON.parse(fileContent)); // Validate and parse

//         // Extract logoUrl
//         if (meta.logoUrl.startsWith('http') && !meta.logoUrl.startsWith('https://res.cloudinary.com')) {
//           allLinksToCheck.push({ dappSlug: slug, url: meta.logoUrl, type: 'logoUrl' });
//         }

//         // Extract other links
//         for (const key in meta.links) {
//           const url = meta.links[key as keyof typeof meta.links];
//           if (url && typeof url === 'string' && url.startsWith('http')) {
//             allLinksToCheck.push({ dappSlug: slug, url, type: `link:${key}` });
//           }
//         }

//       } catch (error: any) {
//         logger.error({ metaPath, error }, 'Error processing meta.json for link extraction.');
//         hasBrokenLinks = true; // Consider parsing errors as broken, or handle separately
//       }
//     }

//     // Check all collected links concurrently
//     const checkPromises = allLinksToCheck.map(async (link) => {
//       const result = await checkLink(link.url);
//       if (result.status === 'accessible') {
//         logger.info({ dappSlug: link.dappSlug, type: link.type, url: link.url, statusCode: result.statusCode }, 'Link accessible.');
//       } else {
//         logger.error({ dappSlug: link.dappSlug, type: link.type, url: link.url, statusCode: result.statusCode, error: result.error }, 'Link inaccessible.');
//         hasBrokenLinks = true;
//       }
//     });

//     await Promise.all(checkPromises);

//   } catch (error: any) {
//     logger.error({ error }, 'Error reading APPS_DIR or during link checking process.');
//     hasBrokenLinks = true;
//   }

//   if (hasBrokenLinks) {
//     logger.error('Link accessibility check failed: Some links are inaccessible.');
//     throw new Error('Link accessibility check failed'); // Throw error for testing
//   } else {
//     logger.info('All external links are accessible.');
//   }
// }
import { promises as fs } from "fs";
import path from "path";
import { metaJsonSchema } from "../lib/schema";
import logger from "../lib/logger";
import fetch, { Response } from "node-fetch";
import { z } from "zod";

// Define the root directory for apps data
const APPS_DIR = path.join(process.cwd(), "data", "apps");

// Helper to extract all URLs from a meta.json entry
function extractUrls(meta: z.infer<typeof metaJsonSchema>): string[] {
  const urls: string[] = [];

  // Add logoUrl if it's an external URL
  if (meta.logoUrl.startsWith("http")) {
    urls.push(meta.logoUrl);
  }

  // Add all links from the links object
  for (const key in meta.links) {
    const url = meta.links[key as keyof typeof meta.links];
    if (url && typeof url === "string" && url.startsWith("http")) {
      urls.push(url);
    }
  }
  return urls;
}

async function checkLink(
  url: string,
): Promise<{
  url: string;
  status: "accessible" | "inaccessible";
  statusCode?: number;
  error?: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    // Use GET with browser headers to avoid bot detection
    const response = await fetch(url, {
      method: "GET", // Changed from HEAD - more like a real browser
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return { url, status: "accessible", statusCode: response.status };
    } else {
      return {
        url,
        status: "inaccessible",
        statusCode: response.status,
        error: response.statusText,
      };
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      return {
        url,
        status: "inaccessible",
        error: `Timeout of 5000ms exceeded for ${url}.`,
      };
    }
    return { url, status: "inaccessible", error: error.message };
  }
}

export default async function checkLinksScript(appsDir: string = APPS_DIR) {
  logger.info("Starting link accessibility check...");
  let hasBrokenLinks = false;
  const allLinksToCheck: { dappSlug: string; url: string; type: string }[] = [];

  try {
    const slugs = await fs.readdir(appsDir);

    for (const slug of slugs) {
      const metaPath = path.join(appsDir, slug, "meta.json");
      try {
        const fileContent = await fs.readFile(metaPath, "utf-8");
        const meta = metaJsonSchema.parse(JSON.parse(fileContent));

        // Extract logoUrl
        if (
          meta.logoUrl.startsWith("http") &&
          !meta.logoUrl.startsWith("https://res.cloudinary.com")
        ) {
          allLinksToCheck.push({
            dappSlug: slug,
            url: meta.logoUrl,
            type: "logoUrl",
          });
        }

        // Extract other links
        for (const key in meta.links) {
          const url = meta.links[key as keyof typeof meta.links];
          if (url && typeof url === "string" && url.startsWith("http")) {
            allLinksToCheck.push({ dappSlug: slug, url, type: `link:${key}` });
          }
        }
      } catch (error: any) {
        logger.error(
          { metaPath, error },
          "Error processing meta.json for link extraction.",
        );
        hasBrokenLinks = true;
      }
    }

    // Check all collected links concurrently
    const checkPromises = allLinksToCheck.map(async (link) => {
      const result = await checkLink(link.url);
      if (result.status === "accessible") {
        logger.info(
          {
            dappSlug: link.dappSlug,
            type: link.type,
            url: link.url,
            statusCode: result.statusCode,
          },
          "Link accessible.",
        );
      } else {
        logger.error(
          {
            dappSlug: link.dappSlug,
            type: link.type,
            url: link.url,
            statusCode: result.statusCode,
            error: result.error,
          },
          "Link inaccessible.",
        );
        hasBrokenLinks = true;
      }
    });

    await Promise.all(checkPromises);
  } catch (error: any) {
    logger.error(
      { error },
      "Error reading APPS_DIR or during link checking process.",
    );
    hasBrokenLinks = true;
  }

  if (hasBrokenLinks) {
    logger.error(
      "Link accessibility check failed: Some links are inaccessible.",
    );
    throw new Error("Link accessibility check failed");
  } else {
    logger.info("All external links are accessible.");
  }
}
