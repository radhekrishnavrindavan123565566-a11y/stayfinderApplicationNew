import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = requireAuth(req);
    if (!auth || auth.role !== "admin") {
      return errorResponse("Unauthorized", 401);
    }

    // Get all properties with their unit counts (each property can have multiple units)
    const properties = await Property.find({}, "unitCount");
    const totalRooms = properties.reduce((sum, prop) => sum + (prop.unitCount || 1), 0);

    // Get active bookings (approved or completed)
    const activeBookings = await Booking.find({
      status: { $in: ["approved", "completed"] },
      endDate: { $gte: new Date() },
    }).populate("propertyId", "unitCount");

    // Calculate occupied units (each booking occupies one unit)
    const occupiedRooms = activeBookings.length;

    const vacantRooms = totalRooms - occupiedRooms;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Get monthly data for last 6 months
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthBookings = await Booking.find({
        status: { $in: ["approved", "completed"] },
        startDate: { $lt: nextMonth },
        endDate: { $gte: monthDate },
      });

      // Each booking occupies one unit
      const monthOccupied = monthBookings.length;

      const monthVacant = totalRooms - monthOccupied;
      const monthRate = totalRooms > 0 ? Math.round((monthOccupied / totalRooms) * 100) : 0;

      monthlyData.push({
        month: monthDate.toLocaleDateString("en-US", { month: "short" }),
        occupied: monthOccupied,
        vacant: monthVacant,
        rate: monthRate,
      });
    }

    // Determine trend
    let trend: "up" | "down" | "stable" = "stable";
    if (monthlyData.length >= 2) {
      const lastMonth = monthlyData[monthlyData.length - 1].rate;
      const prevMonth = monthlyData[monthlyData.length - 2].rate;
      if (lastMonth > prevMonth + 5) trend = "up";
      else if (lastMonth < prevMonth - 5) trend = "down";
    }

    return successResponse({
      totalRooms,
      occupiedRooms,
      vacantRooms,
      occupancyRate,
      trend,
      monthlyData,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
