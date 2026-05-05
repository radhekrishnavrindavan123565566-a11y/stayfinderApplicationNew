import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES: Record<string, string> = {
  // Images
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  // Videos
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  // Documents
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/plain": "txt",
  "application/zip": "zip",
};

const MAX_SIZE_BYTES = parseInt(process.env.UPLOAD_MAX_SIZE_MB || "50") * 1024 * 1024;

function getMediaType(mimeType: string): "image" | "video" | "file" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return errorResponse("No file provided");

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) return errorResponse(`File type not allowed: ${file.type}`);
    if (file.size > MAX_SIZE_BYTES) return errorResponse(`File too large. Max ${process.env.UPLOAD_MAX_SIZE_MB || 50}MB`);

    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "chat");

    await mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    const url = `/uploads/chat/${filename}`;
    const mediaType = getMediaType(file.type);

    return successResponse({ url, mediaType, filename: file.name });
  } catch (e) {
    return handleApiError(e);
  }
}
