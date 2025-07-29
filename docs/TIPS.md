# Install dependencies

```bash
pnpm install jest --save-dev --recursive --filter=web --filter=@repo/ui --filter=@repo/web
```

# Update dependencies to same version in all packages

```bash
pnpm up --recursive typescript@latest
```

# Filtering by source control changes

Comparing to the previous commit: turbo build --filter=[HEAD^1]
Comparing to the main branch: turbo build --filter=[main...my-feature]
Comparing specific commits using SHAs: turbo build --filter=[a1b2c3d...e4f5g6h]
Comparing specific commits using branch names: turbo build --filter=[your-feature...my-feature]
