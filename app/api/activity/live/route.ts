import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/apiResponse";

// In-memory activity storage for development
let activities: any[] = [];

export async function GET(req: NextRequest) {
  try {
    // Public read for live activity ticker on homepage
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    let filtered = activities.filter((a) => new Date(a.createdAt) >= fiveMinutesAgo);
    
    if (propertyId) {
      filtered = filtered.filter((a) => a.propertyId === propertyId);
    }

    const sorted = filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, limit);

    // Calculate stats
    const stats = filtered.reduce((acc: any, activity) => {
      const type = activity.activityType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json(
      { activities: sorted, stats },
      { status: 200 }
    );
  } catch (error) {
    console.error('Activity GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { propertyId, activityType, metadata } = await req.json();

    // Only allow known activity types to prevent data pollution
    const ALLOWED_TYPES = ["view", "wishlist", "booking_started", "share"];
    if (!activityType || !ALLOWED_TYPES.includes(activityType)) {
      return NextResponse.json(
        { error: "Invalid activityType" },
        { status: 400 }
      );
    }
    
    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId is required" },
        { status: 400 }
      );
    }

    const activity = {
      _id: Date.now().toString(),
      propertyId,
      activityType,
      metadata,
      createdAt: new Date().toISOString(),
    };

    activities.unshift(activity);

    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities = activities.slice(0, 1000);
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Activity POST error:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
