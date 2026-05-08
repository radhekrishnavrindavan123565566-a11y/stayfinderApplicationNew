import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

const BOOST_PRICE = 29.99; // USD
const BOOST_DAYS = 7;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const { propertyId } = await req.json();
    if (!propertyId) return errorResponse("propertyId is required");

    const property = await Property.findOne({ _id: propertyId, ownerId: user.userId });
    if (!property) return errorResponse("Property not found or not yours", 404);

    const boostExpiresAt = new Date();
    boostExpiresAt.setDate(boostExpiresAt.getDate() + BOOST_DAYS);

    property.isBoosted = true;
    property.isFeatured = true;
    property.boostExpiresAt = boostExpiresAt;
    await property.save();

    // Record boost transaction
    await Transaction.create({
      tenantId: user.userId,
      ownerId: user.userId,
      propertyId,
      totalAmount: BOOST_PRICE,
      platformFee: BOOST_PRICE,
      landlordAmount: 0,
      status: "completed",
      type: "boost",
    });

    return successResponse({ message: `Property boosted for ${BOOST_DAYS} days`, boostExpiresAt });
  } catch (error) {
    return handleApiError(error);
  }
}
