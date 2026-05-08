import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EmergencyContact from "@/models/EmergencyContact";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError, errorResponse } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);

    let contact = await EmergencyContact.findOne({ userId: user.userId });

    if (!contact) {
      // Create default emergency contact
      contact = await EmergencyContact.create({
        userId: user.userId,
        contacts: [],
        localEmergencyServices: {
          police: "100",
          ambulance: "108",
          fire: "101",
        },
      });
    }

    return successResponse({ contact });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const body = await req.json();

    const contact = await EmergencyContact.findOneAndUpdate(
      { userId: user.userId },
      { $set: body },
      { new: true, upsert: true }
    );

    return successResponse({ contact }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
