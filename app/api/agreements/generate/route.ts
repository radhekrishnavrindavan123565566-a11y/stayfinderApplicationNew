import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import RentAgreement from "@/models/RentAgreement";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/apiResponse";
import { getOpenAI } from "@/lib/openai";
import { addAgreementJob } from "@/lib/queue/queues";

const ENGLISH_SYSTEM_PROMPT = `You are a legal document assistant for Indian residential rental agreements.
Generate a complete, legally-structured rental agreement under Indian law.
Include these sections: Parties, Property Details, Monthly Rent, Lease Duration,
Payment Terms, Security Deposit, Maintenance Responsibilities, Termination Clause,
Governing Law (India). Use formal legal English. Return only the agreement text.`;

const HINDI_SYSTEM_PROMPT = `आप भारतीय आवासीय किराया समझौतों के लिए एक कानूनी दस्तावेज़ सहायक हैं।
भारतीय कानून के तहत एक पूर्ण, कानूनी रूप से संरचित किराया समझौता तैयार करें।
इन खंडों को शामिल करें: पक्षकार, संपत्ति विवरण, मासिक किराया, पट्टे की अवधि,
भुगतान शर्तें, सुरक्षा जमा, रखरखाव जिम्मेदारियां, समाप्ति खंड, शासी कानून (भारत)।
औपचारिक कानूनी हिंदी (देवनागरी लिपि) का उपयोग करें। केवल समझौते का पाठ लौटाएं।`;

const GPT_TIMEOUT_MS = 15000;

export async function POST(req: NextRequest) {
  try {
    // Authenticate and get user
    const user = requireAuth(req);
    if (!user) return errorResponse("Unauthorized", 401);
    
    await connectDB();
    
    // Parse request body
    const body = await req.json();
    const {
      tenantName,
      ownerName,
      propertyTitle,
      propertyAddress,
      monthlyRent,
      startDate,
      endDate,
      language,
      propertyId,
      bookingId,
      tenantId,
      ownerId,
    } = body;

    // Validate all required fields
    const requiredFields = {
      tenantName,
      ownerName,
      propertyTitle,
      propertyAddress,
      monthlyRent,
      startDate,
      endDate,
      language,
      propertyId, // Required by schema
    };

    for (const [fieldName, value] of Object.entries(requiredFields)) {
      if (!value && value !== 0) {
        return errorResponse(`${fieldName} is required`, 400);
      }
    }

    // Validate language
    if (language !== "hindi" && language !== "english") {
      return errorResponse("language must be 'hindi' or 'english'", 400);
    }

    // Select system prompt based on language
    const systemPrompt = language === "hindi" ? HINDI_SYSTEM_PROMPT : ENGLISH_SYSTEM_PROMPT;

    // Build user prompt with all details
    const userPrompt = `Generate a rental agreement with the following details:

Tenant Name: ${tenantName}
Owner Name: ${ownerName}
Property Title: ${propertyTitle}
Property Address: ${propertyAddress}
Monthly Rent: ₹${monthlyRent}
Lease Start Date: ${startDate}
Lease End Date: ${endDate}

Please generate a complete, legally-structured rental agreement.`;

    // Call OpenAI with timeout
    const openai = getOpenAI();
    
    const gptPromise = openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT")), GPT_TIMEOUT_MS);
    });

    let completion;
    try {
      completion = await Promise.race([gptPromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message === "TIMEOUT") {
        return errorResponse("Agreement generation timed out", 504);
      }
      throw error;
    }

    const agreementText = completion.choices[0].message.content?.trim();
    
    if (!agreementText) {
      return errorResponse("Failed to generate agreement text", 500);
    }

    // Resolve tenantId and ownerId
    // Use provided IDs from request, or default to authenticated user for both
    // (In production, you'd typically require both IDs or have logic to look up the other party)
    const resolvedTenantId = tenantId || user.userId;
    const resolvedOwnerId = ownerId || user.userId;

    // Create RentAgreement document
    const agreementData: any = {
      propertyId, // Required by schema
      tenantId: resolvedTenantId,
      ownerId: resolvedOwnerId,
      agreementText,
      status: "draft",
      validFrom: new Date(startDate),
      validUntil: new Date(endDate),
    };

    // Add optional bookingId if provided
    if (bookingId) {
      agreementData.bookingId = bookingId;
    }

    const agreement = await RentAgreement.create(agreementData);

    // Populate the document before returning
    const populatedAgreement = await RentAgreement.findById(agreement._id)
      .populate("propertyId", "title location")
      .populate("tenantId", "username email")
      .populate("ownerId", "username email");

    // Queue background job to send notification emails
    await addAgreementJob({
      agreementId: agreement._id.toString(),
      action: 'generate',
      userId: user.userId,
    });

    return successResponse({ agreement: populatedAgreement }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
