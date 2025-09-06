import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@speakdeck/shared';
import { DatabaseService } from '../../../../src/services/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        createErrorResponse('INVALID_INPUT', 'Presentation ID is required'),
        { status: 400 }
      );
    }

    const db = new DatabaseService();
    const presentation = await db.getPresentation(id);

    if (!presentation) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Presentation not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createSuccessResponse(presentation)
    );

  } catch (error) {
    console.error('Get presentation error:', error);
    
    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to retrieve presentation',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      ),
      { status: 500 }
    );
  }
}
