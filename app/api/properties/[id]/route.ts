import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { sendEmail } from "@/lib/mailer";
import { rentUpdatedEmail, propertyUpdatedEmail, propertyRentedEmail } from "@/lib/emailTemplates";
import { logActivity } from "@/lib/activityLogger";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const property = await Property.findById(id).populate("ownerId", "username avatar email createdAt");
    if (!property) return errorResponse("Property not found", 404);
    return successResponse({ property });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const property = await Property.findById(id);
    if (!property) return errorResponse("Property not found", 404);
    if (property.ownerId.toString() !== user.userId && user.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }
    const body = await req.json();

    const oldPrice = property.price;
    const isPriceChange = body.price !== undefined && Number(body.price) !== oldPrice;
    const isAvailabilityChange = body.isAvailable !== undefined && body.isAvailable !== property.isAvailable;

    // Build flat $set with dot-notation for nested fields to avoid wiping subdocuments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flatSet: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if ((key === "videos" || key === "location") && value && typeof value === "object") {
        for (const [sk, sv] of Object.entries(value as Record<string, string>)) {
          if (sv !== undefined && sv !== null && sv !== "") flatSet[`${key}.${sk}`] = sv;
        }
      } else {
        flatSet[key] = value;
      }
    }
    // strict:false ensures videos subdocument saves even if model cache is stale
    const updated = await Property.findByIdAndUpdate(
      id,
      { $set: flatSet },
      { new: true, strict: false }
    );

    // Notifications & activity logging (non-blocking)
    const owner = await User.findById(property.ownerId).select('email username').lean() as { email?: string; username?: string } | null;
    if (owner?.email) {
      if (isPriceChange) {
        sendEmail(
          owner.email,
          `Rent Updated: ${property.title}`,
          rentUpdatedEmail({
            ownerName: owner.username || 'Owner',
            propertyTitle: property.title,
            oldRent: oldPrice,
            newRent: Number(body.price),
            propertyId: id,
          })
        ).catch(console.error);

        logActivity({
          type: 'rent_updated',
          title: 'Rent Updated',
          description: `Rent for "${property.title}" changed from ₹${oldPrice.toLocaleString('en-IN')} to ₹${Number(body.price).toLocaleString('en-IN')}`,
          metadata: { propertyId: id, propertyTitle: property.title, oldRent: oldPrice, newRent: Number(body.price), ownerName: owner.username },
          severity: 'medium',
          actorId: user.userId,
          targetId: id,
          targetType: 'property',
        });
      } else if (isAvailabilityChange && body.isAvailable === false) {
        sendEmail(
          owner.email,
          `Property Marked as Rented: ${property.title}`,
          propertyRentedEmail({
            ownerName: owner.username || 'Owner',
            propertyTitle: property.title,
            propertyId: id,
          })
        ).catch(console.error);

        logActivity({
          type: 'property_rented',
          title: 'Property Marked as Rented',
          description: `"${property.title}" has been marked as rented out`,
          metadata: { propertyId: id, propertyTitle: property.title, ownerName: owner.username },
          severity: 'high',
          actorId: user.userId,
          targetId: id,
          targetType: 'property',
        });
      } else {
        const updatedFields = Object.keys(body).filter(k => k !== '_id');
        sendEmail(
          owner.email,
          `Property Updated: ${property.title}`,
          propertyUpdatedEmail({
            ownerName: owner.username || 'Owner',
            propertyTitle: property.title,
            propertyId: id,
            updatedFields,
          })
        ).catch(console.error);

        logActivity({
          type: 'property_updated',
          title: 'Property Updated',
          description: `"${property.title}" details updated by ${user.role}`,
          metadata: { propertyId: id, propertyTitle: property.title, updatedFields, ownerName: owner.username },
          severity: 'low',
          actorId: user.userId,
          targetId: id,
          targetType: 'property',
        });
      }
    }

    return successResponse({ property: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const property = await Property.findById(id);
    if (!property) return errorResponse("Property not found", 404);
    if (property.ownerId.toString() !== user.userId && user.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }
    const body = await req.json();

    const oldPrice = property.price;
    const isPriceChange = body.price !== undefined && Number(body.price) !== oldPrice;
    const isAvailabilityChange = body.isAvailable !== undefined && body.isAvailable !== property.isAvailable;

    // Build flat $set with dot-notation for nested fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flatSet: Record<string, any> = {};
    const processField = (key: string, value: any, prefix = "") => {
      if (value === undefined || value === null) return;
      if (typeof value === "object" && !Array.isArray(value)) {
        Object.entries(value).forEach(([k, v]) => {
          processField(k, v, prefix ? `${prefix}.${key}` : key);
        });
      } else {
        flatSet[prefix ? `${prefix}.${key}` : key] = value;
      }
    };
    Object.entries(body).forEach(([key, value]) => processField(key, value));
    const updated = await Property.findByIdAndUpdate(
      id,
      { $set: flatSet },
      { new: true, strict: false }
    );

    // Notifications & activity logging (non-blocking)
    const owner = await User.findById(property.ownerId).select('email username').lean() as { email?: string; username?: string } | null;
    if (owner?.email) {
      if (isPriceChange) {
        sendEmail(
          owner.email,
          `Rent Updated: ${property.title}`,
          rentUpdatedEmail({
            ownerName: owner.username || 'Owner',
            propertyTitle: property.title,
            oldRent: oldPrice,
            newRent: Number(body.price),
            propertyId: id,
          })
        ).catch(console.error);

        logActivity({
          type: 'rent_updated',
          title: 'Rent Updated',
          description: `Rent for "${property.title}" changed from ₹${oldPrice.toLocaleString('en-IN')} to ₹${Number(body.price).toLocaleString('en-IN')}`,
          metadata: { propertyId: id, propertyTitle: property.title, oldRent: oldPrice, newRent: Number(body.price), ownerName: owner.username },
          severity: 'medium',
          actorId: user.userId,
          targetId: id,
          targetType: 'property',
        });
      } else if (isAvailabilityChange && body.isAvailable === false) {
        sendEmail(
          owner.email,
          `Property Marked as Rented: ${property.title}`,
          propertyRentedEmail({
            ownerName: owner.username || 'Owner',
            propertyTitle: property.title,
            propertyId: id,
          })
        ).catch(console.error);

        logActivity({
          type: 'property_rented',
          title: 'Property Marked as Rented',
          description: `"${property.title}" has been marked as rented out`,
          metadata: { propertyId: id, propertyTitle: property.title, ownerName: owner.username },
          severity: 'high',
          actorId: user.userId,
          targetId: id,
          targetType: 'property',
        });
      } else {
        const updatedFields = Object.keys(body).filter(k => k !== '_id');
        logActivity({
          type: 'property_updated',
          title: 'Property Updated',
          description: `"${property.title}" details updated`,
          metadata: { propertyId: id, propertyTitle: property.title, updatedFields, ownerName: owner.username },
          severity: 'low',
          actorId: user.userId,
          targetId: id,
          targetType: 'property',
        });
      }
    }

    return successResponse({ property: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    const property = await Property.findById(id);
    if (!property) return errorResponse("Property not found", 404);
    if (property.ownerId.toString() !== user.userId && user.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }
    await Property.findByIdAndDelete(id);
    return successResponse({ message: "Property deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
