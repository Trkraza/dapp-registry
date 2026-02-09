// // import { v2 as cloudinary } from "cloudinary";
// // import dotenv from "dotenv";
// // import path from "path";
// // import logger from "./logger";

// // dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// // // Helper function to check if Cloudinary is configured (evaluated at runtime)
// // function isCloudinaryConfigured(): boolean {
// //   return !!(
// //     process.env.CLOUDINARY_CLOUD_NAME &&
// //     process.env.CLOUDINARY_API_KEY &&
// //     process.env.CLOUDINARY_API_SECRET &&
// //     process.env.CLOUDINARY_API_KEY !== "your_api_key"
// //   );
// // }

// // export async function uploadImage(imageUrl: string): Promise<string> {
// //   // Check configuration at runtime, not at module load
// //   if (!isCloudinaryConfigured()) {
// //     logger.warn(
// //       "Cloudinary credentials not properly configured. Image uploads will be skipped.",
// //     );
// //     return imageUrl;
// //   }

// //   // Configure Cloudinary when actually needed
// //   cloudinary.config({
// //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
// //     api_key: process.env.CLOUDINARY_API_KEY!,
// //     api_secret: process.env.CLOUDINARY_API_SECRET!,
// //   });

// //   try {
// //     const result = await cloudinary.uploader.upload(imageUrl, {
// //       fetch_format: "auto",
// //       quality: "auto",
// //     });
// //     return result.secure_url;
// //   } catch (error) {
// //     logger.error({ imageUrl, error }, "Error uploading to Cloudinary.");
// //     return imageUrl;
// //   }
// // }
// import { v2 as cloudinary } from "cloudinary";
// import dotenv from "dotenv";
// import path from "path";
// import logger from "./logger";

// dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// // Helper function to check if Cloudinary is configured (evaluated at runtime)
// function isCloudinaryConfigured(): boolean {
//   return !!(
//     process.env.CLOUDINARY_CLOUD_NAME &&
//     process.env.CLOUDINARY_API_KEY &&
//     process.env.CLOUDINARY_API_SECRET &&
//     process.env.CLOUDINARY_API_KEY !== "your_api_key"
//   );
// }

// export async function uploadImage(
//   imageUrl: string,
//   slug: string, // 🆕 Added slug parameter
// ): Promise<string> {
//   // Check configuration at runtime, not at module load
//   if (!isCloudinaryConfigured()) {
//     logger.warn(
//       "Cloudinary credentials not properly configured. Image uploads will be skipped.",
//     );
//     return imageUrl;
//   }

//   // Configure Cloudinary when actually needed
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//     api_key: process.env.CLOUDINARY_API_KEY!,
//     api_secret: process.env.CLOUDINARY_API_SECRET!,
//   });

//   try {
//     // 🆕 Upload to specific folder with slug as filename
//     const result = await cloudinary.uploader.upload(imageUrl, {
//       folder: "dapp-store-logos", // 🎯 Your Cloudinary folder
//       public_id: slug, // 🎯 Use slug as filename
//       overwrite: false, // 🎯 Don't re-upload if exists
//       invalidate: true, // Invalidate CDN cache if updated
//       fetch_format: "auto",
//       quality: "auto",
//       resource_type: "image",
//     });

//     logger.info(
//       { slug, cloudinaryUrl: result.secure_url },
//       "Image uploaded to Cloudinary",
//     );
//     return result.secure_url;
//   } catch (error: any) {
//     // Check if error is because image already exists
//     if (
//       error?.http_code === 400 &&
//       error?.message?.includes("already exists")
//     ) {
//       logger.info(
//         { slug },
//         "Image already exists in Cloudinary, skipping upload",
//       );
//       // Construct the expected Cloudinary URL
//       const existingUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/dapp-store-logos/${slug}`;
//       return existingUrl;
//     }

//     logger.error({ imageUrl, slug, error }, "Error uploading to Cloudinary.");
//     return imageUrl;
//   }
// }
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";
import logger from "./logger";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Helper function to check if Cloudinary is configured (evaluated at runtime)
function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_KEY !== "your_api_key"
  );
}

// Generate hash of local file to detect changes
async function getFileHash(filePath: string): Promise<string | null> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash("md5").update(fileBuffer).digest("hex");
  } catch {
    return null;
  }
}

export async function uploadImage(
  imageUrl: string,
  slug: string,
  forceOverwrite: boolean = false, // 🆕 Option to force overwrite
): Promise<string> {
  // Check configuration at runtime, not at module load
  if (!isCloudinaryConfigured()) {
    logger.warn(
      "Cloudinary credentials not properly configured. Image uploads will be skipped.",
    );
    return imageUrl;
  }

  // Configure Cloudinary when actually needed
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });

  try {
    // Check if it's a local file
    const isLocalFile = !imageUrl.startsWith("http");
    let fileHash: string | null = null;

    if (isLocalFile) {
      fileHash = await getFileHash(imageUrl);
    }

    // Check if image already exists in Cloudinary
    let existingImage = null;
    try {
      existingImage = await cloudinary.api.resource(`dapp-store-logos/${slug}`);
    } catch {
      // Image doesn't exist, will upload fresh
    }

    // If image exists and we're not forcing overwrite, check if it's the same
    if (existingImage && !forceOverwrite) {
      // For local files, compare hash stored in metadata
      if (isLocalFile && fileHash) {
        const existingHash = existingImage.context?.custom?.file_hash;

        if (existingHash === fileHash) {
          logger.info({ slug }, "Image unchanged, skipping upload");
          return existingImage.secure_url;
        } else {
          logger.info({ slug }, "Image changed, will overwrite");
        }
      } else {
        // For remote URLs, skip if already exists
        logger.info(
          { slug },
          "Image already exists in Cloudinary, skipping upload",
        );
        return existingImage.secure_url;
      }
    }

    // Upload with overwrite enabled
    const uploadOptions: any = {
      folder: "dapp-store-logos",
      public_id: slug,
      overwrite: true, // 🆕 Always overwrite
      invalidate: true, // Invalidate CDN cache
      fetch_format: "auto",
      quality: "auto",
      resource_type: "image",
    };

    // Store file hash in metadata for future comparison
    if (fileHash) {
      uploadOptions.context = { file_hash: fileHash };
    }

    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);

    logger.info(
      { slug, cloudinaryUrl: result.secure_url },
      "Image uploaded to Cloudinary",
    );
    return result.secure_url;
  } catch (error: any) {
    logger.error({ imageUrl, slug, error }, "Error uploading to Cloudinary.");
    return imageUrl;
  }
}
