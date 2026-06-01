# Contributing to Freshly (Backend)

## Branching Strategy (Git Flow)

We use three branch types: `master`, `develop`, and feature branches.

- `master` - Production code. Direct commits blocked.
- `develop` - Integration branch for features.
- `feature/FRES-XX` - Your work. Created from `develop`, merged to `develop`.

## Daily Workflow

```bash
# 1. Start a feature
git checkout develop
git pull origin develop
git checkout -b feature/FRES-6-initialize-nestjs-backend

# 2. Commit work
git add .
git commit -m "feat: FRES-6 initialize NestJS backend"

# 3. Push and create PR
git push origin feature/FRES-6-initialize-nestjs-backend
