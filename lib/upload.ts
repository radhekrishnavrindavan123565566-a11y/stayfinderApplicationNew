import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureUploadDir(folder: string) {
  const dir = path.join(UPLOAD_DIR, folder);
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Save a base64 data URL or Buffer to local /public/uploads/<folder>/
 * Returns the public URL path e.g. /uploads/properties/abc123.jpg
 */
export async function uploadFile(
  input: string | Buffer,
  folder = "general"
): Promise<string> {
  const dir = await ensureUploadDir(folder);

  let buffer: Buffer;
  let ext = "jpg";

  if (typeof input === "string") {
    // Handle base64 data URL: "data:image/png;base64,..."
    const match = input.match(/^data:(.+?);base64,(.+)$/);
    if (match) {
      const mime = match[1]; // e.g. image/png
      ext = mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
      buffer = Buffer.from(match[2], "base64");
    } else {
      throw new Error("Invalid file format. Expected base64 data URL.");
    }
  } else {
    buffer = input;
  }

  const filename = `${randomUUID()}.${ext}`;
  const filepath = path.join(dir, filename);
  await writeFile(filepath, buffer);

  return `/uploads/${folder}/${filename}`;
}

/**
 * Delete a file given its public URL path
 */
export async function deleteFile(publicUrl: string): Promise<void> {
  try {
    const { unlink } = await import("fs/promises");
    const filepath = path.join(process.cwd(), "public", publicUrl);
    await unlink(filepath);
  } catch {
    // File may not exist — ignore
  }
}
