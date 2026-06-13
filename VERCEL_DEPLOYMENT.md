# ManhwaForge AI - Free Deployment on Vercel + Supabase

## Complete Free Stack

| Component | Service | Free Tier | Cost |
|-----------|---------|-----------|------|
| **Frontend** | Vercel | Unlimited deployments, auto-scaling | $0 |
| **Backend** | Vercel Functions | 100GB/month bandwidth | $0 |
| **Database** | Supabase PostgreSQL | 500MB storage, unlimited API | $0 |
| **Storage** | Supabase Storage | 1GB storage | $0 |
| **AI Services** | Groq + Hugging Face | Free tier APIs | $0 |
| **Image Generation** | Pollinations.ai | Unlimited free | $0 |
| **Total Monthly Cost** | - | - | **$0** |

## Step-by-Step Deployment

### Step 1: Set Up Supabase (Already Done ✓)

You've already created a Supabase project with connection string:
```
postgresql://postgres:[PASSWORD]@db.ejttcycuspoyuippgtyo.supabase.co:5432/postgres
```

### Step 2: Deploy to Vercel

**Option A: Deploy via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com
2. Click "Sign Up" → Use GitHub (dream32-ship)
3. Click "Import Project"
4. Select repository: `dream32-ship/manhwaforge-ai`
5. Click "Import"
6. Configure environment variables (see below)
7. Click "Deploy"

**Option B: Deploy via Vercel CLI**

```bash
npm install -g vercel
cd /home/ubuntu/manhwaforge-ai
vercel
```

### Step 3: Configure Environment Variables in Vercel

In Vercel Dashboard → Project Settings → Environment Variables, add:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.ejttcycuspoyuippgtyo.supabase.co:5432/postgres

# Authentication (use your existing values)
VITE_APP_ID=your_manus_oauth_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
JWT_SECRET=your_jwt_secret_key

# Owner Info
OWNER_OPEN_ID=your_open_id
OWNER_NAME=Your Name

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App Config
VITE_APP_TITLE=ManhwaForge AI
VITE_APP_LOGO=https://your-logo-url.png

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Node
NODE_ENV=production
```

### Step 4: Run Database Migrations

After deployment, run migrations:

```bash
# Option 1: Via Supabase Dashboard
# Go to SQL Editor → Run the migration SQL from drizzle/migrations/

# Option 2: Via CLI
pnpm drizzle-kit migrate
```

### Step 5: Verify Deployment

1. Vercel will provide a URL like: `https://manhwaforge-ai.vercel.app`
2. Open the URL and verify:
   - Landing page loads with cyberpunk aesthetic
   - Sign in buttons work
   - Dashboard is accessible after login

## Free Tier Limits & Best Practices

### Vercel Free Tier
- **Bandwidth**: 100GB/month (plenty for most apps)
- **Deployments**: Unlimited
- **Functions**: 12 second timeout
- **Cold starts**: ~500ms (acceptable)

### Supabase Free Tier
- **Database**: 500MB storage
- **API calls**: Unlimited
- **Storage**: 1GB
- **Realtime**: Included
- **Auth**: Unlimited users

### Optimization Tips
1. **Database**: Clean up old exports after 30 days
2. **Storage**: Archive old projects to free space
3. **API**: Cache frequently accessed data
4. **Images**: Compress generated panels before storage

## Troubleshooting

### Build Fails on Vercel
```
Error: Cannot find module 'drizzle-orm'
```
**Solution**: Ensure `pnpm install` runs before build
- Check `installCommand` in `vercel.json`

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: Verify DATABASE_URL in Vercel environment variables
- Copy exact connection string from Supabase
- Include password correctly

### Functions Timeout
```
Error: Function execution timeout
```
**Solution**: Vercel functions have 12s timeout on free tier
- Optimize database queries
- Use caching for AI responses
- Consider upgrading to Pro ($20/month) for 60s timeout

## Scaling Beyond Free Tier

When you need to scale:

| Need | Free Solution | Paid Alternative |
|------|---------------|------------------|
| More database storage | Archive old data | Supabase Pro ($25/mo) |
| More API bandwidth | Optimize queries | Vercel Pro ($20/mo) |
| Longer function timeout | Optimize code | Vercel Pro ($20/mo) |
| More storage | Clean up files | Supabase Pro ($25/mo) |

## Monitoring & Logs

### Vercel Logs
- Dashboard → Deployments → View logs
- Real-time function logs
- Error tracking

### Supabase Logs
- Dashboard → Logs → Database logs
- API usage statistics
- Performance metrics

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Repository**: https://github.com/dream32-ship/manhwaforge-ai
- **Project Issues**: Use GitHub Issues for bug reports

## Next Steps

1. ✅ Create Supabase project
2. ✅ Deploy to Vercel
3. ✅ Configure environment variables
4. ✅ Run database migrations
5. ✅ Test live application
6. 📊 Monitor usage and scale as needed

---

**Deployment Status**: Ready for production
**Free Tier Cost**: $0/month
**Estimated Traffic**: 100GB/month bandwidth
**Database Size**: 500MB available
