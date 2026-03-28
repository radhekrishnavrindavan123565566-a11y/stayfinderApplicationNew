import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "general";
      if (!file) return errorResponse("No file provided");
      if (!ALLOWED.includes(file.type)) return errorResponse("Unsupported file type");
      if (file.size > MAX_SIZE) return errorResponse("File too large. Max 10MB");

      const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
      const filename = `${randomUUID()}.${ext}`;
      const uploadDir = join(process.cwd(), "public", "uploads", folder);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
      return successResponse({ url: `/uploads/${folder}/${filename}` });
    }

    // Base64 JSON upload
    const { image, folder = "general" } = await req.json();
    if (!image) return errorResponse("image (base64) or file (multipart) is required");

    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return errorResponse("Invalid base64 image format");
    const mimeType = matches[1];
    const base64Data = matches[2];
    if (!ALLOWED.includes(mimeType)) return errorResponse("Unsupported file type");

    const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), Buffer.from(base64Data, "base64"));
    return successResponse({ url: `/uploads/${folder}/${filename}` });
  } catch (error) {
    return handleApiError(error);
  }
}
