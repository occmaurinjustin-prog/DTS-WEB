# Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository with your code

## Deployment Steps

### 1. Push your code to GitHub
Make sure your changes are committed and pushed:
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 2. Create a new project on Railway
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 3. Configure the Laravel Service
Railway will automatically detect your PHP/Laravel application. Configure it:

**Build Command:**
```bash
composer install --no-dev --optimize-autoloader && npm install && npm run build
```

**Start Command:**
```bash
php artisan serve --host=0.0.0.0 --port=$PORT
```

### 4. Add Database Service
1. In your Railway project, click "New Service"
2. Select "Database"
3. Choose either PostgreSQL (recommended) or MySQL
4. Railway will provide connection details

### 5. Configure Environment Variables
Add these environment variables in Railway:

**Required Variables:**
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY` (Generate this locally: `php artisan key:generate --show`)
- `APP_URL=https://your-app.railway.app`

**Database Variables (PostgreSQL):**
- `DB_CONNECTION=pgsql`
- `DB_HOST=${{Postgres.HOSTNAME}}`
- `DB_PORT=${{Postgres.PORT}}`
- `DB_DATABASE=${{Postgres.DATABASE}}`
- `DB_USERNAME=${{Postgres.USERNAME}}`
- `DB_PASSWORD=${{Postgres.PASSWORD}}`

**Database Variables (MySQL):**
- `DB_CONNECTION=mysql`
- `DB_HOST=${{Mysql.HOSTNAME}}`
- `DB_PORT=${{Mysql.PORT}}`
- `DB_DATABASE=${{Mysql.DATABASE}}`
- `DB_USERNAME=${{Mysql.USERNAME}}`
- `DB_PASSWORD=${{Mysql.PASSWORD}}`

**Other Variables:**
- `VITE_MAPBOX_TOKEN=pk.eyJ1IjoibWF1cmluMTIzNDUiLCJhIjoiY21vNWR0dmhlMWt0ZjJxcXc0MXJ0NzhkMiJ9.KcpKsQHNbDPr5ku9OIK5WA`
- `SESSION_DRIVER=database`
- `QUEUE_CONNECTION=database`
- `CACHE_STORE=database`

### 6. Run Database Migrations
After deployment, you need to run migrations. You can do this via:
- Railway Console (web terminal)
- Or add a deploy hook to run migrations automatically

**To add a deploy hook:**
1. Go to your Laravel service settings
2. Add a "Deploy Hook" with:
```bash
php artisan migrate --force
```

### 7. Configure Storage (Optional)
If you need file storage, add a Railway Volume service:
1. Click "New Service"
2. Select "Volume"
3. Mount it to `/storage/app/public`
4. Run: `php artisan storage:link`

### 8. Monitor Deployment
- Watch the deployment logs in Railway
- Check the health status
- Test your application at the provided Railway URL

## Troubleshooting

### Build Fails
- Check that all dependencies are in composer.json and package.json
- Ensure PHP version is compatible (requires PHP 8.2+)
- Check build logs for specific errors

### Database Connection Issues
- Verify database service is running
- Check environment variables match Railway's provided values
- Ensure database migrations have run

### Asset Issues
- Make sure `npm run build` completes successfully
- Check that VITE_APP_NAME is set in environment variables
- Verify assets are being served from public/build

### Queue Workers (Optional)
If you need queue workers:
1. Create a new service in Railway
2. Use the same codebase
3. Set start command to: `php artisan queue:work --tries=3 --timeout=90`

## Useful Commands

**Generate APP_KEY locally:**
```bash
php artisan key:generate --show
```

**Clear cache:**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

**Run migrations:**
```bash
php artisan migrate --force
```

**Storage link:**
```bash
php artisan storage:link
```

## Notes
- Railway automatically provides SSL/HTTPS
- The `$PORT` environment variable is set by Railway
- Railway uses ephemeral storage, so use Volumes for persistent data
- Monitor your usage in Railway dashboard to avoid unexpected charges
