import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb/config';

// GET /api/diagrams - Get all diagrams for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // This is a simplified version - in a real app, you would verify the Firebase token
    // and extract the user ID properly
    const userId = req.headers.get('user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('toulmin-lab');
    
    const diagrams = await db
      .collection('diagrams')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json(diagrams);
  } catch (error) {
    console.error('Error fetching diagrams:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/diagrams - Create a new diagram
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    if (!data.diagram) {
      return NextResponse.json({ error: 'Diagram data is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('toulmin-lab');
    
    const diagramData = {
      userId,
      diagram: data.diagram,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('diagrams').insertOne(diagramData);
    
    return NextResponse.json({ 
      id: result.insertedId,
      ...diagramData 
    });
  } catch (error) {
    console.error('Error creating diagram:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 