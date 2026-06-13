# ManhwaForge AI - Quick Deployment (5 Minutes)

## ⚡ Super Quick Start

### Already Done ✅
- ✅ Code pushed to GitHub: https://github.com/dream32-ship/manhwaforge-ai
- ✅ Supabase database created
- ✅ Vercel configuration ready

### Now Deploy (3 Steps)

**Step 1: Go to Vercel**
```
https://vercel.com/new
```

**Step 2: Import GitHub Repository**
- Click "Import Project"
- Select: `dream32-ship/manhwaforge-ai`
- Click "Import"

**Step 3: Add Environment Variables**
- Go to "Environment Variables"
- Paste all variables from below
- Click "Deploy"

## Environment Variables to Add

Copy and paste into Vercel:

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.ejttcycuspoyuippgtyo.supabase.co:5432/postgres
VITE_APP_ID=your_manus_oauth_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
JWT_SECRET=your_jwt_secret_key
OWNER_OPEN_ID=your_open_id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id
VITE_APP_TITLE=ManhwaForge AI
VITE_APP_LOGO=https://your-logo-url.png
VITE_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=production
```

## ✅ After Deployment

1. **Wait 2-3 minutes** for build to complete
2. **Vercel will provide a URL** like: `https://manhwaforge-ai.vercel.app`
3. **Open the URL** and test the app
4. **Run database migrations** (see below)

## Run Database Migrations

After Vercel deployment is live:

```bash
# Option 1: Via Supabase Dashboard
# 1. Go to https://supabase.com
# 2. Select your project
# 3. Go to SQL Editor
# 4. Create new query
# 5. Copy SQL from: drizzle/migrations/0001_*.sql
# 6. Run the query

# Option 2: Via CLI (if you have local setup)
cd /home/ubuntu/manhwaforge-ai
pnpm drizzle-kit migrate
```

## 🎉 Done!

Your app is now live on:
```
https://manhwaforge-ai.vercel.app
```

**Features Available:**
- ✅ Landing page with cyberpunk design
- ✅ Google OAuth login
- ✅ Manus OAuth login
- ✅ Project dashboard
- ✅ AI Story Generator
- ✅ AI Character Creator
- ✅ AI Panel Generator
- ✅ Asset Library
- ✅ Export system

**All completely FREE!**

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check `vercel.json` and `package.json` |
| Database error | Verify DATABASE_URL in environment variables |
| Auth not working | Check VITE_APP_ID and OAuth URLs |
| Slow response | Free tier cold starts take ~500ms |

## Next: Custom Domain (Optional)

To add your own domain:
1. Go to Vercel Dashboard
2. Project Settings → Domains
3. Add your domain
4. Update DNS records (Vercel will show instructions)

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Repo**: https://github.com/dream32-ship/manhwaforge-ai
