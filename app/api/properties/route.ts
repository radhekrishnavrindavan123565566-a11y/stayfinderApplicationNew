import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import { requireRole } from "@/lib/auth";
import { propertySchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

// Increase body size limit for property creation (images as base64)
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const propertyType = searchParams.get("propertyType");
    const search = searchParams.get("search");
    const bedrooms = searchParams.get("bedrooms");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isAvailable: true };
    if (city) query["location.city"] = { $regex: city, $options: "i" };
    if (propertyType) query.propertyType = propertyType;
    if (bedrooms) query.bedrooms = { $gte: parseInt(bedrooms) };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
        { "location.country": { $regex: search, $options: "i" } },
      ];
    }

    // Exclude properties already booked (approved/pending) by this tenant
    const excludeBooked = searchParams.get("excludeBooked");
    if (excludeBooked) {
      const activeBookings = await Booking.find({
        tenantId: excludeBooked,
        status: { $in: ["pending", "approved"] },
      }).select("propertyId").lean();
      const bookedIds = activeBookings.map((b: { propertyId: unknown }) => b.propertyId);
      if (bookedIds.length > 0) query._id = { $nin: bookedIds };
    }

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate("ownerId", "username avatar email")
      .sort({ isBoosted: -1, isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return successResponse({ properties, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = requireRole(req, ["owner", "admin"]);
    const body = await req.json();
    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error!.issues[0].message);

    const property = await Property.create({
      ...parsed.data,
      ownerId: user.userId,
      images: body.images || [],
      videos: body.videos || {},
      amenities: body.amenities || [],
      instantBooking: body.instantBooking ?? false,
      cancellationPolicy: body.cancellationPolicy || "moderate",
    });
    return successResponse({ property }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
