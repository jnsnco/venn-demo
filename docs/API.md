# API Documentation

Base URL: `/api`

All endpoints require authentication except where noted.

## Authentication

### Google OAuth
```
GET /api/auth/google
GET /api/auth/google/callback
```

### GitHub OAuth
```
GET /api/auth/github
GET /api/auth/github/callback
```

### Get Current User
```http
GET /api/auth/me

Response:
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "avatar": "https://..."
}
```

### Logout
```http
POST /api/auth/logout

Response:
{ "success": true }
```

## Contacts (CRM)

### List Contacts
```http
GET /api/contacts?page=1&limit=50&search=query

Response:
{
  "data": [
    {
      "id": 1,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "title": "CEO",
      "organization_id": 1,
      "organization_name": "Acme Corp",
      "lifecycle_stage": "customer",
      "tags": ["vip", "enterprise"],
      "custom_fields": {},
      "created_at": "2025-01-29T12:00:00Z",
      "ticket_count": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150
  }
}
```

### Get Contact
```http
GET /api/contacts/:id

Response:
{
  "id": 1,
  "name": "Jane Smith",
  ...
  "activities": [...],
  "open_tickets": [...]
}
```

### Create Contact
```http
POST /api/contacts

Body:
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "title": "CEO",
  "organization_id": 1,
  "lifecycle_stage": "lead",
  "tags": ["vip"],
  "custom_fields": {}
}

Response: Contact object
```

### Update Contact
```http
PATCH /api/contacts/:id

Body: (partial)
{
  "lifecycle_stage": "customer",
  "tags": ["vip", "enterprise"]
}

Response: Updated contact object
```

### Delete Contact
```http
DELETE /api/contacts/:id

Response:
{ "success": true }
```

## Tickets (Support)

### List Tickets
```http
GET /api/tickets?page=1&limit=50&status=open

Response:
{
  "data": [
    {
      "id": 1,
      "subject": "Login not working",
      "contact_id": 1,
      "contact_name": "Jane Smith",
      "contact_email": "jane@example.com",
      "assigned_to": 2,
      "assigned_to_name": "Support Agent",
      "status": "open",
      "priority": "high",
      "channel": "email",
      "created_at": "2025-01-29T12:00:00Z",
      "message_count": 3
    }
  ],
  "pagination": {...}
}
```

### Get Ticket
```http
GET /api/tickets/:id

Response:
{
  "id": 1,
  ...
  "messages": [
    {
      "id": 1,
      "ticket_id": 1,
      "user_id": 2,
      "user_name": "Agent",
      "contact_id": null,
      "body": "Thanks for reaching out...",
      "is_internal": false,
      "created_at": "2025-01-29T12:05:00Z"
    }
  ],
  "linked_roadmap_items": [...]
}
```

### Create Ticket
```http
POST /api/tickets

Body:
{
  "subject": "Cannot access dashboard",
  "contact_id": 1,
  "priority": "medium",
  "channel": "web",
  "body": "I'm getting a 404 error when..."
}

Response: Ticket object
```

### Update Ticket
```http
PATCH /api/tickets/:id

Body:
{
  "status": "resolved",
  "assigned_to": 2
}

Response: Updated ticket object
```

### Add Message
```http
POST /api/tickets/:id/messages

Body:
{
  "body": "This has been resolved by...",
  "is_internal": false
}

Response: Message object
```

### Link to Roadmap
```http
POST /api/tickets/:id/roadmap-links

Body:
{
  "roadmap_item_id": 5
}

Response: Link object
```

## Roadmap (Product)

### List Roadmap Items
```http
GET /api/roadmap?page=1&status=planned&type=feature

Response:
{
  "data": [
    {
      "id": 1,
      "title": "Dark mode support",
      "description": "Add dark mode theme option",
      "type": "feature",
      "status": "planned",
      "priority": "high",
      "target_date": "2025-03-01",
      "created_by": 1,
      "created_by_name": "Product Manager",
      "created_at": "2025-01-15T10:00:00Z",
      "vote_count": 42
    }
  ],
  "pagination": {...}
}
```

### Get Roadmap Item
```http
GET /api/roadmap/:id

Response:
{
  "id": 1,
  ...
  "linked_tickets": [...],
  "voters": [
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "organization_name": "Acme Corp",
      "created_at": "2025-01-20T14:00:00Z"
    }
  ]
}
```

### Create Roadmap Item
```http
POST /api/roadmap

Body:
{
  "title": "Export to CSV",
  "description": "Allow users to export data as CSV",
  "type": "feature",
  "status": "backlog",
  "priority": "medium",
  "target_date": "2025-04-01"
}

Response: Roadmap item object
```

### Update Roadmap Item
```http
PATCH /api/roadmap/:id

Body:
{
  "status": "in_progress",
  "target_date": "2025-03-15"
}

Response: Updated roadmap item object
```

### Vote
```http
POST /api/roadmap/:id/vote

Body:
{
  "contact_id": 1,
  "organization_id": 1
}

Response: Vote object
```

### Remove Vote
```http
DELETE /api/roadmap/:id/vote

Body:
{
  "contact_id": 1
}

Response:
{ "success": true }
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "details": [...] // Optional validation details
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
