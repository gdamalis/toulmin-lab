import { getArgumentById } from '@/lib/mongodb/service';

interface GetDiagramContext {
  params: {
    id: string;
  };
}

export async function GET(_: Request, { params }: GetDiagramContext) {
  try {
    const { id } = params;
    
    if (!id) {
      return Response.json({ error: 'Diagram ID is required' }, { status: 400 });
    }
    
    // Get the diagram
    const diagram = await getArgumentById(id);
    
    if (!diagram) {
      return Response.json({ error: 'Diagram not found' }, { status: 404 });
    }
    
    // Return the diagram
    return Response.json({
      success: true,
      argument: diagram,
    });
  } catch (error) {
    console.error('Error retrieving diagram:', error);
    return Response.json({ error: 'Failed to retrieve diagram' }, { status: 500 });
  }
} 