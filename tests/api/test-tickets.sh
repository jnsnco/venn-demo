#!/bin/bash
# Test Tickets API

set -e

# Load helpers
source "$(dirname "$0")/test-helpers.sh"

# Configuration
API_BASE_URL="${API_BASE_URL:-https://venn-demo.avan.academy/api}"
COOKIE_JAR="/tmp/venn-test-cookies.txt"

init_test "Tickets API"

# Setup: Create a test contact first
echo "Setup: Creating test contact for ticket"
contact_response=$(create_test_contact)
CONTACT_ID=$(echo "$contact_response" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
echo "Created contact ID: $CONTACT_ID"

# Test 1: List tickets
echo "Test 1: GET /tickets - List all tickets"
response=$(api_request GET /tickets)
assert_contains "$response" "data" "List tickets returns data array"

# Test 2: Create ticket
echo "Test 2: POST /tickets - Create new ticket"
response=$(api_request POST /tickets '{
    "contact_id": '${CONTACT_ID}',
    "subject": "API Test Ticket - Sample Issue",
    "priority": "high",
    "status": "open",
    "channel": "email"
}')
assert_contains "$response" "id" "Create ticket returns ID"
assert_contains "$response" "Sample Issue" "Create ticket returns subject"

TICKET_ID=$(echo "$response" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
echo "Created ticket ID: $TICKET_ID"

# Test 3: Get specific ticket
echo "Test 3: GET /tickets/:id - Get ticket details"
response=$(api_request GET "/tickets/$TICKET_ID")
assert_contains "$response" "Sample Issue" "Get ticket returns subject"
assert_contains "$response" "high" "Get ticket returns priority"

# Test 4: Add message to ticket
echo "Test 4: POST /tickets/:id/messages - Add ticket message"
response=$(api_request POST "/tickets/$TICKET_ID/messages" '{
    "body": "This is a test message from the API",
    "is_internal": false
}')
assert_contains "$response" "test message" "Add message returns body"

# Test 5: Get ticket messages
echo "Test 5: GET /tickets/:id/messages - List ticket messages"
response=$(api_request GET "/tickets/$TICKET_ID/messages")
assert_contains "$response" "test message" "List messages returns messages"

# Test 6: Update ticket status
echo "Test 6: PATCH /tickets/:id - Update ticket"
response=$(api_request PATCH "/tickets/$TICKET_ID" '{
    "status": "pending",
    "priority": "urgent"
}')
assert_contains "$response" "pending" "Update ticket changes status"
assert_contains "$response" "urgent" "Update ticket changes priority"

# Test 7: Filter by status
echo "Test 7: GET /tickets?status=pending - Filter by status"
response=$(api_request GET "/tickets?status=pending")
assert_contains "$response" "pending" "Filter returns pending tickets"

# Test 8: Filter by priority
echo "Test 8: GET /tickets?priority=urgent - Filter by priority"
response=$(api_request GET "/tickets?priority=urgent")
assert_contains "$response" "urgent" "Filter returns urgent tickets"

# Test 9: Resolve ticket
echo "Test 9: PATCH /tickets/:id - Resolve ticket"
response=$(api_request PATCH "/tickets/$TICKET_ID" '{
    "status": "resolved"
}')
assert_contains "$response" "resolved" "Ticket can be resolved"

# Test 10: Delete ticket
echo "Test 10: DELETE /tickets/:id - Delete ticket"
response=$(api_request DELETE "/tickets/$TICKET_ID")
assert_contains "$response" "success" "Delete ticket succeeds"

# Cleanup contact
api_request DELETE "/contacts/$CONTACT_ID" > /dev/null

print_summary
