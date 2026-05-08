import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authResult = requireAuth(req);
    if (!authResult) return errorResponse("Unauthorized", 401);
    const { userId } = authResult;
    const { propertyId } = await req.json();
    if (!propertyId) return errorResponse("propertyId is required");

    const user = await User.findById(userId);
    if (!user) return errorResponse("User not found", 404);

    const isWishlisted = user.wishlist.some((id: { toString(): string }) => id.toString() === propertyId);
    if (isWishlisted) {
      user.wishlist = user.wishlist.filter((id: { toString(): string }) => id.toString() !== propertyId);
    } else {
      user.wishlist.push(propertyId);
    }
    await user.save();
    return successResponse({ wishlisted: !isWishlisted, wishlist: user.wishlist });
  } catch (error) {
    return handleApiError(error);
  }
}
