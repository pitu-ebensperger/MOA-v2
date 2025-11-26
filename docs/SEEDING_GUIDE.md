# MOA Seeding Guide (Render + Local)

This guide explains how to safely populate clients and orders using the seed scripts.

## Scripts

- `npm run seed:all`: Full seed including `seed:users` (admin user) and a cleanup of non-admin users via `usersSeed.js`. Use with caution in production — it deletes non-admin users and related data.
- `npm run seed:append`: Non-destructive bulk seed. Inserts/updates clients, categories, products, addresses, orders, carts, and wishlists — does NOT run `seed:users` and thus does not delete non-admin users.
- `npm run seed:clients:append`: Quick non-destructive seed for clients and orders only, followed by verification.
- `npm run seed:verify`: Post-seed integrity checks for products (FKs, slugs/SKUs, missing keys).

All product and order seeds use upsert semantics:
- Products: `ON CONFLICT (slug) DO UPDATE`
- Orders: `ON CONFLICT (order_code) DO UPDATE` and replaces `orden_items`

## Render Job

Your `render.yaml` includes a Job service `moa-seed-job`. It currently runs `seed:all`. If you want to avoid deleting non-admin users in production, update `render.yaml` to run `npm run seed:append` instead.

### Example (non-destructive Job)
```
startCommand: |
  cd backend && \
  npm run seed:append
```

## Running locally against Render DB

1. Ensure `backend/.env` is configured for Render DB (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, SSL).
2. Run non-destructive seed:
```
cd backend
npm run seed:append
npm run seed:verify
```

## Admin token and verification

1. Get backend URL from Render (e.g., `https://moa-backend-xxxx.onrender.com`).
2. Login as admin to get token:
```
ADMIN_TOKEN=$(curl -sS -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@moa.cl","password":"<ADMIN_PASSWORD>"}' | jq -r '.accessToken')
```
3. Verify endpoints:
```
curl -sS "$BACKEND_URL/admin/analytics/sales" -H "Authorization: Bearer $ADMIN_TOKEN" | jq
curl -sS "$BACKEND_URL/admin/users?page=1&limit=20" -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

## Notes
- Set `ADMIN_PASSWORD` and `DUAL_PASSWORD` env vars in Render before running seeds.
- Orders dates are normalized to recent windows, so dashboards should populate.
