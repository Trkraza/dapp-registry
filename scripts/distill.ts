// // import { promises as fs } from 'fs';
// // import path from 'path';
// // import { z } from 'zod';
// // import { metaJsonSchema, appsMinSchema } from '../lib/schema';
// // import { uploadImage } from '../lib/cloudinary';
// // import dotenv from 'dotenv';
// // import crypto from 'crypto';
// // import logger from '../lib/logger'; // Import the logger

// // dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// // export default async function distill(appsDir: string, dataDir: string) { // Parameterized
// //   let allApps: z.infer<typeof metaJsonSchema>[] = [];
// //   const processedApps: z.infer<typeof appsMinSchema> = [];
// //   const allSlugs: string[] = [];

// //   // Ensure data directory exists
// //   await fs.mkdir(dataDir, { recursive: true });

// //   const slugs = await fs.readdir(appsDir);

// //   for (const slug of slugs) {
// //     const metaPath = path.join(appsDir, slug, 'meta.json');
// //     try {
// //       const fileContent = await fs.readFile(metaPath, 'utf-8');
// //       const meta = metaJsonSchema.parse(JSON.parse(fileContent)); // Validate and parse

// //       allApps.push(meta);
// //       allSlugs.push(meta.slug);

// //       let finalLogoUrl = meta.logoUrl; // This will be the URL used in apps.min.json

// //       // Determine the image source path for potential upload
// //       const imageSourcePath = meta.logoUrl.startsWith('http')
// //         ? meta.logoUrl // It's an external URL
// //         : path.join(appsDir, slug, meta.logoUrl); // It's a local relative path (uses appsDir)

// //       // Only attempt Cloudinary upload if it's not already a Cloudinary URL
// //       if (!meta.logoUrl.startsWith('https://res.cloudinary.com')) {
// //         logger.info(`Processing image for ${meta.slug}: ${imageSourcePath}`);
// //         const uploadedUrl = await uploadImage(imageSourcePath);

// //         // If uploadImage returns a Cloudinary URL, update finalLogoUrl and potentially meta.json
// //         if (uploadedUrl.startsWith('https://res.cloudinary.com')) {
// //           finalLogoUrl = uploadedUrl;
// //           // Only write back to meta.json if the URL has actually changed to a Cloudinary URL
// //           if (finalLogoUrl !== meta.logoUrl) {
// //             const updatedMeta = { ...meta, logoUrl: finalLogoUrl };
// //             await fs.writeFile(metaPath, JSON.stringify(updatedMeta, null, 2), 'utf-8');
// //             logger.info({ metaPath, finalLogoUrl }, 'Updated meta.json with Cloudinary URL.');
// //           }
// //         } else {
// //           // Cloudinary was bypassed or failed, finalLogoUrl remains the original (local or external non-cloudinary)
// //           logger.warn({ slug: meta.slug, originalLogoUrl: meta.logoUrl }, 'Cloudinary upload skipped or failed. Keeping original logoUrl.');
// //           finalLogoUrl = meta.logoUrl; // Ensure finalLogoUrl for apps.min.json is the original one
// //         }
// //       }

// //       // Prepare for apps.min.json
// //       processedApps.push({
// //         slug: meta.slug,
// //         name: meta.name,
// //         logoUrl: finalLogoUrl, // Use the determined final URL
// //         category: meta.category,
// //         chains: meta.chains,
// //         tags: meta.tags,
// //         pricing: meta.pricing,
// //         short: meta.content.short,
// //         updatedAt: new Date().toISOString(), // ISO Timestamp
// //       });

// //     } catch (error) {
// //       logger.error({ metaPath, error }, 'Error processing meta.json.');
// //       // Continue processing other apps even if one fails
// //     }
// //   }

