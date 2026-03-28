import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB || "10") * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return errorResponse("No file provided");
    if (!ALLOWED_TYPES.includes(file.type)) return errorResponse("Only images are allowed (jpg, png, gif, webp)");
    if (file.size > MAX_SIZE_MB) return errorResponse(`File too large. Max ${process.env.UPLOAD_MAX_SIZE_MB || 10}MB`);

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "chat");

    await mkdir(uploadDir, { recursive: true });
    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    const url = `/uploads/chat/${filename}`;
    return successResponse({ url });
  } catch (e) {
    return handleApiError(e);
  }
}
