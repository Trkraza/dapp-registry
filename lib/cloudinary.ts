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

// export async function uploadImage(imageUrl: string): Promise<string> {
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
//     const result = await cloudinary.uploader.upload(imageUrl, {
//       fetch_format: "auto",
//       quality: "auto",
//     });
//     return result.secure_url;
//   } catch (error) {
//     logger.error({ imageUrl, error }, "Error uploading to Cloudinary.");
//     return imageUrl;
//   }
// }
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
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

export async function uploadImage(
  imageUrl: string,
  slug: string, // 🆕 Added slug parameter
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
    // 🆕 Upload to specific folder with slug as filename
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "dapp-store-logos", // 🎯 Your Cloudinary folder
      public_id: slug, // 🎯 Use slug as filename
      overwrite: false, // 🎯 Don't re-upload if exists
      invalidate: true, // Invalidate CDN cache if updated
      fetch_format: "auto",
      quality: "auto",
      resource_type: "image",
    });

    logger.info(
      { slug, cloudinaryUrl: result.secure_url },
      "Image uploaded to Cloudinary",
    );
    return result.secure_url;
  } catch (error: any) {
    // Check if error is because image already exists
    if (
      error?.http_code === 400 &&
      error?.message?.includes("already exists")
    ) {
      logger.info(
        { slug },
        "Image already exists in Cloudinary, skipping upload",
      );
      // Construct the expected Cloudinary URL
      const existingUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/dapp-store-logos/${slug}`;
      return existingUrl;
    }

    logger.error({ imageUrl, slug, error }, "Error uploading to Cloudinary.");
    return imageUrl;
  }
}