// //   // Generate data/apps.min.json
// //   const appsMinJsonContent = JSON.stringify(processedApps, null, 2);
// //   await fs.writeFile(
// //     path.join(dataDir, 'apps.min.json'), // Use dataDir parameter
// //     appsMinJsonContent,
// //     'utf-8'
// //   );
// //   logger.info('Generated data/apps.min.json');

// //   // Generate data/slugs.json (not explicitly in plan but good practice)
// //   const slugsJsonContent = JSON.stringify(allSlugs, null, 2);
// //   await fs.writeFile(
// //     path.join(dataDir, 'slugs.json'), // Use dataDir parameter
// //     slugsJsonContent,
// //     'utf-8'
// //   );
// //   logger.info('Generated data/slugs.json');

// //   // HMAC signature generation
// //   const hmacSecret = process.env.HMAC_SECRET;
// //   if (!hmacSecret || hmacSecret === 'super_secret_hmac_key') { // Check for placeholder
// //     logger.warn('HMAC_SECRET is not set or is a placeholder. Skipping HMAC signature generation.');
// //   } else {
// //     const hmac = crypto.createHmac('sha256', hmacSecret);
// //     hmac.update(appsMinJsonContent); // Sign the apps.min.json content
// //     const signature = hmac.digest('hex');
// //     logger.info({ signature }, 'Generated HMAC-SHA256 signature for apps.min.json.');
// //     // In a real scenario, this signature would be used in the revalidation webhook
// //   }

// //   logger.info('Distillation complete.');
// // }
// import { promises as fs } from "fs";
// import path from "path";
// import { z } from "zod";
// import { metaJsonSchema, appsMinSchema } from "../lib/schema";
// import { uploadImage } from "../lib/cloudinary"; // Import updated function
// import dotenv from "dotenv";
// import crypto from "crypto";
// import logger from "../lib/logger";

// dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// export default async function distill(appsDir: string, dataDir: string) {
//   let allApps: z.infer<typeof metaJsonSchema>[] = [];
//   const processedApps: z.infer<typeof appsMinSchema> = [];
//   const allSlugs: string[] = [];

//   // Ensure data directory exists
//   await fs.mkdir(dataDir, { recursive: true });

//   const slugs = await fs.readdir(appsDir);

//   for (const slug of slugs) {
//     const metaPath = path.join(appsDir, slug, "meta.json");
//     try {
//       const fileContent = await fs.readFile(metaPath, "utf-8");
//       const meta = metaJsonSchema.parse(JSON.parse(fileContent));

//       allApps.push(meta);
//       allSlugs.push(meta.slug);

//       let finalLogoUrl = meta.logoUrl;

//       // Determine the image source path for potential upload
//       const imageSourcePath = meta.logoUrl.startsWith("http")
//         ? meta.logoUrl
//         : path.join(appsDir, slug, meta.logoUrl);

//       // Only attempt Cloudinary upload if it's not already a Cloudinary URL
//       if (!meta.logoUrl.startsWith("https://res.cloudinary.com")) {
//         logger.info(`Processing image for ${meta.slug}: ${imageSourcePath}`);

//         // 🆕 Pass slug to uploadImage function
//         const uploadedUrl = await uploadImage(imageSourcePath, slug);

//         // If uploadImage returns a Cloudinary URL, update finalLogoUrl and meta.json
//         if (uploadedUrl.startsWith("https://res.cloudinary.com")) {
//           finalLogoUrl = uploadedUrl;

//           // 🆕 Always update meta.json with Cloudinary URL
//           if (finalLogoUrl !== meta.logoUrl) {
//             const updatedMeta = { ...meta, logoUrl: finalLogoUrl };
//             await fs.writeFile(
//               metaPath,
//               JSON.stringify(updatedMeta, null, 2),
//               "utf-8",
//             );
//             logger.info(
//               {
//                 slug: meta.slug,
//                 metaPath,
//                 finalLogoUrl,
//               },
//               "✅ Updated meta.json with Cloudinary URL.",
//             );
//           }
//         } else {
//           logger.warn(
//             {
//               slug: meta.slug,
//               originalLogoUrl: meta.logoUrl,
//             },
//             "Cloudinary upload skipped or failed. Keeping original logoUrl.",
//           );
//           finalLogoUrl = meta.logoUrl;
//         }
//       } else {
//         logger.info(
//           { slug: meta.slug },
//           "Already using Cloudinary URL, skipping upload",
//         );
//       }

