# Deployment Guide

This guide covers deploying the NearSalon application to various cloud platforms.

## Table of Contents

- [Docker Deployment](#docker-deployment)
- [Heroku Deployment](#heroku-deployment)
- [AWS Deployment](#aws-deployment)
- [DigitalOcean Deployment](#digitalocean-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [SSL Configuration](#ssl-configuration)
- [Monitoring](#monitoring)

---

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Steps

1. **Clone repository:**
```bash
git clone <repository-url>
cd nearsalon
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with production values
```

3. **Build and start containers:**
```bash
docker-compose up -d --build
```

4. **Verify deployment:**
```bash
docker-compose ps
docker-compose logs -f
```

5. **Access application:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

### Production Docker Compose

For production, use a separate `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

---

## Heroku Deployment

### Backend Deployment

1. **Install Heroku CLI:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

2. **Create Heroku app:**
```bash
cd backend
heroku create nearsalon-api
```

3. **Add PostgreSQL:**
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_EXPIRES_IN=7d
heroku config:set OTP_MOCK=123456
heroku config:set CORS_ORIGIN=https://nearsalon-app.vercel.app
```

5. **Create Procfile:**
```bash
echo "web: npm start" > Procfile
echo "release: npm run migrate && npm run seed" >> Procfile
```

6. **Deploy:**
```bash
git init
git add .
git commit -m "Initial deployment"
heroku git:remote -a nearsalon-api
git push heroku main
```

7. **Verify:**
```bash
heroku logs --tail
heroku open
```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel --prod
```

3. **Configure environment:**
```bash
vercel env add REACT_APP_API_URL production
# Enter: https://nearsalon-api.herokuapp.com/api
```

---

## AWS Deployment

### Architecture
- **EC2** for backend
- **RDS PostgreSQL** for database
- **S3 + CloudFront** for frontend
- **Elastic Load Balancer** for load balancing
- **Route 53** for DNS

### Backend on EC2

1. **Launch EC2 instance:**
- Instance type: t2.micro (for testing) or t2.small (production)
- AMI: Ubuntu 22.04 LTS
- Security group: Allow 22, 80, 443, 5000

2. **Connect and setup:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone <repository-url>
cd nearsalon/backend
npm install
```

3. **Setup environment:**
```bash
cp .env.example .env
nano .env  # Edit with production values
```

4. **Start with PM2:**
```bash
npm run migrate
npm run seed
pm2 start npm --name "nearsalon-api" -- start
pm2 startup
pm2 save
```

5. **Configure Nginx:**
```bash
sudo apt-get install nginx

sudo nano /etc/nginx/sites-available/nearsalon
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/nearsalon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Database on RDS

1. **Create RDS instance:**
- Engine: PostgreSQL 15
- Instance class: db.t3.micro
- Storage: 20 GB
- Public access: No
- VPC security group: Allow 5432 from EC2 security group

2. **Update backend .env:**
```env
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/nearsalon
```

3. **Run migrations:**
```bash
npm run migrate
npm run seed
```

### Frontend on S3 + CloudFront

1. **Build frontend:**
```bash
cd frontend
REACT_APP_API_URL=https://api.yourdomain.com/api npm run build
```

2. **Create S3 bucket:**
```bash
aws s3 mb s3://nearsalon-frontend
aws s3 website s3://nearsalon-frontend --index-document index.html
```

3. **Upload build:**
```bash
aws s3 sync build/ s3://nearsalon-frontend
```

4. **Create CloudFront distribution:**
- Origin: S3 bucket
- Viewer protocol: Redirect HTTP to HTTPS
- Default root object: index.html

5. **Configure custom error pages:**
- 404: /index.html (for SPA routing)
- 403: /index.html

---

## DigitalOcean Deployment

### Using DigitalOcean App Platform

1. **Create app:**
```bash
doctl apps create --spec app.yaml
```

2. **app.yaml:**
```yaml
name: nearsalon
services:
  - name: api
    github:
      repo: your-username/nearsalon
      branch: main
      deploy_on_push: true
    build_command: cd backend && npm install && npm run build
    run_command: cd backend && npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        value: ${JWT_SECRET}
        type: SECRET
    routes:
      - path: /api

  - name: web
    github:
      repo: your-username/nearsalon
      branch: main
    build_command: cd frontend && npm install && npm run build
    run_command: cd frontend && npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /

databases:
  - name: nearsalon-db
    engine: PG
    version: "15"
    size: db-s-1vcpu-1gb
```

---

## Environment Variables

### Production Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/nearsalon

# Authentication
JWT_SECRET=<generate-strong-random-string-64-chars>
JWT_EXPIRES_IN=7d

# OTP (use real SMS service in production)
OTP_MOCK=  # Leave empty or remove in production
OTP_EXPIRES_IN=10m

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
OTP_RATE_LIMIT_MAX=5

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info

# Payment Gateway (replace with real credentials)
PAYMENT_GATEWAY_URL=https://api.stripe.com
PAYMENT_API_KEY=sk_live_xxxxxxxxxxxxx
PAYMENT_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Generate Secrets

```bash
# JWT Secret
openssl rand -base64 64

# Random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### PostgreSQL Production Setup

1. **Create database:**
```sql
CREATE DATABASE nearsalon;
CREATE USER nearsalon_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE nearsalon TO nearsalon_user;
```

2. **Configure connection pooling:**
```javascript
// backend/src/config/database.js
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
```

3. **Backup strategy:**
```bash
# Backup
pg_dump -U nearsalon_user -h host nearsalon > backup.sql

# Restore
psql -U nearsalon_user -h host nearsalon < backup.sql

# Automated backups (cron)
0 2 * * * pg_dump -U nearsalon_user nearsalon | gzip > /backups/nearsalon_$(date +\%Y\%m\%d).sql.gz
```

---

## SSL Configuration

### Using Let's Encrypt (Certbot)

1. **Install Certbot:**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. **Obtain certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

3. **Auto-renewal:**
```bash
sudo certbot renew --dry-run
```

4. **Nginx configuration update:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Monitoring

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart on file changes
pm2 restart nearsalon-api --watch
```

### Application Monitoring

1. **Install monitoring tools:**
```bash
npm install @sentry/node @sentry/tracing
```

2. **Configure Sentry:**
```javascript
// backend/src/server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Health Monitoring

Create a monitoring script:

```javascript
// monitor.js
const axios = require('axios');

setInterval(async () => {
  try {
    const res = await axios.get('https://api.yourdomain.com/health');
    console.log(`Health check: ${res.data.message}`);
  } catch (error) {
    console.error('Health check failed:', error.message);
    // Send alert (email, Slack, PagerDuty, etc.)
  }
}, 60000); // Check every minute
```

---

## Performance Optimization

### Enable Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### Caching

```javascript
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

// Cache salon data
app.get('/api/salons', async (req, res) => {
  const cacheKey = `salons:${JSON.stringify(req.query)}`;
  const cached = await client.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Fetch from database
  const salons = await getSalons(req.query);
  await client.setEx(cacheKey, 300, JSON.stringify(salons)); // 5 min cache

  res.json(salons);
});
```

### Database Indexing

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_salons_location ON salons(latitude, longitude);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date, booking_time);
```

---

## Troubleshooting

### Common Issues

**Database connection errors:**
```bash
# Check database is running
sudo systemctl status postgresql

# Check connection
psql -U nearsalon_user -h localhost -d nearsalon
```

**Port conflicts:**
```bash
# Find process using port
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

**Memory issues:**
```bash
# Check memory
free -h

# Restart PM2
pm2 restart all
```

---

## Rollback Strategy

1. **Tag releases:**
```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

2. **Rollback:**
```bash
git checkout v1.0.0
pm2 restart all
```

3. **Database rollback:**
```bash
# Restore from backup
psql -U nearsalon_user nearsalon < backup.sql
```

---

## Checklist Before Going Live

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backups automated
- [ ] Error tracking enabled (Sentry)
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated
- [ ] Domain DNS configured
- [ ] CDN setup (optional)
- [ ] Payment gateway configured (production keys)

---

## Support

For deployment issues, contact:
- DevOps team: devops@nearsalon.com
- Documentation: https://docs.nearsalon.com
