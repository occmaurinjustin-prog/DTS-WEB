# DTS Logistics Backend 🚛

A comprehensive Laravel backend for the DTS Logistics delivery management system with Inertia.js and React frontend.

## Features

### 🏢 **Multi-Role System**
- **Admin** - Complete system management, high-end dashboard
- **Office Staff** - Delivery management, maintenance workflow
- **Operational Manager** - Client and driver coordination
- **Driver** - Mobile app integration
- **Client** - Delivery tracking
- **Mechanic** - Maintenance management

### 📦 **Delivery Management**
- Complete delivery lifecycle tracking
- GPS coordinate integration
- Route optimization
- Real-time status updates
- Pickup and delivery scheduling

### 🔧 **Maintenance System**
- Driver maintenance reports
- Parts inventory management
- Mechanic workflow processing
- Cost tracking and reporting

### 📊 **Analytics & Dashboard**
- High-end admin dashboard with neon UI
- Real-time delivery tracking
- Performance metrics
- Interactive charts and graphs

### 📱 **Mobile API**
- RESTful API for React Native driver app
- JWT authentication
- Real-time notifications
- GPS tracking endpoints

## Tech Stack

- **Backend**: Laravel 11
- **Frontend**: Inertia.js + React
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **Real-time**: Laravel Echo + Pusher
- **File Storage**: Local/Cloud
- **Queue**: Redis

## Requirements

- PHP 8.2+
- Composer
- MySQL/MariaDB
- Node.js & NPM
- Redis (optional, for queues)

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/occmaurinjustin-prog/dts-logistics-backend.git
cd dts-logistics-backend
```

### 2. Install Dependencies
```bash
composer install
npm install
npm run build
```

### 3. Environment Setup
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configure Database
Update `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dts_logistics
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Run Migrations & Seeders
```bash
php artisan migrate
php artisan db:seed
```

### 6. Start Development Server
```bash
php artisan serve
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Current user info

### Drivers
- `GET /api/drivers` - List drivers
- `POST /api/drivers/location` - Update GPS location
- `GET /api/drivers/{id}/deliveries` - Driver deliveries

### Deliveries
- `GET /api/deliveries` - List deliveries
- `POST /api/deliveries` - Create delivery
- `PUT /api/deliveries/{id}` - Update delivery
- `POST /api/deliveries/{id}/start` - Start delivery

### Maintenance
- `GET /api/maintenance/reports` - Maintenance reports
- `POST /api/maintenance/reports` - Submit report
- `PUT /api/maintenance/reports/{id}/approve` - Approve report

## Frontend Pages

### Admin Dashboard
- `/admin/dashboard` - High-end analytics dashboard
- `/admin/users` - User management
- `/admin/drivers` - Driver management
- `/admin/trucks` - Fleet management
- `/admin/deliveries` - Delivery oversight

### Office Staff
- `/office/dashboard` - Operations dashboard
- `/office/deliveries` - Delivery management
- `/office/maintenance` - Maintenance workflow
- `/office/inventory` - Parts inventory

### Operational Manager
- `/manager/dashboard` - Coordination dashboard
- `/manager/clients` - Client management
- `/manager/drivers` - Driver assignment

## Security Features

- JWT token authentication
- Role-based access control
- API rate limiting
- Input validation and sanitization
- CSRF protection
- SQL injection prevention

## Development

### Running Tests
```bash
php artisan test
```

### Queue Processing
```bash
php artisan queue:work
```

### Cache Clear
```bash
php artisan optimize:clear
```

## Project Structure

```
├── app/
│   ├── Http/Controllers/          # API and Web controllers
│   ├── Models/                    # Eloquent models
│   ├── Jobs/                      # Queue jobs
│   └── Policies/                  # Authorization policies
├── database/
│   ├── migrations/                # Database migrations
│   └── seeders/                   # Database seeders
├── resources/js/
│   ├── Pages/                     # React pages
│   ├── Components/                # React components
│   └── Layouts/                   # Page layouts
├── routes/
│   ├── web.php                    # Web routes
│   └── api.php                    # API routes
└── storage/
    └── app/public/                # File uploads
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

---

**Built with ❤️ using Laravel, Inertia.js, and React**
