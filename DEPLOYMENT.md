# ManhwaForge AI - Deployment Guide

## Overview

ManhwaForge AI is a full-stack AI-powered Manhwa/webtoon creation platform built with:
- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express 4 + tRPC 11 + Drizzle ORM
- **Database**: MySQL/TiDB
- **Authentication**: Manus OAuth
- **AI Services**: Groq, Hugging Face, Pollinations.ai (all free tier)
- **Storage**: S3-compatible storage

## Prerequisites

1. **Node.js**: v22.13.0 or higher
2. **pnpm**: v10.4.1 or higher
3. **Database**: MySQL 8.0+ or TiDB
4. **Environment Variables**: See `.env.example`

## Environment Variables

Create a `.env` file in the root directory with the following:

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
VITE_APP_ID=your_manus_oauth_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
JWT_SECRET=your_jwt_secret_key

# Owner Info
OWNER_OPEN_ID=your_open_id
OWNER_NAME=Your Name

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App Configuration
VITE_APP_TITLE=ManhwaForge AI
VITE_APP_LOGO=https://your-logo-url.png
```

## Installation

```bash
# Install dependencies
pnpm install

# Generate database migrations
pnpm drizzle-kit generate

# Apply migrations to database
pnpm drizzle-kit migrate
```

## Development

```bash
# Start development server
pnpm dev

# Run TypeScript type checking
pnpm check

# Format code
pnpm format

# Run tests
pnpm test
```

The development server will start at `http://localhost:3000`

## Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Database Schema

The application uses the following main tables:

- **users**: User accounts and authentication
- **projects**: Manhwa projects
- **stories**: Story outlines and scripts
- **chapters**: Individual chapters within projects
- **characters**: Character profiles and metadata
- **panels**: Comic panels with images and descriptions
- **assets**: Reusable assets (characters, backgrounds, effects)
- **exports**: Exported chapters in various formats

## AI Services Integration

### Story Generation
- **Primary**: Groq API (free tier, no rate limits for reasonable use)
- **Fallback**: Hugging Face Inference API
- **Final Fallback**: Local template-based generation

### Image Generation
- **Service**: Pollinations.ai (completely free, no authentication required)
- **Format**: PNG images, 576x1024px (vertical webtoon format)
- **Storage**: S3-compatible storage with presigned URLs

## Storage Configuration

All generated images and exported files are stored in S3-compatible storage:

1. **Character Reference Images**: Stored with key pattern `characters/{projectId}/{characterId}/{timestamp}.png`
2. **Comic Panels**: Stored with key pattern `panels/{projectId}/{chapterId}/{panelId}.png`
3. **Exported Chapters**: Stored with key pattern `exports/{projectId}/{chapterId}/{format}/{timestamp}`

### S3 Configuration

Update `server/storage.ts` with your S3 credentials:

```typescript
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

## Deployment Platforms

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Cloudflare Pages

```bash
# Install Wrangler
npm install -g wrangler

# Deploy
wrangler pages deploy dist
```

### Docker

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

## Performance Optimization

- **Code Splitting**: Implemented via Vite
- **Image Optimization**: Automatic via S3 presigned URLs
- **Database Indexing**: Configured on userId, projectId, chapterId
- **Caching**: Browser cache for static assets, Redis for session data (optional)

## Security Considerations

1. **Authentication**: All protected routes require Manus OAuth
2. **Authorization**: User ownership verified on all data operations
3. **Input Validation**: Zod schemas on all tRPC procedures
4. **CORS**: Configured for production domains
5. **Rate Limiting**: Implement via middleware for production
6. **Environment Variables**: Never commit `.env` files

## Monitoring & Logging

- **Application Logs**: Check `.manus-logs/devserver.log`
- **Browser Console**: Check `.manus-logs/browserConsole.log`
- **Network Requests**: Check `.manus-logs/networkRequests.log`
- **Session Replay**: Check `.manus-logs/sessionReplay.log`

## Troubleshooting

### Database Connection Issues
```bash
# Verify DATABASE_URL format
mysql://user:password@localhost:3306/manhwaforge

# Test connection
mysql -u user -p -h localhost -D manhwaforge
```

### OAuth Issues
- Verify VITE_APP_ID matches Manus OAuth configuration
- Check OAUTH_SERVER_URL is accessible
- Ensure redirect URLs are registered in Manus OAuth

### Image Generation Failures
- Verify Pollinations.ai API is accessible
- Check prompt length (max 1000 characters recommended)
- Verify S3 storage is configured correctly

### Storage Issues
- Verify AWS credentials are correct
- Check S3 bucket permissions
- Ensure bucket CORS is configured for presigned URLs

## Support

For issues or questions:
1. Check `.manus-logs/` for detailed error messages
2. Review the TypeScript types for API contracts
3. Consult the tRPC documentation: https://trpc.io
4. Check Manus documentation: https://manus.im/docs

## License

MIT
