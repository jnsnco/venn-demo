# API Testing Suite

Comprehensive tests for venn API endpoints.

## Purpose
- Test all current API functionality
- Document API capabilities and gaps
- Identify missing fields and features
- Validate agent workflows

## Structure
- `test-auth.sh` - Authentication endpoints
- `test-contacts.sh` - Contacts CRUD
- `test-tickets.sh` - Tickets CRUD
- `test-roadmap.sh` - Roadmap CRUD
- `test-users.sh` - User management (admin)
- `run-all.sh` - Run complete test suite

## Usage
```bash
# Set base URL and credentials
export API_BASE_URL="https://venn-demo.avan.academy/api"
export TEST_EMAIL="test@venn.local"
export TEST_PASSWORD="test123"

# Run all tests
./run-all.sh

# Run specific test
./test-contacts.sh
```

## Test Results
Results logged to `test-results/` with timestamp.
