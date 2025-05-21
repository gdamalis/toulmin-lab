# API Endpoints Documentation

## User API Endpoints

We use a standardized RESTful API design for user-related operations.

### Base URL

All user endpoints are under `/api/users`.

### Authentication

All endpoints require authentication via a Firebase ID token in the Authorization header:

```
Authorization: Bearer [your-firebase-id-token]
```

### Endpoints

#### Collection Operations

- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create or update a user

#### Individual User Operations

- `GET /api/users/[id]` - Get a specific user by ID
- `PATCH /api/users/[id]` - Update a user's role (admin only)
- `DELETE /api/users/[id]` - Delete a user (admin only)

#### Current User Operations

- `GET /api/users/me` - Get the currently authenticated user's data

### Response Format

All endpoints return a standardized response format:

```json
{
  "success": true|false,
  "data": { ... }, // Present only on success
  "error": "Error message" // Present only on failure
}
```

### Error Handling

Common error status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Development Guidelines

1. Always verify authentication tokens for all endpoints
2. Check permissions before performing operations
3. Validate input data
4. Use consistent response formats
5. Log errors appropriately 