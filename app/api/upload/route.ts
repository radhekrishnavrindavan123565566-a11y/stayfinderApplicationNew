import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { randomUUID } from "crypto";

const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

function getExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
    "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
    "video/x-msvideo": "avi", "video/avi": "avi", "video/mpeg": "mpeg",
    "video/3gpp": "3gp", "video/x-matroska": "mkv",
  };
  return map[mimeType] || mimeType.split("/")[1] || "bin";
}

// ── Local disk upload (dev only) ──
async function uploadToLocal(buffer: Buffer, mimeType: string, folder: string): Promise<string> {
  const { writeFile, mkdir } = await import("fs/promises");
  const { join } = await import("path");
  const ext = getExt(mimeType);
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const contentType = req.headers.get("content-type") || "";

    let buffer: Buffer;
    let mimeType: string;
    let folder = "general";
    let originalBase64: string | null = null;

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
      // For videos, convert to base64 data URL for storage in DB (no disk needed)
      if (isVideo) {
        originalBase64 = `data:${mimeType};base64,${buffer.toString("base64")}`;
      }
    } else {
      // Base64 JSON (images only)
      const body = await req.json();
      if (!body.image) return errorResponse("image (base64) or file (multipart) is required");
      folder = body.folder || "general";

      const matches = (body.image as string).match(/^data:(.+);base64,(.+)$/);
      if (!matches) return errorResponse("Invalid base64 image format");
      mimeType = matches[1];
      if (!ALLOWED_IMAGES.includes(mimeType)) return errorResponse(`Unsupported file type: ${mimeType}`);
      buffer = Buffer.from(matches[2], "base64");
      originalBase64 = body.image; // Keep original data URL
    }

    // For videos, return base64 data URL directly (works everywhere, no disk needed)
    if (mimeType.startsWith("video/") && originalBase64) {
      return successResponse({ url: originalBase64 });
    }

    // For images, try local disk (dev) or fall back to base64 (production)
    try {
      const url = await uploadToLocal(buffer, mimeType, folder);
      return successResponse({ url });
    } catch (diskErr) {
      // Disk write failed (Vercel production) — return base64 data URL
      const base64Url = originalBase64 || `data:${mimeType};base64,${buffer.toString("base64")}`;
      return successResponse({ url: base64Url });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
