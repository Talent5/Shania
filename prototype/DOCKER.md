# Docker Deployment Instructions

## Quick Start with Docker

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose

### 1. Set Environment Variables

Create a `.env` file in the prototype directory:

```bash
SECRET_KEY=your-secure-secret-key-here-change-this
FRONTEND_URL=http://localhost:3000
```

### 2. Build and Run

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Production Deployment

### Using Docker Compose in Production

1. **Update docker-compose.yml** for production:
   - Change ports as needed
   - Add SSL/TLS reverse proxy (nginx-proxy, Traefik)
   - Use production database (PostgreSQL instead of SQLite)

2. **Set secure environment variables**:
   ```bash
   export SECRET_KEY=$(openssl rand -hex 32)
   ```

3. **Use volume mounts for persistence**:
   - Database storage
   - Model files
   - Log files

### Docker Swarm / Kubernetes

For orchestrated deployment:

**Docker Swarm:**
```bash
docker stack deploy -c docker-compose.yml adhf
```

**Kubernetes:**
See deployment manifests in the DEPLOYMENT.md guide.

## Container Registry

Push to container registry for production:

```bash
# Tag images
docker tag adhf-backend:latest your-registry/adhf-backend:v1.0
docker tag adhf-frontend:latest your-registry/adhf-frontend:v1.0

# Push to registry
docker push your-registry/adhf-backend:v1.0
docker push your-registry/adhf-frontend:v1.0
```

## Monitoring

View container status:
```bash
docker-compose ps
docker stats
```

## Troubleshooting

**Backend won't start:**
```bash
docker-compose logs backend
```

**Frontend shows connection error:**
- Check backend is running: `docker-compose ps`
- Verify CORS settings in backend
- Check API endpoint in frontend configuration

**Database issues:**
```bash
# Access backend container
docker-compose exec backend bash

# Check database
ls -la data/
```

## Maintenance

**Backup database:**
```bash
docker-compose exec backend tar -czf /tmp/backup.tar.gz data/
docker cp adhf-backend:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz
```

**Update application:**
```bash
git pull
docker-compose down
docker-compose up -d --build
```

**Clean up:**
```bash
# Remove stopped containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Clean up images
docker system prune -a
```
