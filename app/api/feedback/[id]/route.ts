import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Feedback from '@/models/Feedback';
import { authenticateRequest } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch specific feedback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const feedback = await Feedback.findById(id).populate('userId', 'username email avatar');

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    // Check permission - user can only see their own feedback unless they're admin
    if (feedback.userId.toString() !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      data: { feedback },
    });
  } catch (error) {
    logger.error('Feedback GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

// PUT - Update feedback status (admin only) or user can update their own feedback
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { status, category, title, description, rating, isPublic } = await request.json();

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    // Check permission
    const isOwner = feedback.userId.toString() === decoded.userId;
    const isAdmin = decoded.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Users can only update their own feedback (not status)
    // Admins can update status
    if (isOwner && !isAdmin) {
      if (status) {
        return NextResponse.json(
          { error: 'You cannot change feedback status' },
          { status: 403 }
        );
      }
      if (category) feedback.category = category;
      if (title) feedback.title = title;
      if (description) feedback.description = description;
      if (rating !== undefined) feedback.rating = rating;
      if (isPublic !== undefined) feedback.isPublic = isPublic;
    } else if (isAdmin) {
      // Admin can update everything
      if (status) feedback.status = status;
      if (category) feedback.category = category;
      if (title) feedback.title = title;
      if (description) feedback.description = description;
      if (rating !== undefined) feedback.rating = rating;
      if (isPublic !== undefined) feedback.isPublic = isPublic;
    }

    await feedback.save();
    await feedback.populate('userId', 'username email avatar');

    logger.info('[Feedback] Feedback updated', {
      feedbackId: id,
      updatedBy: decoded.userId,
      newStatus: feedback.status,
    });

    return NextResponse.json({
      data: {
        feedback,
        message: 'Feedback updated successfully',
      },
    });
  } catch (error) {
    logger.error('Feedback PUT error:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}

// DELETE - Delete feedback (user can delete their own, admin can delete any)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    // Check permission
    const isOwner = feedback.userId.toString() === decoded.userId;
    const isAdmin = decoded.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Feedback.findByIdAndDelete(id);

    logger.info('[Feedback] Feedback deleted', {
      feedbackId: id,
      deletedBy: decoded.userId,
    });

    return NextResponse.json({
      data: { message: 'Feedback deleted successfully' },
    });
  } catch (error) {
    logger.error('Feedback DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
