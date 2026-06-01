# Contributing to Freshly (Backend)

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- npm (comes with Node.js)

## Setup

```bash
git clone https://github.com/ola-freshly/freshly-backend.git
cd freshly-backend
npm install
```

Copy environment variables if available:

```bash
cp .env.example .env
```

## Branching Strategy (Git Flow)

- `master` — Production code. Direct commits blocked.
- `develop` — Integration branch for features.
- `feature/FRES-XX` — Your work. Created from `develop`, merged to `develop`.

## Daily Workflow

```bash
# 1. Start a feature
git checkout develop
git pull origin develop
git checkout -b feature/FRES-XX-description

# 2. Commit work
git add .
git commit -m "feat: FRES-XX description"

# 3. Push and create PR
git push origin feature/FRES-XX-description
```

## Commit Conventions

Use conventional commits with the Jira ticket:

| Type | When to use | Example |
|---|---|---|
| `feat` | A new feature or endpoint | `feat: FRES-42 add user registration endpoint` |
| `fix` | A bug fix | `fix: FRES-43 handle null email on login` |
| `refactor` | Code change that neither fixes a bug nor adds a feature (e.g., renaming, restructuring) | `refactor: FRES-44 extract validation to shared util` |
| `docs` | Changes to documentation only (README, CONTRIBUTING, etc.) | `docs: FRES-45 update API usage in README` |

## Pull Request Process

1. Push your feature branch
2. Open a PR against `develop`
3. Fill in the template:

```
Jira: FRES-XX
Changes: What did you do?
```

4. Request review from at least one team member
5. Squash-merge into `develop` once approved
