# Project Camp — Frontend

React (Vite) client for the Project Camp backend API described in `../PRD.md`.

## Features
- **Auth**: register, login/logout, email verification, resend verification, forgot/reset password, change password
- **Projects**: list (with your role + member count), create, edit/delete (Admin)
- **Members**: list, add by email with role, change role, remove (Admin)
- **Tasks**: Kanban board (To do / In progress / Done) with drag-and-drop status changes, create with file attachments, edit, delete (Admin / Project Admin)
- **Subtasks**: add/delete (Admin / Project Admin), tick complete (all members)
- **Notes**: list, create/edit/delete (Admin)
- **Health**: API online/offline indicator in the header
- UI actions are gated by the permission matrix in PRD §4.2 (`src/constants.js`)

## Run
```bash
cd frontend
cp .env.example .env     # optional, defaults work for local dev
npm install
npm run dev              # http://localhost:5173
```
Start the backend on port 3000 (`npm run dev` in the repo root). The Vite dev server proxies
`/api` and `/images` to `VITE_BACKEND_URL`, so no CORS setup is needed in development.
For production, set `VITE_API_BASE_URL` to the backend's full `/api/v1` URL and add the frontend
origin to the backend's `CORS_ORIGIN`.

## How it talks to the API
- `src/api/client.js` — axios instance. Sends cookies (`withCredentials`) **and** a `Bearer` token
  (tokens from the login response are kept in `localStorage`). On a `401` it calls
  `POST /auth/refresh-token` once and retries the request.
- Responses are unwrapped from the backend's `ApiResponse` (`res.data.data`); validation errors
  (`422` with `error: [{field: msg}]`) are shown inline.
- `src/api/{auth,projects,tasks,notes}.js` — one function per endpoint in the PRD.
  Note: matches the backend's actual routes where they differ from the PRD
  (`POST /auth/current-user`, `/auth/resend-email-varification`).
- Task attachments are sent as `multipart/form-data` under the field name `attachments`.

## Email links
Point the backend's email links at the frontend so users land on these pages:
- Verification: `http://localhost:5173/verify-email/:token`
- Password reset: set `FORGOT_PASSWORD_REDIRECT_URL=http://localhost:5173/reset-password`
