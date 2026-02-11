#!/bin/bash
# Common test helpers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Initialize test session
init_test() {
    TEST_NAME="$1"
    echo ""
    echo "========================================"
    echo "Testing: $TEST_NAME"
    echo "========================================"
}

# Make API request with session cookies
api_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local cookie_jar="${COOKIE_JAR:-/tmp/venn-test-cookies.txt}"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -b "$cookie_jar" -c "$cookie_jar" \
            -d "$data" \
            "${API_BASE_URL}${endpoint}"
    else
        curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -b "$cookie_jar" -c "$cookie_jar" \
            "${API_BASE_URL}${endpoint}"
    fi
}

# Assert response contains expected value
assert_contains() {
    local response="$1"
    local expected="$2"
    local test_name="$3"
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name"
        echo "Expected to find: $expected"
        echo "Response: $response"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Assert HTTP status code
assert_status() {
    local url="$1"
    local expected_status="$2"
    local test_name="$3"
    
    local actual_status=$(curl -s -o /dev/null -w "%{http_code}" -b "${COOKIE_JAR:-/tmp/venn-test-cookies.txt}" "$url")
    
    if [ "$actual_status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name (status: $actual_status)"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name"
        echo "Expected status: $expected_status, Got: $actual_status"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Print test summary
print_summary() {
    echo ""
    echo "========================================"
    echo "Test Summary"
    echo "========================================"
    echo -e "Passed: ${GREEN}${TESTS_PASSED}${NC}"
    echo -e "Failed: ${RED}${TESTS_FAILED}${NC}"
    echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}Some tests failed!${NC}"
        return 1
    fi
}

# Setup: Create test data
create_test_contact() {
    api_request POST /contacts '{
        "name": "Test Contact",
        "email": "test@example.com",
        "phone": "+1234567890",
        "lifecycle_stage": "lead"
    }'
}

create_test_ticket() {
    local contact_id="$1"
    api_request POST /tickets '{
        "contact_id": '${contact_id}',
        "subject": "Test Ticket",
        "priority": "medium",
        "status": "open"
    }'
}

create_test_roadmap_item() {
    api_request POST /roadmap '{
        "title": "Test Feature",
        "description": "Test description",
        "type": "feature",
        "priority": "medium",
        "status": "backlog"
    }'
}

# Cleanup: Delete test data
cleanup_test_data() {
    echo ""
    echo "Cleaning up test data..."
    # TODO: Implement cleanup based on test data IDs
}
