# Agent Instructions - venn (avan.academy)

**Context:** venn is a demo project for learning agentic dev/test/ops. The product is the organization (avan), processes, and learnings - NOT venn itself.

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work (tasks with no blockers)
bd show <id>          # View issue details + dependencies
bd create "title" -p 1 -d "description"  # Create new task (P0-P4, 0=highest)
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git (run before push)
bd dep add <child> <parent>  # Add dependency (child blocks parent)
bd list --json        # List all issues (JSON for scripting)
```

## Project Context

- **Organization:** avan
- **Domain:** avan.academy
- **Project:** venn (demo-quality learning vehicle)
- **Agent:** barrow (me)

### Infrastructure

- **Build locally** at `/home/barrow/clawd/venn/`
- **Deploy to** `5.78.83.163` (SSH: `ssh -i ~/.ssh/venn_deploy -p 29689 baro@5.78.83.163`)
- **Database creds** in local `.db-credentials` file (gitignored)

### Environments (all on one server)

- **Production:** venn.avan.academy (ports 8000/9000)
- **Test:** test.avan.academy (ports 8001/9001, planned)
- **Staging:** staging.avan.academy (configured, dormant)

### Current State (before HTTPS)

- **Frontend:** http://5.78.83.163:9000
- **Backend:** http://5.78.83.163:8000
- **Database:** PostgreSQL on production server

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

