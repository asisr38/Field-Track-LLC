# Cloudflare Turnstile Setup Guide

## ✅ What is Cloudflare Turnstile?

Cloudflare Turnstile is a **FREE** bot protection solution - it's Cloudflare's privacy-friendly alternative to reCAPTCHA. It's:

- **100% FREE** for most use cases (1M verifications/month)
- More privacy-friendly than reCAPTCHA
- Better user experience (usually invisible)
- No tracking or data collection

## 🚀 Setup Instructions

### Step 1: Get Your FREE Turnstile Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sign up for a **FREE** Cloudflare account (if you don't have one)
3. Navigate to **Turnstile** in the left sidebar
4. Click **"Add Site"**
5. Configure:
   - **Site Name**: Field Track LLC Contact Form
   - **Domain**: Your domain (or `localhost` for testing)
   - **Widget Mode**: Managed (Recommended)
6. Click **"Add"**
7. You'll receive two keys:
   - **Site Key** (public - used in frontend)
   - **Secret Key** (private - used in backend)

### Step 2: Add Keys to Your Environment Variables

Create a `.env.local` file in your project root (if you don't have one already) and add:

```bash
# Existing SMTP Configuration
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
RECIPIENT_EMAIL=Richard.Smith@FieldTrackLLC.com

# Cloudflare Turnstile Configuration
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key-here
TURNSTILE_SECRET_KEY=your-secret-key-here
```

**Important Notes:**

- The `NEXT_PUBLIC_` prefix is REQUIRED for the site key (it makes it available to the frontend)
- The secret key should NEVER have the `NEXT_PUBLIC_` prefix
- NEVER commit `.env.local` to git

### Step 3: Deploy to Production

When deploying (e.g., to Vercel):

1. Go to your project settings
2. Add the environment variables:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = your site key
   - `TURNSTILE_SECRET_KEY` = your secret key
3. Redeploy your application

### Step 4: Test Locally

1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Visit your contact form
3. You should see the Turnstile widget appear below the message field
4. Complete the form and verify it works

## 🧪 Testing Mode

For local development without keys, the component will use Cloudflare's test key (`1x00000000000000000000AA`) which always passes. However, you should replace this with your real keys for production!

## 💡 How It Works

1. **Frontend**: User completes the form → Turnstile widget verifies they're human → Generates token
2. **Backend**: Server receives token → Verifies with Cloudflare → If valid, processes form
3. **Result**: Bots are blocked automatically!

## 🔒 Security Features

- Server-side verification (bots can't bypass)
- Token-based (one-time use)
- IP-based rate limiting
- Challenge escalation for suspicious behavior

## 📊 Monitoring

To view Turnstile analytics:

1. Go to Cloudflare Dashboard → Turnstile
2. Click on your site
3. View statistics: requests, solve rate, challenge rate, etc.

## 🆓 Pricing

Cloudflare Turnstile is **FREE** for:

- Up to 1 million verifications per month
- Unlimited domains
- All features included

This is more than enough for most small to medium-sized businesses!

## ❓ Troubleshooting

### Widget Not Showing?

- Check that `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set correctly
- Ensure you restarted the dev server after adding env vars
- Check browser console for errors

### Verification Failing?

- Verify `TURNSTILE_SECRET_KEY` is correct (no spaces)
- Check that your domain is added in Cloudflare Dashboard
- Look at server logs for specific error messages

### Testing on Localhost?

- Add `localhost` to your allowed domains in Cloudflare Dashboard
- Or use the test key for development

## 📚 Additional Resources

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [React Turnstile Package](https://github.com/marsidev/react-turnstile)

---

**Status**: ✅ Cloudflare Turnstile is now integrated into your contact form!
