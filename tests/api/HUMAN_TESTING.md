# Human-Friendly API Testing Guide

A simple, readable way to test the venn API using just bash and curl.

## Quick Start

```bash
cd venn/tests/api

# Interactive menu (easiest)
./human-test.sh

# Or run specific tests
./human-test.sh contacts
./human-test.sh tickets
./human-test.sh roadmap
./human-test.sh all
```

## First-Time Setup

### Get a Session Cookie

Since we don't have API tokens yet (coming in venn-271), you need to authenticate via the web UI first:

**Step 1: Sign in**
```bash
# Open in your browser
open https://venn-demo.avan.academy
```

**Step 2: Get session cookie**

1. Open DevTools (F12 or Cmd+Option+I)
2. Go to: Application → Cookies → venn-demo.avan.academy
3. Find the `connect.sid` cookie
4. Copy its value

**Step 3: Create cookie jar**

```bash
# Replace YOUR_SESSION_ID with the cookie value
echo '.venn-demo.avan.academy	FALSE	/	TRUE	0	connect.sid	YOUR_SESSION_ID' > ~/.venn-session-cookie
```

**Alternative: Use browser dev mode**

The script will guide you through this if no cookie is found.

### Verify Authentication

```bash
./human-test.sh
# Choose option 1: Check Authentication
```

You should see:
```
✓ Authenticated as: Your Name (your@email.com)
```

---

## Usage Examples

### Interactive Mode (Recommended)

```bash
./human-test.sh
```

Menu options:
- **1** - Check if you're authenticated
- **2** - Test Contacts API (CRUD)
- **3** - Test Tickets API (CRUD + messages)
- **4** - Test Roadmap API (CRUD + voting)
- **5** - Run all tests sequentially
- **6** - Custom request (manual endpoint testing)
- **0** - Exit

### Command-Line Mode

```bash
# Test specific modules
./human-test.sh contacts
./human-test.sh tickets
./human-test.sh roadmap

# Run complete test suite
./human-test.sh all
```

### Custom Requests

Option 6 in the menu lets you make custom API calls:

```
Method: GET
Endpoint: /contacts?limit=3
JSON Body: (leave empty)
```

Or from command line:
```bash
# The script exports a helper function you can use
source human-test.sh
api_request GET "/contacts?lifecycle_stage=lead"
```

---

## What Each Test Does

### Contacts Test (human-test.sh contacts)

1. Lists existing contacts (paginated, limit 5)
2. Creates a new test contact with random email
3. Fetches the created contact by ID
4. Updates the contact's title
5. Deletes the test contact
6. Reports: ✓ Contact CRUD test complete

**Creates:** Temporary contact (cleaned up automatically)  
**Duration:** ~5 seconds

### Tickets Test (human-test.sh tickets)

1. Lists existing tickets
2. Creates a contact (tickets require contact_id)
3. Creates a ticket linked to that contact
4. Adds a message to the ticket
5. Fetches ticket messages
6. Updates ticket status to "resolved"
7. Deletes ticket and contact
8. Reports: ✓ Ticket CRUD test complete

**Creates:** Temporary ticket + contact (cleaned up)  
**Duration:** ~8 seconds

### Roadmap Test (human-test.sh roadmap)

1. Lists roadmap items (public endpoint)
2. Creates a test feature
3. Fetches the feature by ID
4. Updates status to "planned"
5. Votes for the feature
6. Deletes the test feature
7. Reports: ✓ Roadmap CRUD test complete

**Creates:** Temporary roadmap item (cleaned up)  
**Duration:** ~6 seconds

---

## Reading the Output

The script uses colors for clarity:

- 🟦 **Blue headers** - Section titles
- 🟢 **Green ✓** - Success messages
- 🔴 **Red ✗** - Errors
- 🔵 **Cyan ℹ** - Info messages
- 🟡 **Yellow ⚠** - Warnings

### Example Output

```
========================================
Testing Contacts API
========================================

ℹ Listing contacts...
Request: GET /contacts?limit=5
Response: 200
Body: {
  "data": [...],
  "pagination": {...}
}

ℹ Creating new contact...
Request: POST /contacts
Body: {
  "name": "Test Contact",
  "email": "test-1708563241@example.com",
  ...
}

Response: 200
Body: {
  "id": 42,
  "name": "Test Contact",
  ...
}

✓ Created contact with ID: 42
✓ Contact CRUD test complete
```

---

## Understanding API Responses

### Success (2xx)

- **200 OK** - Request succeeded, data returned
- **201 Created** - Resource created successfully
- **204 No Content** - Request succeeded, no data returned

### Client Errors (4xx)

- **400 Bad Request** - Invalid data sent
- **401 Unauthorized** - Not authenticated (session expired)
- **403 Forbidden** - Authenticated but not permitted (wrong role)
- **404 Not Found** - Resource doesn't exist

