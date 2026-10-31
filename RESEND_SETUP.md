# Resend Email Setup Guide

## Configuration Steps

### 1. Get Your Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the API key (starts with `re_`)

### 2. Configure Environment Variables

Create a `.env.local` file in the project root with the following content:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=priyanka123
MYSQL_DATABASE=dailykart
```

### 3. Replace the API Key

Replace `re_your_api_key_here` with your actual Resend API key.

### 4. For Production (Optional)

To use a custom domain for sending emails:

1. Go to Resend Dashboard → Domains
2. Add and verify your domain
3. Update `RESEND_FROM_EMAIL` to use your verified domain
4. Example: `noreply@yourdomain.com`

## Testing

After configuration, test the email functionality:

1. **Signup**: Create a new user account
   - A welcome email will be sent to the user's email

2. **Login**: Log in to any account
   - A login confirmation email will be sent

## Current Email Templates

The system sends three types of emails:

1. **Welcome Email** - Sent after user signup
2. **Login Success Email** - Sent after successful login
3. **Order Confirmation Email** - Sent after order placement

## Troubleshooting

### Emails not sending?

1. Check if `RESEND_API_KEY` is set in `.env.local`
2. Verify the API key is correct and active
3. Check the server console logs for error messages
4. Make sure port 3000 (or your configured port) is accessible

### Using Resend Free Tier

- 100 emails per day
- 3,000 emails per month
- Perfect for development and small projects

