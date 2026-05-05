import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EcosystemService from "@/models/EcosystemService";
import { requireRole, requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireAuth(req); // must be logged in to browse ecosystem services
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const query: Record<string, unknown> = { isActive: true };
    if (city) query.availableCities = { $in: [city, "all"] };
    const services = await EcosystemService.find(query).sort({ type: 1 });
    return successResponse({ services });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ["admin"]);
    await connectDB();
    const body = await req.json();
    const service = await EcosystemService.create(body);
    return successResponse({ service }, 201);
  } catch (e) { return handleApiError(e); }
}