### Server Errors (5xx)

- **500 Internal Server Error** - Backend error

---

## Common Issues

### "Authentication failed. Session may be expired."

**Cause:** Your session cookie is old or invalid.

**Fix:**
1. Sign in again at https://venn-demo.avan.academy
2. Get a fresh session cookie
3. Update your cookie jar

```bash
rm ~/.venn-session-cookie
# Follow setup steps again
```

### "No session cookie found"

**Cause:** Cookie jar doesn't exist.

**Fix:** Run the setup steps above to create `~/.venn-session-cookie`

### "Response: 400" with validation error

**Cause:** Invalid data in request body (e.g., missing required field).

**Example:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["name"],
      "message": "Required"
    }
  ]
}
```

**Fix:** Check the API documentation for required fields.

### "Response: 403" Forbidden

**Cause:** Your user doesn't have permission for that action.

**Example:** Only admins can access `/api/users` endpoints.

**Fix:** Sign in as an admin user, or request appropriate permissions.

---

## Advanced Usage

### Testing Specific Endpoints

```bash
# Source the script to use helper functions
source ./human-test.sh

# Make custom requests
api_request GET "/contacts?search=john"
api_request POST "/tickets" '{"contact_id":1,"subject":"Test"}'
api_request PATCH "/roadmap/5" '{"status":"completed"}'
```

### Debugging Requests

Add `-v` to curl for verbose output:

```bash
# Edit human-test.sh and add -v to curl command
curl -v -s -w "\n%{http_code}" ...
```

### Testing with Different Users

```bash
# Use different cookie jars for different users
COOKIE_JAR=~/.venn-admin-cookie ./human-test.sh
COOKIE_JAR=~/.venn-agent-cookie ./human-test.sh
```

---

## API Test Coverage

### ✅ Currently Tested

- **Contacts:** CRUD, search, pagination
- **Tickets:** CRUD, messages, status updates
- **Roadmap:** CRUD, voting, public access
- **Auth:** Session validation

### ❌ Not Yet Tested (Missing Features)

- **API Tokens** - No token authentication yet (venn-271)
- **Activities** - No activities API yet (venn-npn)
- **Ticket Categories** - Not implemented (venn-3bw)
- **SLA Tracking** - Not implemented (venn-tcx)
- **Bulk Operations** - Not implemented (venn-5jg)
- **Advanced Search** - Limited search capability
- **Webhooks** - Not implemented (venn-wmr)
- **Analytics** - Not implemented (venn-9jr)

---

## Future: API Token Testing

**Note:** This script currently uses **session-based authentication** (OAuth cookies). Once we implement **API tokens** (venn-271), we'll add:

### Test API Key Setup (Future)

```bash
# Generate a test API key (once venn-271 is implemented)
export VENN_API_KEY="venn_test_xxxxxxxxxxxx"

# Use Bearer token instead of cookies
./human-test.sh --token "$VENN_API_KEY"
```

**Planned:**
1. Implement API tokens (venn-271)
2. Create "test-user" account with long-lived token
3. Update script to support Bearer auth
4. Document test key generation

**For now:** Use session cookies as documented above.

---

## Extending the Script

### Add New Test Modules

```bash
# Add to human-test.sh

test_analytics() {
    print_header "Testing Analytics API"
    
    print_info "Fetching contact metrics..."
    api_request GET "/analytics/contacts/by-lifecycle"
    
    print_info "Fetching ticket metrics..."
    api_request GET "/analytics/tickets/resolution-time"
}

# Add to menu
echo "  7) Test Analytics API"
# ...
case $choice in
    # ...
    7) check_auth; test_analytics ;;
esac
```

### Custom Assertions

```bash
# Add validation helpers
assert_contains() {
    local response="$1"
    local expected="$2"
    
    if echo "$response" | grep -q "$expected"; then
        print_success "Response contains: $expected"
    else
        print_error "Response missing: $expected"
    fi
}

# Use in tests
response=$(api_request GET /contacts)
assert_contains "$response" '"data":'
```

---

## Contributing

Found a bug? Want to add a test?

1. Edit `human-test.sh`
2. Test your changes
3. Commit and push
4. Update this doc if needed

---

## Related Files

- `human-test.sh` - Main testing script (this one)
- `test-current-state.sh` - Quick health check (no auth)
- `authenticate.sh` - Helper for cookie setup
- `test-contacts.sh` - Automated contact tests
- `test-tickets.sh` - Automated ticket tests
- `test-roadmap.sh` - Automated roadmap tests
- `run-all.sh` - Run complete automated suite

---

**Last Updated:** 2026-02-21  
**API Version:** Pre-IAM (session auth only)  
**Next Steps:** Implement API tokens (venn-271) for programmatic auth