//       // Prepare for apps.min.json
//       processedApps.push({
//         slug: meta.slug,
//         name: meta.name,
//         logoUrl: finalLogoUrl,
//         category: meta.category,
//         chains: meta.chains,
//         tags: meta.tags,
//         pricing: meta.pricing,
//         short: meta.content.short,
//         updatedAt: new Date().toISOString(),
//       });
//     } catch (error) {
//       logger.error({ metaPath, error }, "Error processing meta.json.");
//     }
//   }

//   // Generate data/apps.min.json
//   const appsMinJsonContent = JSON.stringify(processedApps, null, 2);
//   await fs.writeFile(
//     path.join(dataDir, "apps.min.json"),
//     appsMinJsonContent,
//     "utf-8",
//   );
//   logger.info("Generated data/apps.min.json");

//   // Generate data/slugs.json
//   const slugsJsonContent = JSON.stringify(allSlugs, null, 2);
//   await fs.writeFile(
//     path.join(dataDir, "slugs.json"),
//     slugsJsonContent,
//     "utf-8",
//   );
//   logger.info("Generated data/slugs.json");

//   // HMAC signature generation
//   const hmacSecret = process.env.HMAC_SECRET;
//   if (!hmacSecret || hmacSecret === "super_secret_hmac_key") {
//     logger.warn(
//       "HMAC_SECRET is not set or is a placeholder. Skipping HMAC signature generation.",
//     );
//   } else {
//     const hmac = crypto.createHmac("sha256", hmacSecret);
//     hmac.update(appsMinJsonContent);
//     const signature = hmac.digest("hex");
//     logger.info(
//       { signature },
//       "Generated HMAC-SHA256 signature for apps.min.json.",
//     );
//   }

