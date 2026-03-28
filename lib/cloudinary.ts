import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: string, folder = "roomrental"): Promise<string> {
  const result = await cloudinary.uploader.upload(file, { folder });
  return result.secure_url;
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getPublicIdFromUrl(url: string): string {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  return `${folder}/${filename.split(".")[0]}`;
}

export default cloudinary;
