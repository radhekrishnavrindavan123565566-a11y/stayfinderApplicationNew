import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch all feedback (admin) or user's feedback
export async function GET(request: NextRequest) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const userOnly = searchParams.get('userOnly') === 'true';
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    let query: any = {};

    // Non-admin users can only see their own feedback
    if (decoded.role !== 'admin') {
      query.userId = decoded.userId;
    } else if (userOnly) {
      // Admin can optionally filter to their own feedback
      query.userId = decoded.userId;
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const feedback = await Feedback.find(query)
      .populate('userId', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Feedback.countDocuments(query);

    logger.info('[Feedback] Fetched feedback', {
      userId: decoded.userId,
      role: decoded.role,
      isAdmin: decoded.role === 'admin',
      count: feedback.length,
    });

    return NextResponse.json({
      data: {
        feedback,
        total,
        limit,
        skip,
      },
    });
  } catch (error) {
    logger.error('Feedback GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

// POST - Create new feedback
export async function POST(request: NextRequest) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { category, title, description, rating, email, attachments, isPublic } = await request.json();

    // Validate required fields
    if (!category || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: category, title, description' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['bug', 'feature', 'improvement', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be less than 200 characters' },
        { status: 400 }
      );
    }

    // Validate description length
    if (description.length > 5000) {
      return NextResponse.json(
        { error: 'Description must be less than 5000 characters' },
        { status: 400 }
      );
    }

    // Get user for email validation
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create feedback
    const feedback = new Feedback({
      userId: decoded.userId,
      category,
      title,
      description,
      rating: rating ? Math.min(5, Math.max(1, Math.floor(rating))) : undefined,
      email: email || user.email,
      attachments: attachments || [],
      isPublic: isPublic || false,
    });

    await feedback.save();

    // Populate user details
    await feedback.populate('userId', 'username email avatar');

    logger.info('[Feedback] New feedback created', {
      feedbackId: feedback._id,
      userId: decoded.userId,
      category,
      isPublic,
    });

    return NextResponse.json(
      {
        data: {
          feedback,
          message: 'Feedback submitted successfully',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Feedback POST error:', error);
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
  }
}
