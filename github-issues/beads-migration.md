# [ISSUE] Migrate to Beads Issue Tracker

**Labels:** infrastructure, tooling, enhancement
**Priority:** Medium

## Description
Replace current markdown-based issue tracking (`github-issues/*.md`) with Beads - a distributed, git-backed graph issue tracker designed for AI agents.

## Why Beads?
- **Agent-optimized**: JSON output, dependency tracking, auto-ready task detection
- **Git-native**: Issues stored as JSONL in `.beads/`, versioned like code
- **Zero conflicts**: Hash-based IDs prevent merge collisions
- **Dependency graphs**: Track blockers, relationships, parent-child hierarchies
- **Memory-efficient**: Semantic compaction for closed tasks

## Current State
- Issues tracked in `github-issues/*.md` files
- Manual tracking, no dependency awareness
- No structured query/filtering
- Difficult for agent to parse and update

## Migration Plan

### 1. Install Beads
```bash
# Install beads CLI
curl -fsSL https://raw.githubusercontent.com/steveyegge/beads/main/scripts/install.sh | bash

# Or via npm
npm install -g @beads/bd
```

### 2. Initialize in venn Project
```bash
cd ~/clawd/venn
bd init
```

### 3. Migrate Existing Issues
- [ ] Parse `github-issues/*.md` files
- [ ] Create corresponding Beads tasks with `bd create`
- [ ] Set up dependencies where applicable
- [ ] Archive old markdown files

### 4. Update Workflow
- [ ] Update `AGENTS.md` with Beads usage instructions
- [ ] Document common commands (bd ready, bd create, bd dep)
- [ ] Add `.beads/` to git (Beads uses git as database)

### 5. Agent Integration
- [ ] Test agent can create/update tasks via `bd` CLI
- [ ] Verify JSON output parsing
- [ ] Implement task dependency tracking
- [ ] Set up auto-ready task detection

## Essential Commands for Agent

```bash
bd ready                    # List tasks with no open blockers
bd create "Title" -p 0      # Create a P0 task
bd dep add <child> <parent> # Link tasks (blocks/related/parent-child)
bd show <id>                # View task details and audit trail
bd list --json              # JSON output for parsing
```

## Acceptance Criteria
- [ ] Beads installed and initialized in venn repo
- [ ] Existing issues migrated to Beads
- [ ] `.beads/` directory tracked in git
- [ ] Agent can create/query/update tasks via bd CLI
- [ ] Old `github-issues/` directory archived
- [ ] Documentation updated in AGENTS.md

## Benefits for Agent Workflow
1. **Structured memory**: Persistent task graph instead of markdown notes
2. **Dependency awareness**: Know what's blocked vs ready to work on
3. **Long-horizon tasks**: Context preserved across sessions
4. **Git-native**: Version control for issue history
5. **Multi-agent safe**: Hash-based IDs prevent conflicts

## Resources
- Beads GitHub: https://github.com/steveyegge/beads
- Agent Instructions: https://github.com/steveyegge/beads/blob/main/AGENT_INSTRUCTIONS.md
- Installation: https://github.com/steveyegge/beads/blob/main/docs/INSTALLING.md

## Estimated Effort
~1-2 hours (install + migrate existing issues + test agent workflow)
