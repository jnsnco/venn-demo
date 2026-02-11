#!/bin/bash
# Run all API tests

set -e

# Configuration
API_BASE_URL="${API_BASE_URL:-https://venn-demo.avan.academy/api}"
COOKIE_JAR="/tmp/venn-test-cookies.txt"
RESULTS_DIR="test-results"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Create results directory
mkdir -p "$RESULTS_DIR"

echo "========================================"
echo "venn API Test Suite"
echo "========================================"
echo "Base URL: $API_BASE_URL"
echo "Timestamp: $TIMESTAMP"
echo ""

# Check if user is authenticated
echo "Checking authentication..."
if [ ! -f "$COOKIE_JAR" ]; then
    echo "No session found. Please authenticate first:"
    echo "  1. Open https://venn-demo.avan.academy"
    echo "  2. Sign in with GitHub/Google"
    echo "  3. Run this script again"
    echo ""
    echo "Or export session cookies to $COOKIE_JAR"
    exit 1
fi

# Run tests
OVERALL_RESULT=0

run_test() {
    local test_file="$1"
    local test_name=$(basename "$test_file" .sh)
    local log_file="$RESULTS_DIR/${test_name}-${TIMESTAMP}.log"
    
    echo "Running: $test_name..."
    if bash "$test_file" > "$log_file" 2>&1; then
        echo "✓ $test_name passed"
    else
        echo "✗ $test_name failed (see $log_file)"
        OVERALL_RESULT=1
    fi
}

# Run all test files
for test in test-contacts.sh test-tickets.sh test-roadmap.sh; do
    if [ -f "$test" ]; then
        run_test "$test"
    fi
done

echo ""
echo "========================================"
echo "Test Suite Complete"
echo "========================================"
echo "Results saved to: $RESULTS_DIR/"

if [ $OVERALL_RESULT -eq 0 ]; then
    echo "✓ All tests passed!"
else
    echo "✗ Some tests failed. Check logs for details."
fi

exit $OVERALL_RESULT
