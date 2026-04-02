# Domain-Based Organization System

## Overview

TrackTimi now supports domain-based organization access where each organization has its own domain, and employees can login through that domain to access their organization's dashboard.

## How It Works

### 1. Organization Registration
- Organizations register with a unique domain (e.g., `acme.com`)
- The domain is stored in the `Organization.Org_Domain` field
- Employees will access the system through this domain

### 2. Employee Login Flow
- Employees go to their organization's domain (e.g., `acme.com`)
- The system automatically detects the organization from the domain
- Employees login with their email/password for that specific organization
- They are redirected to their appropriate dashboard (admin or employee)

### 3. Domain Detection
- Server middleware detects the organization based on the `Host` header
- Supports both root domains (`acme.com`) and subdomains (`acme.tracktimi.com`)
- Skips detection for the main application domain (configured in `.env`)

## Setup Instructions

### 1. Database Migration
Run the migration to add the domain column:
```sql
ALTER TABLE Organization ADD COLUMN Org_Domain TEXT UNIQUE;
```

### 2. Environment Configuration
Add to your `.env` file:
```
MAIN_DOMAIN=localhost  # Your main app domain
FRONTEND_URL=http://localhost:5173
```

### 3. Domain Routing
For production, configure your web server (nginx/apache) to:
- Route all organization domains to your TrackTimi application
- The app will automatically detect the organization from the domain

### 4. DNS Configuration
For each organization domain:
- Point the domain to your server
- Configure SSL certificates for the domain

## API Endpoints

### Organization Registration
```
POST /api/auth/register-org
Body: {
  "orgName": "Acme Corp",
  "orgDomain": "acme.com",
  "orgSlug": "acme-corp",
  // ... other fields
}
```

### Domain-Based Login
```
POST /api/auth/domain-login
Body: {
  "email": "employee@acme.com",
  "password": "password"
}
```
- Automatically detects organization from domain
- Only allows login for users in that organization

## Example Usage

### 1. Register Organization
- Admin registers "Acme Corp" with domain "acme.com"
- System creates organization with domain

### 2. Employee Access
- Employee goes to `acme.com`
- Sees organization-specific login page
- Logs in with their credentials
- Redirected to `/acme-corp/user-dashboard` or `/acme-corp/dashboard`

### 3. Admin Access
- Admin can also login through `acme.com`
- Gets admin dashboard with full organization management

## Security Considerations

- Domain validation ensures users can only login to their organization
- JWT tokens include organization context
- Cross-organization access is prevented at the API level

## Development Notes

- For local development, use different ports or subdomains
- Test with multiple organizations using different domains
- Domain detection middleware runs on every request
- Organization context is available in `req.organization` for protected routes