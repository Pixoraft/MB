# Render Deployment Guide for Meta Build

## The Issue You Experienced

Your app was returning 404 errors for all API endpoints because Render was restarting your server frequently, causing the in-memory data to be lost. The mindset page worked because it doesn't require server data.

## Fixed Issues

✅ **API Routes Working**: Added proper sample data initialization in production
✅ **Static File Serving**: Configured to preserve API routes in production
✅ **Render Configuration**: Added render.yaml and Dockerfile for proper deployment

## How to Deploy on Render

### Method 1: Using render.yaml (Recommended)

1. **Push to GitHub**: Make sure your code is in a GitHub repository

2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repo
   - Render will automatically detect the `render.yaml` file

3. **Environment Variables** (Render will prompt you):
   - `NODE_ENV=production` (automatically set)
   - `PORT` (automatically set by Render)

### Method 2: Manual Web Service

1. **Create Web Service**:
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18

3. **Environment Variables**:
   - Set `NODE_ENV` to `production`

## Build Commands Explained

- **Build**: `npm run build` - Compiles TypeScript and builds the frontend
- **Start**: `npm start` - Runs the production server from the built files

## Key Files for Deployment

- `render.yaml` - Render configuration (auto-deployment)
- `Dockerfile` - Container configuration (optional)
- `package.json` - Build and start scripts are properly configured

## Post-Deployment

After deployment:
1. Your app will be available at `https://your-app-name.onrender.com`
2. All API endpoints will work correctly
3. Sample data will be initialized automatically
4. All pages (Dashboard, Tasks, Fitness, Mindset, Routine, Goals) will load properly

## Troubleshooting

If you still see 404 errors:
1. Check Render logs for any startup errors
2. Ensure the build completed successfully
3. Verify the start command is running

## Cost

- Free tier: Your app will sleep after 15 minutes of inactivity
- Paid tier ($7/month): Always active, faster startup times

## Next Steps

1. Push your code to GitHub (if not already)
2. Deploy using Method 1 above
3. Test all pages to ensure they're working
4. Consider upgrading to paid tier for better performance

Your app is now production-ready! 🚀