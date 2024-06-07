# Org

A simple organization web app using verification credential for more authorization.

## Getting Started

### Prerequisites

- Node.js v20+
- yarn v1.22+

### Environment Variables

```bash
cp ./apps/org/.env.example ./apps/org/.env.local
```

Edit the `.env.local` file and set the environment variables.

```ini
AUTH_SALT_ROUNDS= # number of salt rounds for hashing password
AUTH_SECRET= # secret for JWT, run `openssl rand -base64 32` in terminal to generate
AUTH_EXPIRES= # JWT expiration time, e.g. 1d, 1h, 1m (support s, m, h, d, w)

NEXT_PUBLIC_NAME= # organization name
NEXT_PUBLIC_BASE_URL=http://localhost:8000 # base URL for the app
```
