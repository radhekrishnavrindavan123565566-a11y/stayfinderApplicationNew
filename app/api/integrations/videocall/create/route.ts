import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { requireAuth } from "@/lib/auth";
import { createVideoRoom, isVideoCallConfigured } from "@/lib/integrations/videocall";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { z } from "zod";

const createVideoRoomSchema = z.object({
  bookingId: z.string().min(1),
  duration: z.number().optional().default(60),
  recordingEnabled: z.boolean().optional().default(false),
  maxParticipants: z.number().optional().default(100),
});

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);

    if (!isVideoCallConfigured()) {
      return errorResponse("Video call service not configured", 503);
    }

    await connectDB();

    const body = await req.json();
    const parsed = createVideoRoomSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { bookingId, duration, recordingEnabled, maxParticipants } = parsed.data;

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate("propertyId")
      .populate("tenantId");

    if (!booking) {
      return errorResponse("Booking not found", 404);
    }

    // Verify user is involved in the booking
    if (booking.tenantId._id.toString() !== user.userId && booking.ownerId.toString() !== user.userId) {
      return errorResponse("Forbidden", 403);
    }

    // Create video room
    const videoRoom = await createVideoRoom({
      provider: (process.env.NEXT_PUBLIC_VIDEO_PROVIDER as any) || "daily",
      duration,
      recordingEnabled,
      maxParticipants,
    });

    // Store video room info in booking
    booking.videoRoom = {
      roomId: videoRoom.roomId,
      roomUrl: videoRoom.roomUrl,
      provider: videoRoom.provider,
      createdAt: new Date(),
      expiresAt: videoRoom.expiresAt,
    };

    await booking.save();

    return successResponse(
      {
        success: true,
        videoRoom,
        message: "Video room created successfully",
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
