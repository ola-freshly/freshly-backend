# Auth: Register & Login Design

**Date:** 2026-06-15
**Ticket:** FRES-36
**Branch:** FRES-36-dev-implement-layout-app
**Base:** feature/FRES-14-initial-schema
**Scope:** Email-based registration with verification, JWT login (access + refresh tokens)

---

## Overview

Implement customer registration and login for the Freshly backend. Users register with email and password, receive a verification email, and must verify before logging in. Login issues an access token (15m) and a refresh token (7d).

No phone support in this ticket. No OAuth in this ticket.

---

## Data Model Changes

Migration adds three columns to the existing `users` table:

| Column | Type | Default | Nullable |
|---|---|---|---|
| `is_verified` | `boolean` | `false` | no |
| `verification_token` | `varchar` | `null` | yes |
| `refresh_token_hash` | `varchar` | `null` | yes |

`password_hash` remains `NOT NULL`. All other existing columns are unchanged.

---

## Module Structure

```
src/auth/
  auth.module.ts
  auth.controller.ts
  auth.service.ts
  strategies/
    jwt.strategy.ts
    jwt-refresh.strategy.ts
  dto/
    register.dto.ts
    login.dto.ts
  interfaces/
    jwt-payload.interface.ts

src/mail/
  mail.module.ts
  mail.service.ts
  templates/
    verification.hbs
```

---

## API Endpoints

### POST /auth/register

**Request body:**
```json
{ "name": "string", "email": "string", "password": "string (min 8 chars)" }
```

**Success — 201:**
```json
{ "message": "Registration successful. Please check your email to verify your account." }
```

**Errors:**
- `400` — validation failure (missing fields, invalid email, password too short)
- `409` — email already registered

**Behaviour:**
1. Validate DTO via `class-validator` global pipe
2. Check for existing user by email — `409` if found
3. Hash password with `bcrypt` (10 rounds)
4. Generate UUID v4 as `verification_token`
5. Save user with `is_verified = false`
6. Send verification email (fire-and-forget; errors logged, not thrown)
7. Return 201 message

---

### GET /auth/verify-email?token=\<uuid\>

**Success:** HTTP `302` redirect to `FRONTEND_URL/login?verified=true`

**Errors:**
- `400` — token not found or already used

**Behaviour:**
1. Find user where `verification_token = token`
2. If not found → `400 Bad Request`
3. Set `is_verified = true`, set `verification_token = null`
4. Save user
5. Redirect to `${FRONTEND_URL}/login?verified=true`

---

### POST /auth/login

**Request body:**
```json
{ "email": "string", "password": "string" }
```

**Success — 200:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": { "id": "string", "name": "string", "email": "string" }
}
```

**Errors:**
- `400` — validation failure
- `401` — email not found or wrong password (same message for both)
- `403` — account not verified

**Behaviour:**
1. Validate DTO
2. Find user by email — `401` if not found
3. Compare password with bcrypt — `401` if mismatch
4. Check `is_verified` — `403 "Please verify your email before logging in"` if false
5. Sign access token (`{ sub, email }`, expires `15m`, secret `JWT_SECRET`)
6. Sign refresh token (`{ sub }`, expires `7d`, secret `JWT_REFRESH_SECRET`)
7. Hash refresh token with bcrypt, store in `refresh_token_hash`
8. Return tokens + user summary

---

## Environment Variables Required

```env
# Existing
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=

# Mail (already configured by user)
MAIL_HOST=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_EMAIL=

# App
FRONTEND_URL=
```

---

## Dependencies to Install

```
@nestjs/jwt
@nestjs/passport
passport
passport-jwt
@nestjs-modules/mailer
nodemailer
handlebars
bcrypt
class-validator
class-transformer
uuid
@types/passport-jwt
@types/bcrypt
@types/nodemailer
@types/uuid
```

---

## Security Notes

- Passwords hashed with bcrypt (10 rounds)
- Refresh token stored as bcrypt hash — raw token never persisted
- Login errors do not distinguish between "user not found" and "wrong password"
- Verification tokens are single-use (cleared after use)
- Access token TTL: 15m; Refresh token TTL: 7d

---

## Out of Scope (this ticket)

- Phone registration/login
- OAuth (Google, Facebook, etc.)
- Refresh token rotation endpoint (`POST /auth/refresh`)
- Logout endpoint (`POST /auth/logout`)
- Password reset flow
