import { getArgumentsByUserId } from '@/lib/mongodb/service';
import { getToken } from '@/lib/firebase/auth-admin';

export async function GET(request: Request) {
  try {
    // Extract the authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await getToken(token);
    if (!decodedToken) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.uid;
    
    // Get arguments for this user
    const userArguments = await getArgumentsByUserId(userId);
    
    // Return the arguments
    return Response.json({
      success: true,
      arguments: userArguments,
    });
  } catch (error) {
    console.error('Error retrieving user diagrams:', error);
    return Response.json({ error: 'Failed to retrieve diagrams' }, { status: 500 });
  }
} 