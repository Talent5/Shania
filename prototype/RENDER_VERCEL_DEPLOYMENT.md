# Deployment Guide: Render (Backend) + Vercel (Frontend)

This guide walks you through deploying your ADHF Readmission Prediction System with the backend on Render and frontend on Vercel.

## Prerequisites

- GitHub account
- Git installed locally
- Render account (free): https://render.com
- Vercel account (free): https://vercel.com

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd "c:\Users\Takunda Mundwa\Desktop\School Projects\Shania\prototype"
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

### 1.2 Push to GitHub

1. Create a new repository on GitHub (https://github.com/new)
2. Name it: `adhf-readmission-prediction`
3. Make it **Public** (for free tier) or Private (if you have paid plan)
4. Don't initialize with README (we already have one)

```bash
git remote add origin https://github.com/YOUR_USERNAME/adhf-readmission-prediction.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Render 🚀

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended for easy deployment)

### 2.2 Deploy Backend

1. **Click "New +"** → **"Web Service"**

2. **Connect Repository**
   - Click "Connect GitHub"
   - Select your repository: `adhf-readmission-prediction`
   - Click "Connect"

3. **Configure Service**
   - **Name**: `adhf-backend` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 app:app`

4. **Select Plan**
   - Choose **"Free"** plan (for educational use)
   - Note: Free tier sleeps after 15 min of inactivity

5. **Environment Variables** - Click "Advanced" and add:
   ```
   FLASK_ENV = production
   FLASK_DEBUG = False
   SECRET_KEY = [Click "Generate" to auto-generate]
   PYTHON_VERSION = 3.9.0
   ```

6. **Click "Create Web Service"**

7. **Wait for Deployment** (5-10 minutes)
   - Watch the logs for any errors
   - Once deployed, you'll see: ✅ "Live"

8. **Copy Your Backend URL**
   - It will be something like: `https://adhf-backend-xxxx.onrender.com`
   - **Save this URL** - you'll need it for frontend deployment

9. **Test Your Backend**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "model_loaded": true
   }
   ```

## Step 3: Deploy Frontend to Vercel 🚀

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)

### 3.2 Deploy Frontend

1. **Go to Dashboard** → Click **"Add New..."** → **"Project"**

2. **Import Repository**
   - Click "Import" next to your `adhf-readmission-prediction` repo
   - If not listed, click "Adjust GitHub App Permissions"

3. **Configure Project**
   - **Framework Preset**: Detected automatically as "Create React App"
   - **Root Directory**: Click "Edit" → Select `frontend` → Click "Continue"
   - **Build Settings** (auto-detected):
     - Build Command: `npm run build`
     - Output Directory: `build`
     - Install Command: `npm install`

4. **Environment Variables** - Click "Environment Variables"
   
   Add this variable:
   ```
   Name: REACT_APP_API_URL
   Value: https://adhf-backend-xxxx.onrender.com
   ```
   
   **Important**: Replace with YOUR actual Render backend URL from Step 2.8
   
   Click "Add"

5. **Click "Deploy"**

6. **Wait for Deployment** (2-3 minutes)
   - Watch the build logs
   - Once deployed, you'll see: 🎉 "Congratulations!"

7. **Get Your Frontend URL**
   - It will be something like: `https://adhf-readmission-prediction.vercel.app`
   - This is your production URL!

## Step 4: Update Backend CORS

Now that you have your Vercel frontend URL, update the backend to allow it:

### 4.1 Update Render Environment Variables

1. Go to your Render dashboard
2. Click on your `adhf-backend` service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add:
   ```
   Key: FRONTEND_URL
   Value: https://your-app.vercel.app,http://localhost:3000
   ```
   **Replace** `your-app.vercel.app` with your actual Vercel URL
   
   Note: We include localhost for local development too

6. Click "Save Changes"
7. Service will automatically redeploy (takes ~2 minutes)

## Step 5: Test Your Deployed Application 🎉

### 5.1 Access Your App
Open your Vercel URL in a browser: `https://your-app.vercel.app`

### 5.2 Test Full Flow
1. **Sign Up** - Create a new account
2. **Login** - Use your credentials
3. **Make Prediction** - Fill in patient data and submit
4. **View History** - Check if predictions are saved

### 5.3 Common Issues & Fixes

**❌ "Network Error" or "CORS Error"**
- Backend URL not set correctly in Vercel
- Frontend URL not added to Render CORS settings
- Solution: Double-check environment variables in both Render and Vercel

**❌ "502 Bad Gateway"**
- Backend is starting up (cold start on free tier)
- Solution: Wait 30 seconds and refresh

**❌ "Session not persisting"**
- Cookie settings issue
- Solution: Make sure both sites use HTTPS

**❌ "Model not found"**
- Model file not in repository
- Solution: Check that `adhf_rf_model.pkl` is committed to Git

## Step 6: Custom Domain (Optional)

### Frontend Domain (Vercel)
1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Backend Domain (Render)
1. Go to your service in Render
2. Click "Settings" → "Custom Domain"
3. Add your domain
4. Update DNS records

## Monitoring & Maintenance

### View Logs

**Render (Backend):**
- Dashboard → Your service → "Logs" tab
- Real-time log streaming

**Vercel (Frontend):**
- Dashboard → Your project → "Deployments" → Click deployment → "View Function Logs"

### Update Your App

Whenever you push to GitHub, both platforms auto-deploy:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main
```

- Render: Auto-deploys backend in ~5 min
- Vercel: Auto-deploys frontend in ~2 min

### Monitor Performance

**Render:**
- Dashboard shows CPU, Memory, and Response times
- Free tier: 512 MB RAM, shared CPU

**Vercel:**
- Analytics available in dashboard
- Free tier: 100 GB bandwidth/month

## Cost Breakdown

### Free Tier Limits

**Render Free:**
- 750 hours/month (1 web service)
- Sleeps after 15 min inactivity
- 512 MB RAM
- Free SSL certificate
- ✅ Perfect for educational projects!

**Vercel Free:**
- Unlimited personal projects
- 100 GB bandwidth/month
- 100 GB-hours compute
- Free SSL certificate
- ✅ More than enough for research projects!

### Upgrade Options (if needed)

**Render:**
- Starter: $7/month (always-on, 512 MB RAM)
- Standard: $25/month (2 GB RAM)

**Vercel:**
- Pro: $20/month (team features, more bandwidth)

## Troubleshooting Commands

### Check Backend Status
```bash
curl https://your-backend.onrender.com/health
```

### Check Environment Variables
In Render: Settings → Environment
In Vercel: Settings → Environment Variables

### Force Redeploy
**Render**: Click "Manual Deploy" → "Deploy latest commit"
**Vercel**: Deployments → Three dots → "Redeploy"

## Security Checklist

- [x] SECRET_KEY is auto-generated (not hardcoded)
- [x] CORS configured for specific origins only
- [x] HTTPS enabled automatically
- [x] No sensitive data in Git repository
- [x] Environment variables used for configuration
- [x] Session cookies secured

## Support & Resources

**Render:**
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

**Vercel:**
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Status: https://vercel-status.com

## Next Steps

1. ✅ Share your Vercel URL with your professor/peers
2. ✅ Add the URL to your project README
3. ✅ Document your deployment in your research paper
4. ✅ Set up monitoring/alerts for production issues
5. ✅ Create a video demo of your deployed app

---

**🎉 Congratulations!** Your ADHF Readmission Prediction System is now live and accessible worldwide!

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com`
- Health Check: `https://your-backend.onrender.com/health`

---

**Questions?** Open an issue on GitHub or reach out to the development team.
