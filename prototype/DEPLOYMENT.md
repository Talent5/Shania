# Deployment Guide

## Pre-Deployment Checklist

✅ Development artifacts removed (cleaned for production)
✅ Environment variables configured
✅ Dependencies documented
✅ Database schema ready
✅ Model file included

## Production Deployment

### Option 1: Traditional Server Deployment

#### Backend Deployment

1. **Server Requirements**
   - Python 3.8+
   - 2GB RAM minimum
   - Linux/Windows Server

2. **Setup Backend**
   ```bash
   cd prototype/backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Configure environment
   cp .env.example .env
   # Edit .env with production values
   
   # Run with production server (Gunicorn on Linux)
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **On Windows Server**
   ```powershell
   cd prototype\backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   
   # Configure .env
   copy .env.example .env
   # Edit .env
   
   # Run with waitress
   pip install waitress
   waitress-serve --host=0.0.0.0 --port=5000 app:app
   ```

#### Frontend Deployment

1. **Build for Production**
   ```bash
   cd prototype/frontend
   
   # Install dependencies
   npm install
   
   # Build production bundle
   npm run build
   ```

2. **Deploy Static Files**
   - The `build/` folder contains optimized static files
   - Serve with Nginx, Apache, or any static file server
   - Update API endpoint in production build if needed

3. **Nginx Configuration Example**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /path/to/prototype/frontend/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Option 2: Docker Deployment

1. **Create Backend Dockerfile**
   ```dockerfile
   FROM python:3.9-slim
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   COPY . .
   
   EXPOSE 5000
   
   CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
   ```

2. **Create Frontend Dockerfile**
   ```dockerfile
   FROM node:16-alpine as build
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   
   services:
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - FLASK_ENV=production
         - SECRET_KEY=${SECRET_KEY}
       volumes:
         - ./backend/users.db:/app/users.db
     
     frontend:
       build: ./frontend
       ports:
         - "80:80"
       depends_on:
         - backend
   ```

### Option 3: Cloud Platform Deployment

#### Heroku

**Backend:**
```bash
cd prototype/backend
heroku create your-app-backend
heroku config:set SECRET_KEY=your-secret-key
heroku config:set FLASK_ENV=production
git push heroku main
```

**Frontend:**
```bash
cd prototype/frontend
# Add buildpack for React
heroku create your-app-frontend
heroku buildpacks:set heroku/nodejs
git push heroku main
```

#### AWS (Elastic Beanstalk)

1. Install EB CLI
2. Backend:
   ```bash
   cd prototype/backend
   eb init
   eb create production
   eb deploy
   ```

3. Frontend: Deploy to S3 + CloudFront
   ```bash
   cd prototype/frontend
   npm run build
   aws s3 sync build/ s3://your-bucket-name
   ```

#### Azure

1. Backend: Azure App Service
2. Frontend: Azure Static Web Apps
3. Database: Azure SQL Database (upgrade from SQLite)

## Post-Deployment

### Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] Rate limiting enabled
- [ ] Input validation verified

### Environment Variables

Required production environment variables:
- `SECRET_KEY`: Strong random key for Flask sessions
- `FLASK_ENV`: Set to "production"
- `FLASK_DEBUG`: Set to "False"
- `FRONTEND_URL`: Your frontend domain
- `DATABASE_URL`: Production database connection

### Database

For production, consider upgrading from SQLite to:
- PostgreSQL (recommended)
- MySQL
- MongoDB

### Monitoring

Set up monitoring for:
- Application logs
- Error tracking (Sentry, Rollbar)
- Performance monitoring (New Relic, DataDog)
- Uptime monitoring

### Backups

- Database: Daily automated backups
- Model file: Version control
- User data: Encrypted backups

## Scaling Considerations

- Use load balancer for multiple backend instances
- Implement caching (Redis)
- CDN for frontend static assets
- Database read replicas
- Horizontal scaling with container orchestration (Kubernetes)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update FRONTEND_URL in backend .env
2. **Database Locked**: Upgrade to PostgreSQL for production
3. **Model Not Found**: Ensure adhf_rf_model.pkl is in backend directory
4. **Session Issues**: Verify SECRET_KEY is consistent across deployments

### Support

For issues, check:
- Application logs
- Browser console (frontend)
- Server logs (backend)
- Network tab in DevTools

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Review security patches
- Monitor disk space
- Check error logs
- Backup verification
- Performance optimization

### Updates

To update the application:
1. Test changes in staging environment
2. Backup production database
3. Deploy new version
4. Verify functionality
5. Monitor for errors

## Performance Optimization

- Enable gzip compression
- Minify JavaScript/CSS (done in build)
- Implement caching headers
- Use CDN for static assets
- Database query optimization
- Connection pooling

## Cost Estimates

**Small Scale (100-1000 users/month):**
- Heroku Hobby: $14/month
- DigitalOcean Droplet: $6/month
- AWS Free Tier eligible

**Medium Scale (1000-10000 users/month):**
- Heroku Standard: $50/month
- AWS/Azure: $100-300/month
- DigitalOcean: $40-60/month

**Enterprise Scale:**
- Custom infrastructure
- Kubernetes cluster
- Managed database services
- $500+/month
