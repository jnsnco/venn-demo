#!/bin/bash
# Test Contacts API

set -e

# Load helpers
source "$(dirname "$0")/test-helpers.sh"

# Configuration
API_BASE_URL="${API_BASE_URL:-https://venn-demo.avan.academy/api}"
COOKIE_JAR="/tmp/venn-test-cookies.txt"

init_test "Contacts API"

# Test 1: List contacts
echo "Test 1: GET /contacts - List all contacts"
response=$(api_request GET /contacts)
assert_contains "$response" "data" "List contacts returns data array"

# Test 2: Create contact
echo "Test 2: POST /contacts - Create new contact"
response=$(api_request POST /contacts '{
    "name": "API Test Contact",
    "email": "apitest@example.com",
    "phone": "+15551234567",
    "title": "Software Engineer",
    "lifecycle_stage": "lead"
}')
assert_contains "$response" "id" "Create contact returns ID"
assert_contains "$response" "API Test Contact" "Create contact returns name"

# Extract contact ID for further tests
CONTACT_ID=$(echo "$response" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
echo "Created contact ID: $CONTACT_ID"

# Test 3: Get specific contact
echo "Test 3: GET /contacts/:id - Get contact details"
response=$(api_request GET "/contacts/$CONTACT_ID")
assert_contains "$response" "apitest@example.com" "Get contact returns email"
assert_contains "$response" "Software Engineer" "Get contact returns title"

# Test 4: Update contact
echo "Test 4: PATCH /contacts/:id - Update contact"
response=$(api_request PATCH "/contacts/$CONTACT_ID" '{
    "title": "Senior Software Engineer",
    "lifecycle_stage": "prospect"
}')
assert_contains "$response" "Senior Software Engineer" "Update contact reflects changes"
assert_contains "$response" "prospect" "Update contact updates lifecycle"

# Test 5: Search contacts
echo "Test 5: GET /contacts?search=API Test - Search contacts"
response=$(api_request GET "/contacts?search=API+Test")
assert_contains "$response" "API Test Contact" "Search finds contacts by name"

# Test 6: Filter by lifecycle stage
echo "Test 6: GET /contacts?lifecycle_stage=prospect - Filter by lifecycle"
response=$(api_request GET "/contacts?lifecycle_stage=prospect")
assert_contains "$response" "prospect" "Filter returns prospects"

# Test 7: Pagination
echo "Test 7: GET /contacts?limit=5 - Test pagination"
response=$(api_request GET "/contacts?limit=5")
assert_contains "$response" "pagination" "Pagination metadata present"

# Test 8: Delete contact
echo "Test 8: DELETE /contacts/:id - Delete contact"
response=$(api_request DELETE "/contacts/$CONTACT_ID")
assert_contains "$response" "success" "Delete contact succeeds"

# Test 9: Verify deletion
echo "Test 9: GET /contacts/:id - Verify contact deleted"
assert_status "${API_BASE_URL}/contacts/${CONTACT_ID}" "404" "Deleted contact returns 404"

print_summary
