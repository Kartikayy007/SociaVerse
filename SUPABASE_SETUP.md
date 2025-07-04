# Supabase Setup Guide for SociaVerse

This guide will help you obtain the required Supabase credentials for the SociaVerse backend.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic understanding of database management

## Step 1: Create a New Supabase Project

1. **Log in to Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Sign in with your account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Fill in project details:
     - **Name**: `SociaVerse` (or your preferred name)
     - **Database Password**: Create a strong password (save this!)
     - **Region**: Choose the region closest to your users
   - Click "Create new project"
   - Wait for project setup to complete (2-3 minutes)

## Step 2: Get Your Supabase URL

1. **Navigate to Project Settings**
   - In your project dashboard, click the "Settings" icon (gear) in the sidebar
   - Go to "API" section

2. **Copy Project URL**
   - Find "Project URL" in the Configuration section
   - Copy the URL (format: `https://your-project-id.supabase.co`)
   - This is your `SUPABASE_URL`

## Step 3: Get Your Service Role Key

1. **In the API Settings Page**
   - Scroll down to "Project API keys" section
   - Find the "service_role" key (marked as "secret")
   - Click the "Copy" button next to it
   - This is your `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ **Important**: The service role key bypasses Row Level Security (RLS) and should be kept secret. Never expose it in client-side code.

## Step 4: Get Your JWT Secret

1. **Still in API Settings**
   - Find the "JWT Settings" section
   - Copy the "JWT Secret" value
   - This is your `JWT_SECRET`

## Step 5: Update Your Environment Variables

Update your `/Users/kartikay/Downloads/SociaVerse/apps/backend/.env` file:

```env
# Replace these with your actual values
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
JWT_SECRET="your-jwt-secret-from-supabase"
```

## Step 6: Configure Authentication Settings

1. **Go to Authentication Settings**
   - In your Supabase dashboard, click "Authentication" in the sidebar
   - Click "Settings"

2. **Configure Site URL**
   - Set "Site URL" to: `http://localhost:3000` (for development)
   - For production, use your actual domain

3. **Configure Redirect URLs**
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - Add your production URLs when deploying

4. **Email Settings (Optional)**
   - Configure email templates under "Email Templates"
   - Set up custom SMTP if needed (or use Supabase's default)

## Step 7: Set Up Database Schema

1. **Enable Required Extensions**
   - Go to "Database" → "Extensions" in Supabase dashboard
   - Enable the following extensions:
     - `uuid-ossp` (for UUID generation)
     - `postgis` (for spatial data - if not available, that's okay for now)

2. **Run Prisma Migration**
   ```bash
   cd /Users/kartikay/Downloads/SociaVerse/apps/backend
   npx prisma migrate dev --name init
   ```

## Step 8: Configure Row Level Security (RLS)

Since we're using Supabase auth with a custom backend, you may want to set up basic RLS policies:

1. **Go to Database → Tables**
2. **For each table, consider enabling RLS**:
   - Click on a table
   - Go to "RLS" tab
   - Enable RLS if you want additional security at the database level

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different credentials for development and production
   - Store production secrets securely (e.g., in CI/CD environment variables)

2. **Service Role Key**
   - Only use the service role key on the backend
   - Never expose it in client-side code
   - Consider rotating it periodically

3. **Database Access**
   - Enable RLS for sensitive tables
   - Create appropriate policies for your use case
   - Regularly audit database access

## Troubleshooting

### Common Issues:

1. **"Invalid JWT" errors**
   - Ensure JWT_SECRET matches your Supabase project's JWT secret
   - Check that the service role key is correct

2. **CORS errors**
   - Verify your Site URL and redirect URLs in Supabase auth settings
   - Ensure FRONTEND_URL in backend .env matches your frontend URL

3. **Database connection issues**
   - Verify DATABASE_URL is correct
   - Ensure your database is accessible
   - Check that required extensions are enabled

### Getting Help:

- Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- Supabase Discord: [discord.supabase.com](https://discord.supabase.com)
- GitHub Issues: Create an issue in the SociaVerse repository

## Next Steps

After completing this setup:

1. Test the backend authentication endpoints
2. Verify database connectivity
3. Test real-time functionality
4. Set up production environment with proper secrets management

Your Supabase integration should now be fully configured for SociaVerse!
