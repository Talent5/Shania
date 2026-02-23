# Quick Deployment Reference

## 📋 Render + Vercel Deployment Checklist

### Backend (Render)
- [ ] Create account at https://render.com
- [ ] Connect GitHub repository
- [ ] Set Root Directory: `backend`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 app:app`
- [ ] Add environment variables:
  - `FLASK_ENV=production`
  - `FLASK_DEBUG=False`
  - `SECRET_KEY` (auto-generate)
- [ ] Deploy and copy backend URL

### Frontend (Vercel)
- [ ] Create account at https://vercel.com
- [ ] Connect GitHub repository
- [ ] Set Root Directory: `frontend`
- [ ] Add environment variable:
  - `REACT_APP_API_URL=https://your-backend.onrender.com`
- [ ] Deploy and copy frontend URL

### Update CORS
- [ ] In Render, add environment variable:
  - `FRONTEND_URL=https://your-app.vercel.app`
- [ ] Save and wait for redeploy

### Test
- [ ] Visit frontend URL
- [ ] Sign up new account
- [ ] Login
- [ ] Make a prediction
- [ ] Verify it works end-to-end

## 🔗 Your Deployment URLs

**Frontend:** `https://__________________.vercel.app`

**Backend:** `https://__________________.onrender.com`

**Health Check:** `https://__________________.onrender.com/health`

## 📝 Environment Variables Summary

### Render (Backend)
```
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=[auto-generated]
FRONTEND_URL=https://your-app.vercel.app
PYTHON_VERSION=3.9.0
```

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

## 🚀 Deploy Commands

### Push Updates
```bash
git add .
git commit -m "Your update message"
git push origin main
```
Both platforms auto-deploy on push!

## ⚡ Quick Links

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Full Guide:** See RENDER_VERCEL_DEPLOYMENT.md

---

Generated: February 23, 2026
