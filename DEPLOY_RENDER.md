# Deploy HealthMatrix on Render

This project can be deployed as a single Render Web Service:
- Backend (`Express`) serves API routes
- Frontend (`React`) is built and served by backend in production

## 1. Push latest code
Make sure your latest code is on GitHub (you already pushed branch `Hapreet`).

## 2. Create service in Render
1. Open Render Dashboard.
2. Click **New +** -> **Blueprint** (recommended) or **Web Service**.
3. Connect repo: `yammanuruharish456-png/HealthMatrix`.
4. Select branch: `Hapreet`.

If using Blueprint, Render reads `render.yaml` automatically.

## 3. Required environment variables
Set these in Render service settings:

- `NODE_ENV=production`
- `MONGODB_URI=<your-mongodb-atlas-uri>`
- `JWT_SECRET=<strong-random-secret>`
- `GOOGLE_CLIENT_ID=<your-google-oauth-client-id>`
- `OPENROUTER_API_KEY=<your-openrouter-api-key>` (only if chatbot is used)
- `FRONTEND_URL=<your-render-service-url>`

Example `FRONTEND_URL`:
- `https://healthmatrix.onrender.com`

## 4. Build and start commands
These are already in `render.yaml`:

- Build: `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
- Start: `npm --prefix backend start`

## 5. Google OAuth configuration
In Google Cloud Console, add your deployed URL:

- Authorized JavaScript origins:
  - `https://healthmatrix.onrender.com`

You do not need OAuth redirect URI for Google Identity Services one-tap flow used here, but origin must be exact.

## 6. Verify deployment
After deploy, check:

- App UI: `https://<your-service>.onrender.com`
- API health: `https://<your-service>.onrender.com/api/health`

Expected health response:

```json
{
  "status": "OK",
  "message": "Health Matrix Hospital API is running"
}
```

## Troubleshooting
- Blank UI / 404 on refresh:
  - Ensure backend is serving frontend build (`NODE_ENV=production`).
- API CORS error:
  - Set `FRONTEND_URL` exactly to deployed app URL.
- Google login fails:
  - Ensure `GOOGLE_CLIENT_ID` is same in backend env and frontend build env.
  - Ensure deployed origin is added in Google OAuth JavaScript origins.
