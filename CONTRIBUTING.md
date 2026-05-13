# Contributing

Multica uses `just` as the local command runner. Put cross-platform workflow
logic in `scripts/just.mjs` and expose it through `Justfile`.

## First-Time Setup

```bash
just setup
```

This installs dependencies, starts the shared local PostgreSQL container when
needed, creates the configured local database, and runs migrations.

## Local Development

Start the backend and web app:

```bash
just start
```

For desktop development, use three terminals:

```bash
just start
```

```bash
just build
just cli-setup
just daemon
```

```bash
just desktop
```

Useful focused commands:

```bash
just server
just web
just desktop
just daemon-status
just daemon-logs
```

## Parallel Worktrees

When developing multiple branches side by side, generate an isolated local
environment for the current Git worktree:

```bash
just init-worktree-env
just setup-worktree
just start-worktree
```

This writes `.env.worktree` with a unique local database name plus backend and
frontend ports derived from the worktree path. Use `just stop-worktree` to stop
that worktree's app processes.

## Verification

Run the full local verification pipeline:

```bash
just check
```

Focused checks:

```bash
just typecheck
just test-ts
just test-go
just sqlc
```

## Database

```bash
just db-up
just db-down
just migrate-up
just migrate-down
just db-reset
```

`just db-reset` refuses to run when `DATABASE_URL` points at a remote host.

## Self-Hosting

Use official images:

```bash
just selfhost
```

Build images from the current checkout:

```bash
just selfhost-build
```

Stop the self-hosted stack:

```bash
just selfhost-stop
```

## Command Ownership

- `Justfile` should stay thin and readable.
- Cross-platform behavior belongs in `scripts/just.mjs`.
- Prefer Node native code over shell-specific snippets for new workflow logic.
- Keep new documentation aligned with `just --list`.
