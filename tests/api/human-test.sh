#!/bin/bash
# Human-Friendly API Testing Script
# 
# Usage:
#   1. Sign in at https://venn-demo.avan.academy (get session cookie)
#   2. Run: ./human-test.sh
#   3. Follow prompts to test different endpoints

set -e

# Configuration
API_BASE="https://venn-demo.avan.academy/api"
COOKIE_JAR="$HOME/.venn-session-cookie"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Pretty print functions
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Pretty print JSON
print_json() {
    local json="$1"
    # Simple formatting (works without jq)
    echo "$json" | sed 's/,/,\n  /g' | sed 's/{/{\n  /g' | sed 's/}/\n}/g'
}

# Make API request
api_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local url="${API_BASE}${endpoint}"
    
    echo -e "${CYAN}Request:${NC} $method $endpoint"
    
    if [ -n "$data" ]; then
        echo -e "${CYAN}Body:${NC}"
        print_json "$data"
    fi
    
    echo ""
    
    # Make request
    local response
    local http_code
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
            -d "$data" \
            "$url")
    else
        response=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
            "$url")
    fi
    
    # Split response and status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Print response
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}Response: $http_code${NC}"
    else
        echo -e "${RED}Response: $http_code${NC}"
    fi
    
    echo -e "${CYAN}Body:${NC}"
    print_json "$body"
    
    echo ""
    
    # Return body for further processing
    echo "$body"
}

