import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 100 * 1024 * 1024;

function getExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
    "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
    "video/x-msvideo": "avi", "video/mpeg": "mpeg", "video/3gpp": "3gp",
  };
  return map[mimeType] || mimeType.split("/")[1] || "bin";
}

async function uploadToCloudinary(buffer: Buffer, mimeType: string, folder: string): Promise<string> {
  const isVideo = mimeType.startsWith("video/");
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `matchnest/${folder}`,
        resource_type: isVideo ? "video" : "image",
        public_id: randomUUID(),
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

async function uploadToLocal(buffer: Buffer, mimeType: string, folder: string): Promise<string> {
  const { writeFile, mkdir } = await import("fs/promises");
  const { join } = await import("path");
  const filename = `${randomUUID()}.${getExt(mimeType)}`;
  const dir = join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}

const hasCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const contentType = req.headers.get("content-type") || "";

    let buffer: Buffer;
    let mimeType: string;
    let folder = "general";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      folder = (formData.get("folder") as string) || "general";
      if (!file) return errorResponse("No file provided");
      const isImage = ALLOWED_IMAGES.includes(file.type);
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) return errorResponse(`Unsupported file type: ${file.type}`);
      if (file.size > MAX_SIZE) return errorResponse("File too large. Max 100MB");
      mimeType = file.type;
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      const body = await req.json();
      if (!body.image) return errorResponse("image or file is required");
      folder = body.folder || "general";
      const matches = (body.image as string).match(/^data:(.+);base64,(.+)$/);
      if (!matches) return errorResponse("Invalid base64 format");
      mimeType = matches[1];
      if (!ALLOWED_IMAGES.includes(mimeType)) return errorResponse(`Unsupported type: ${mimeType}`);
      buffer = Buffer.from(matches[2], "base64");
    }

    if (hasCloudinary) {
      const url = await uploadToCloudinary(buffer, mimeType, folder);
      return successResponse({ url });
    }

    // Local fallback (dev without Cloudinary)
    try {
      const url = await uploadToLocal(buffer, mimeType, folder);
      return successResponse({ url });
    } catch {
      // Vercel read-only fs — return base64 as last resort for images only
      if (mimeType.startsWith("video/")) return errorResponse("Video upload requires Cloudinary. Please configure CLOUDINARY_* env vars.");
      const base64Url = `data:${mimeType};base64,${buffer.toString("base64")}`;
      return successResponse({ url: base64Url });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
