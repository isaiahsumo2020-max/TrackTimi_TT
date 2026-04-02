(Project README)

Run the app locally (quick start)

1. Backend

	- Change to backend and install dependencies:

```powershell
cd backend
npm install
```

	- (Optional) set SMTP env vars to enable real invitation emails:

```powershell
setx SMTP_HOST "smtp.example.com"
setx SMTP_USER "user@example.com"
setx SMTP_PASS "yourpass"
setx SMTP_FROM "no-reply@example.com"
setx FRONTEND_URL "http://localhost:5175"
```

	- Start backend:

```powershell
node server.js
```

2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

3. Invitation activation flow

- Admin: POST `/api/org/invite` to create an invitation (protected admin route).
- Invitee: open `http://localhost:5175/activate/<token>` to view invitation and set password.

Notes
- If SMTP is not configured, the backend logs the invitation token to console. Use that token to activate.
- After activation the invite is marked used and a user account is created.

