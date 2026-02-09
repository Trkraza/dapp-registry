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

export async function uploadImage(imageUrl: string): Promise<string> {
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
    const result = await cloudinary.uploader.upload(imageUrl, {
      fetch_format: "auto",
      quality: "auto",
    });
    return result.secure_url;
  } catch (error) {
    logger.error({ imageUrl, error }, "Error uploading to Cloudinary.");
    return imageUrl;
  }
}