//   logger.info("✅ Distillation complete.");
// }
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { metaJsonSchema, appsMinSchema } from "../lib/schema";
import { uploadImage } from "../lib/cloudinary";
import dotenv from "dotenv";
import crypto from "crypto";
import logger from "../lib/logger";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export default async function distill(
  appsDir: string,
  dataDir: string,
  slugsToProcess?: string[],
) {
  // Ensure data directory exists
  await fs.mkdir(dataDir, { recursive: true });

  const appsMinPath = path.join(dataDir, "apps.min.json");
  const slugsJsonPath = path.join(dataDir, "slugs.json");

  // Load existing apps.min.json if it exists
  let existingApps: z.infer<typeof appsMinSchema> = [];
  try {
    const existingContent = await fs.readFile(appsMinPath, "utf-8");
    existingApps = JSON.parse(existingContent);
    logger.info(
      `Loaded existing apps.min.json with ${existingApps.length} apps`,
    );
  } catch {
    logger.info("No existing apps.min.json found, creating new one");
  }

  // Load existing slugs.json if it exists
  let existingSlugs: string[] = [];
  try {
    const existingContent = await fs.readFile(slugsJsonPath, "utf-8");
    existingSlugs = JSON.parse(existingContent);
  } catch {
    logger.info("No existing slugs.json found, creating new one");
  }

  // Determine which slugs to process
  const allDirSlugs = await fs.readdir(appsDir);
  const slugsForProcessing =
    slugsToProcess && slugsToProcess.length > 0 ? slugsToProcess : allDirSlugs;

  if (slugsToProcess && slugsToProcess.length > 0) {
    logger.info(`Processing only changed dapps: ${slugsToProcess.join(", ")}`);
  } else {
    logger.info("Processing all dapps (full rebuild).");
  }

  // Process only the changed/new slugs
  for (const slug of slugsForProcessing) {
    const metaPath = path.join(appsDir, slug, "meta.json");
    try {
      const fileContent = await fs.readFile(metaPath, "utf-8");
      const meta = metaJsonSchema.parse(JSON.parse(fileContent));

      let finalLogoUrl = meta.logoUrl;

      // Process image if not already on Cloudinary
      if (!meta.logoUrl.startsWith("https://res.cloudinary.com")) {
        const imageSourcePath = meta.logoUrl.startsWith("http")
          ? meta.logoUrl
          : path.join(appsDir, slug, meta.logoUrl);

        logger.info(`Processing image for ${meta.slug}: ${imageSourcePath}`);

        const uploadedUrl = await uploadImage(imageSourcePath, slug);

        if (uploadedUrl.startsWith("https://res.cloudinary.com")) {
          finalLogoUrl = uploadedUrl;

          if (finalLogoUrl !== meta.logoUrl) {
            const updatedMeta = { ...meta, logoUrl: finalLogoUrl };
            await fs.writeFile(
              metaPath,
              JSON.stringify(updatedMeta, null, 2),
              "utf-8",
            );
            logger.info(
              { slug: meta.slug, metaPath, finalLogoUrl },
              "✅ Updated meta.json with Cloudinary URL.",
            );
          }
        } else {
          logger.warn(
            { slug: meta.slug, originalLogoUrl: meta.logoUrl },
            "Cloudinary upload skipped or failed. Keeping original logoUrl.",
          );
          finalLogoUrl = meta.logoUrl;
        }
      } else {
        logger.info(
          { slug: meta.slug },
          "Already using Cloudinary URL, skipping upload",
        );
      }

      // Create the app entry
      const appEntry = {
        slug: meta.slug,
        name: meta.name,
        logoUrl: finalLogoUrl,
        category: meta.category,
        chains: meta.chains,
        tags: meta.tags,
        pricing: meta.pricing,
        short: meta.content.short,
        updatedAt: new Date().toISOString(),
      };

      // Update or add to existing apps
      const existingIndex = existingApps.findIndex((app) => app.slug === slug);
      if (existingIndex >= 0) {
        existingApps[existingIndex] = appEntry;
        logger.info({ slug }, "✅ Updated existing app in apps.min.json");
      } else {
        existingApps.push(appEntry);
        logger.info({ slug }, "✅ Added new app to apps.min.json");
      }

      // Update slugs list
      if (!existingSlugs.includes(slug)) {
        existingSlugs.push(slug);
      }
    } catch (error) {
      logger.error({ metaPath, error }, "Error processing meta.json.");
    }
  }

  // Write updated apps.min.json
  const appsMinJsonContent = JSON.stringify(existingApps, null, 2);
  await fs.writeFile(appsMinPath, appsMinJsonContent, "utf-8");
  logger.info(
    `Generated data/apps.min.json (${existingApps.length} total apps)`,
  );

  // Write updated slugs.json
  const slugsJsonContent = JSON.stringify(existingSlugs, null, 2);
  await fs.writeFile(slugsJsonPath, slugsJsonContent, "utf-8");
  logger.info("Generated data/slugs.json");

  // HMAC signature generation
  const hmacSecret = process.env.HMAC_SECRET;
  if (!hmacSecret || hmacSecret === "super_secret_hmac_key") {
    logger.warn(
      "HMAC_SECRET is not set or is a placeholder. Skipping HMAC signature generation.",
    );
  } else {
    const hmac = crypto.createHmac("sha256", hmacSecret);
    hmac.update(appsMinJsonContent);
    const signature = hmac.digest("hex");
    logger.info(
      { signature },
      "Generated HMAC-SHA256 signature for apps.min.json.",
    );
  }

  logger.info("✅ Distillation complete.");
}
