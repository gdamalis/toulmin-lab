# Subscribe API

This API handles subscriber management for the waitlist during closed beta.

## Endpoints

### POST /api/subscribe

Add a new email to the waitlist.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Successfully subscribed",
    "email": "user@example.com"
  }
}
```

### GET /api/subscribe (Admin Only)

Get all subscribers.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6123456789abcdef12345678",
      "email": "user1@example.com",
      "createdAt": "2023-08-01T12:00:00.000Z",
      "updatedAt": "2023-08-01T12:00:00.000Z"
    },
    {
      "_id": "6123456789abcdef12345679",
      "email": "user2@example.com",
      "createdAt": "2023-08-02T14:30:00.000Z",
      "updatedAt": "2023-08-02T14:30:00.000Z"
    }
  ]
}
```

### GET /api/subscribe/[email] (Admin Only)

Get a specific subscriber by email.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6123456789abcdef12345678",
    "email": "user@example.com",
    "createdAt": "2023-08-01T12:00:00.000Z",
    "updatedAt": "2023-08-01T12:00:00.000Z"
  }
}
```

### DELETE /api/subscribe/[email] (Admin Only)

Delete a subscriber by email.

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Subscriber deleted successfully",
    "email": "user@example.com"
  }
}
``` 