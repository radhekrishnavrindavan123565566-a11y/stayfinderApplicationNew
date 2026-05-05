import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LocalityQA from "@/models/LocalityQA";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    requireAuth(req); // must be logged in to browse locality Q&A
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const locality = searchParams.get("locality");
    if (!city || !locality) return errorResponse("city and locality required");

    const questions = await LocalityQA.find({ city, locality })
      .populate("askedBy", "username avatar")
      .populate("answers.userId", "username avatar")
      .sort({ createdAt: -1 })
      .limit(20);

    return successResponse({ questions });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req);
    await connectDB();
    const { city, locality, question, answerId, answer } = await req.json();

    if (answerId && answer) {
      const qa = await LocalityQA.findById(answerId);
      if (!qa) return errorResponse("Question not found", 404);
      qa.answers.push({
        userId: new mongoose.Types.ObjectId(user.userId),
        answer,
        upvotes: 0,
        createdAt: new Date(),
      });
      await qa.save();
      return successResponse({ qa });
    }

    if (!city || !locality || !question) return errorResponse("Missing required fields");
    const qa = await LocalityQA.create({
      city,
      locality,
      question,
      askedBy: user.userId,
      answers: [],
    });
    return successResponse({ qa }, 201);
  } catch (e) { return handleApiError(e); }
}
