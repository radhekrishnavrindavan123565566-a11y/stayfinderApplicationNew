import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

// Map MIME type to file extension
function getExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
    "video/x-msvideo": "avi",
    "video/avi": "avi",
    "video/mpeg": "mpeg",
    "video/3gpp": "3gp",
    "video/x-matroska": "mkv",
  };
  return map[mimeType] || mimeType.split("/")[1] || "bin";
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "general";
      if (!file) return errorResponse("No file provided");

      const isImage = ALLOWED_IMAGES.includes(file.type);
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) return errorResponse(`Unsupported file type: ${file.type}`);
      if (file.size > MAX_SIZE) return errorResponse("File too large. Max 100MB");

      const ext = getExt(file.type);
      const filename = `${randomUUID()}.${ext}`;
      const uploadDir = join(process.cwd(), "public", "uploads", folder);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
      return successResponse({ url: `/uploads/${folder}/${filename}` });
    }

    // Base64 JSON upload (images only)
    const { image, folder = "general" } = await req.json();
    if (!image) return errorResponse("image (base64) or file (multipart) is required");

    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return errorResponse("Invalid base64 image format");
    const mimeType = matches[1];
    const base64Data = matches[2];
    if (!ALLOWED_IMAGES.includes(mimeType)) return errorResponse(`Unsupported file type: ${mimeType}`);

    const ext = getExt(mimeType);
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), Buffer.from(base64Data, "base64"));
    return successResponse({ url: `/uploads/${folder}/${filename}` });
  } catch (error) {
    return handleApiError(error);
  }
}
