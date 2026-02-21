# TODO: API Token Testing

**Status:** Blocked by venn-73r (IAM) and venn-271 (API tokens)

## Current Limitation

The `human-test.sh` script currently uses **session-based authentication** (OAuth cookies from web browser). This works but is not ideal for:
- Automated testing in CI/CD
- Agent/bot authentication
- API-only users
- Long-lived access without browser

## What We Need

### 1. Implement API Tokens (venn-271)

**Dependencies:**
- venn-73r (IAM system) must be implemented first
- Groups and permissions must exist

**Implementation:**
- `POST /auth/tokens` - Generate token
- `GET /auth/tokens` - List user's tokens
- `DELETE /auth/tokens/:id` - Revoke token
- Bearer token authentication middleware

### 2. Create Test User Account

**Once tokens are implemented:**

```bash
# Create test user via API or database
INSERT INTO users (email, name, role) 
VALUES ('test-user@venn.local', 'Test User', 'user');

# Add to appropriate groups
INSERT INTO group_members (group_id, user_id)
VALUES 
  ((SELECT id FROM groups WHERE name = 'Human Users'), <user_id>),
  ((SELECT id FROM groups WHERE name = 'API Consumers'), <user_id>);
```

### 3. Generate Long-Lived Test Token

**Once tokens are implemented:**

```bash
# Via API (as test user)
curl -X POST https://venn-demo.avan.academy/api/auth/tokens \
  -H "Authorization: Bearer <session-token>" \
  -d '{
    "name": "Human Testing Token",
    "expires_in_days": 365
  }'

# Response:
{
  "id": 1,
  "token": "venn_test_abc123...",  # SAVE THIS!
  "name": "Human Testing Token",
  "expires_at": "2027-02-21T00:00:00Z"
}
```

**Store securely:**
```bash
# Save to env var or file
echo "venn_test_abc123..." > ~/.venn-test-token
chmod 600 ~/.venn-test-token

# Or use environment variable
export VENN_TEST_API_KEY="venn_test_abc123..."
```

### 4. Update human-test.sh for Token Auth

**Add Bearer token support:**

```bash
# Add to configuration section
API_TOKEN="${VENN_API_KEY:-$(cat ~/.venn-test-token 2>/dev/null)}"

# Update api_request function
if [ -n "$API_TOKEN" ]; then
    # Use Bearer token
    response=$(curl -s -w "\n%{http_code}" \
        -X "$method" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_TOKEN" \
        -d "$data" \
        "$url")
else
    # Fall back to session cookie
    response=$(curl -s -w "\n%{http_code}" \
        -X "$method" \
        -H "Content-Type: application/json" \
        -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
        -d "$data" \
        "$url")
fi
```

### 5. Usage After Implementation

**With environment variable:**
```bash
export VENN_API_KEY="venn_test_abc123..."
./human-test.sh all
```

**With token file:**
```bash
# Script auto-detects ~/.venn-test-token
./human-test.sh all
```

**With command-line flag:**
```bash
./human-test.sh --token "venn_test_abc123..." all
```

## Security Considerations

### Test Token Permissions

The test token should have **limited permissions**:
- ✅ Read all modules (contacts, tickets, roadmap)
- ✅ Write to all modules (for testing CRUD)
- ❌ No admin permissions (users, groups)
- ❌ No production data access (if we separate test/prod)

**Recommended group membership:**
- "API Consumers" (tokens:generate)
- "Standard Users" (contacts:*, tickets:*, roadmap:*)
- NOT "Admins"

### Token Rotation

**Best practices:**
1. **Rotate test tokens regularly** (every 90 days)
2. **Revoke on compromise** (immediate via API)
3. **Monitor usage** (check last_used_at)
4. **Single-purpose tokens** (one token per CI job, developer, etc.)

### Storage

**DO:**
- ✅ Store in environment variables or secure files
- ✅ Use `chmod 600` on token files
- ✅ Add `*.token` to `.gitignore`
- ✅ Use secret management in CI/CD

**DON'T:**
- ❌ Commit tokens to git
- ❌ Share tokens between people
- ❌ Use production tokens for testing
- ❌ Log tokens in plain text

## Implementation Checklist

- [ ] venn-73r: Implement IAM system
- [ ] venn-271: Implement API tokens
- [ ] Create test user account
- [ ] Generate test API token (365 day expiry)
- [ ] Store token securely
- [ ] Update human-test.sh for Bearer auth
- [ ] Update HUMAN_TESTING.md documentation
- [ ] Add CI/CD integration examples
- [ ] Document token rotation process
- [ ] Add automated token expiry alerts

## Temporary Workaround

**Until API tokens are implemented**, use session cookies:

1. Sign in at https://venn-demo.avan.academy
2. Extract `connect.sid` cookie from DevTools
3. Create cookie jar: `echo '...' > ~/.venn-session-cookie`
4. Run tests: `./human-test.sh all`

**Limitation:** Session cookies expire (typically 24 hours), requiring re-authentication.

---

**Target:** Implement API tokens in Sprint 2 (after IAM completion)  
**Priority:** P2 (high priority, unlocks agent workflows)  
**Blocked By:** venn-73r (IAM system)
