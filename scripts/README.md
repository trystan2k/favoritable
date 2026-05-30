# Scripts

## Linear migration dry-run

Preview Task Master to Linear import:

```bash
pnpm linear:migrate:dry-run
```

Artifacts:

- `.taskmaster/reports/linear-migration-dry-run/plan.json`
- `.taskmaster/reports/linear-migration-dry-run/descriptions/*.md`

## Linear backlog cleanup

Apply the agreed pending-issue consolidation in Linear:

```bash
node scripts/linear-backlog-cleanup.mjs trystanworkspace
```

## Linear backlog enrichment

Update grouped issue descriptions and reprioritize the active backlog:

```bash
node scripts/linear-backlog-enrich.mjs trystanworkspace
```