# Check authentication
check_auth() {
    print_header "Checking Authentication"
    
    if [ ! -f "$COOKIE_JAR" ]; then
        print_error "No session cookie found at: $COOKIE_JAR"
        echo ""
        print_info "To authenticate:"
        echo "  1. Open https://venn-demo.avan.academy in your browser"
        echo "  2. Sign in with GitHub/Google"
        echo "  3. Open DevTools (F12) → Application → Cookies"
        echo "  4. Find 'connect.sid' cookie"
        echo "  5. Run this to create cookie jar:"
        echo ""
        echo "     echo '.venn-demo.avan.academy\tFALSE\t/\tTRUE\t0\tconnect.sid\tYOUR_SESSION_ID' > $COOKIE_JAR"
        echo ""
        exit 1
    fi
    
    # Test authentication
    local response=$(api_request GET /auth/me)
    
    if echo "$response" | grep -q '"id"'; then
        local user_email=$(echo "$response" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
        local user_name=$(echo "$response" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        print_success "Authenticated as: $user_name ($user_email)"
    else
        print_error "Authentication failed. Session may be expired."
        echo ""
        print_info "Please sign in again and update cookie jar."
        exit 1
    fi
}

# Test Contacts API
test_contacts() {
    print_header "Testing Contacts API"
    
    # List contacts
    print_info "Listing contacts..."
    local contacts=$(api_request GET "/contacts?limit=5")
    
    # Create contact
    print_info "Creating new contact..."
    local new_contact=$(api_request POST /contacts '{
        "name": "Test Contact",
        "email": "test-'$(date +%s)'@example.com",
        "phone": "+15551234567",
        "title": "Test Engineer",
        "lifecycle_stage": "lead"
    }')
    
    # Extract contact ID
    local contact_id=$(echo "$new_contact" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    
    if [ -n "$contact_id" ]; then
        print_success "Created contact with ID: $contact_id"
        
        # Get specific contact
        print_info "Fetching contact details..."
        api_request GET "/contacts/$contact_id" > /dev/null
        
        # Update contact
        print_info "Updating contact..."
        api_request PATCH "/contacts/$contact_id" '{
            "title": "Senior Test Engineer"
        }' > /dev/null
        
        # Delete contact
        print_info "Deleting test contact..."
        api_request DELETE "/contacts/$contact_id" > /dev/null
        
        print_success "Contact CRUD test complete"
    else
        print_error "Failed to create contact"
    fi
}

# Test Tickets API
test_tickets() {
    print_header "Testing Tickets API"
    
    # List tickets
    print_info "Listing tickets..."
    local tickets=$(api_request GET "/tickets?limit=5")
    
    # Create a contact first (tickets need contact_id)
    print_info "Creating contact for ticket..."
    local contact=$(api_request POST /contacts '{
        "name": "Ticket Test Contact",
        "email": "ticket-test-'$(date +%s)'@example.com"
    }')
    
    local contact_id=$(echo "$contact" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    
    if [ -n "$contact_id" ]; then
        # Create ticket
        print_info "Creating ticket..."
        local ticket=$(api_request POST /tickets '{
            "contact_id": '${contact_id}',
            "subject": "Test Ticket - API Testing",
            "priority": "medium",
            "status": "open"
        }')
        
        local ticket_id=$(echo "$ticket" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
        
        if [ -n "$ticket_id" ]; then
            print_success "Created ticket with ID: $ticket_id"
            
            # Add message
            print_info "Adding message to ticket..."
            api_request POST "/tickets/$ticket_id/messages" '{
                "body": "This is a test message from the API.",
                "is_internal": false
            }' > /dev/null
            
            # Get messages
            print_info "Fetching ticket messages..."
            api_request GET "/tickets/$ticket_id/messages" > /dev/null
            
            # Update ticket
            print_info "Updating ticket status..."
            api_request PATCH "/tickets/$ticket_id" '{
                "status": "resolved"
            }' > /dev/null
            
            # Delete ticket
            print_info "Deleting test ticket..."
            api_request DELETE "/tickets/$ticket_id" > /dev/null
            
            print_success "Ticket CRUD test complete"
        else
            print_error "Failed to create ticket"
        fi
        
        # Clean up contact
        api_request DELETE "/contacts/$contact_id" > /dev/null
    else
        print_error "Failed to create contact for ticket test"
    fi
}

# Test Roadmap API
test_roadmap() {
    print_header "Testing Roadmap API"
    
    # List roadmap items (public, no auth needed)
    print_info "Listing roadmap items..."
    local items=$(api_request GET "/roadmap?limit=5")
    
    # Create roadmap item
    print_info "Creating roadmap item..."
    local item=$(api_request POST /roadmap '{
        "title": "Test Feature - API Testing",
        "description": "This is a test feature created via API",
        "type": "feature",
        "priority": "low",
        "status": "backlog"
    }')
    
    local item_id=$(echo "$item" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    
    if [ -n "$item_id" ]; then
        print_success "Created roadmap item with ID: $item_id"
        
        # Get item
        print_info "Fetching roadmap item..."
        api_request GET "/roadmap/$item_id" > /dev/null
        
        # Update item
        print_info "Updating roadmap item..."
        api_request PATCH "/roadmap/$item_id" '{
            "status": "planned"
        }' > /dev/null
        
        # Vote for item
        print_info "Voting for roadmap item..."
        api_request POST "/roadmap/$item_id/vote" '{}' > /dev/null
        
        # Delete item
        print_info "Deleting test roadmap item..."
        api_request DELETE "/roadmap/$item_id" > /dev/null
        
        print_success "Roadmap CRUD test complete"
    else
        print_error "Failed to create roadmap item"
    fi
}

# Main menu
show_menu() {
    print_header "venn API Human Testing Tool"
    
    echo "What would you like to test?"
    echo ""
    echo "  1) Check Authentication"
    echo "  2) Test Contacts API"
    echo "  3) Test Tickets API"
    echo "  4) Test Roadmap API"
    echo "  5) Run All Tests"
    echo "  6) Custom Request"
    echo "  0) Exit"
    echo ""
    read -p "Enter choice [0-6]: " choice
    
    case $choice in
        1) check_auth ;;
        2) check_auth; test_contacts ;;
        3) check_auth; test_tickets ;;
        4) check_auth; test_roadmap ;;
        5) check_auth; test_contacts; test_tickets; test_roadmap ;;
        6) custom_request ;;
        0) exit 0 ;;
        *) print_error "Invalid choice"; show_menu ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Custom request
custom_request() {
    print_header "Custom API Request"
    
    read -p "Method (GET/POST/PATCH/DELETE): " method
    read -p "Endpoint (e.g., /contacts): " endpoint
    read -p "JSON Body (empty for none): " body
    
    api_request "$method" "$endpoint" "$body"
}

# Entry point
main() {
    # If arguments provided, run non-interactive
    if [ "$1" = "contacts" ]; then
        check_auth
        test_contacts
    elif [ "$1" = "tickets" ]; then
        check_auth
        test_tickets
    elif [ "$1" = "roadmap" ]; then
        check_auth
        test_roadmap
    elif [ "$1" = "all" ]; then
        check_auth
        test_contacts
        test_tickets
        test_roadmap
    else
        # Interactive menu
        show_menu
    fi
}

main "$@"
