# API Documentation

## Authentication
All endpoints require an `Authorization: Bearer <token>` header unless listed as public.

## Endpoints

### POST /api/data
**Description:** Validate and submit user data.
**Request Body:**
```
{
  "username": "string, required, min 3",
  "age": "number, required, min 1"
}
```
**Response:**
- 200 OK `{ message: 'Data is valid!', data: ... }`
- 400 Bad Request `{ error: [{ path, message }] }`

### Other endpoints
Document other endpoints here...

## Status Codes
- 200: Success
- 400: Validation or client error
- 401: Unauthorized (invalid or missing token)
- 404: Not found
- 500: Internal server error

---
For more details on request/response formats, authentication, or error handling, see the main README.
