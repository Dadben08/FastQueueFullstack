# FastQueue Backend

Backend foundation for FastQueue using Node.js, Express, MongoDB/Mongoose and JWT.

## Setup

1. Copy `.env.example` to `.env`.
2. Add your MongoDB Atlas connection string.
3. Set a strong JWT secret.
4. Run:

```bash
npm install
npm run dev
```

## Initial endpoints

- GET `/`
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/profile`
- POST `/api/company`
- GET `/api/company`
- PUT `/api/company`

The login response includes `hasCompany`, which the React frontend can use to route the user to either the dashboard or company registration.
