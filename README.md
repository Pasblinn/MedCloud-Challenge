# Patient Management System - MedCloud Challenge

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![License](https://img.shields.io/badge/License-MIT-green)

Complete patient management system developed for the **Development Challenge Nine** from [MedCloud](https://github.com/medcloudbr/development-challenge-nine).

## 📋 About the Project

This system was developed as a solution for MedCloud's technical challenge, implementing a modern full-stack application for patient record management with complete CRUD functionality, interactive dashboard, and scalable architecture.

### 🎯 Key Features

- **Complete Patient CRUD**: Create, view, edit, and delete patient records
- **Interactive Dashboard**: Real-time statistics and demographic analysis
- **Advanced Search & Filters**: Search by name, email, age, and age groups
- **Smart Pagination**: Efficient navigation through records
- **Robust Validation**: Validation on both frontend and backend
- **Data Export**: Export functionality in JSON and CSV formats
- **Responsive Design**: Works perfectly on desktop and mobile
- **Smart Caching**: Caching system for performance optimization
- **Real Persistence**: Data stored in PostgreSQL with Redis backup

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React + MUI   │◄──►│  Node.js + Express │◄──►│  PostgreSQL    │
│   Context API   │    │  REST API       │    │   + Redis       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🛠️ Tech Stack

#### Frontend
- **React 18** - Main framework
- **Material-UI (MUI)** - Component library
- **React Router** - SPA routing
- **React Query** - State management and caching
- **Axios** - HTTP client
- **React Toastify** - Notifications

#### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **bcryptjs** - Password hashing
- **JWT** - Authentication
- **Joi** - Data validation
- **Winston** - Logging

#### DevOps
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy (production)
- **GitHub Actions** - CI/CD (configured)

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Pasblinn/MedCloud-Challenge.git
cd MedCloud-Challenge
```

### 2. Run with Docker

```bash
# Start all services (backend, frontend, PostgreSQL, Redis)
docker-compose up -d

# Wait a few seconds for all services to start
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api/docs

### 4. Sample Data

The system comes with pre-loaded sample data for demonstration purposes.

## 📁 Project Structure

```
medcloud/
├── frontend/                 # React Application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── contexts/         # Context API (global state)
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Application pages
│   │   ├── services/         # Services and API calls
│   │   ├── styles/           # Global styles
│   │   └── utils/            # Utilities and helpers
│   ├── Dockerfile
│   └── package.json
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # Controllers
│   │   ├── middleware/       # Middlewares
│   │   ├── models/           # Data models
│   │   ├── repositories/     # Data layer
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utilities
│   ├── Dockerfile
│   └── package.json
├── database/                 # Database scripts
│   └── init.sql
├── docker-compose.yml        # Service orchestration
└── README.md
```

## 🔧 Local Development

### Frontend

```bash
cd frontend
npm install
npm start                     # Development: http://localhost:3000
npm run build                 # Production build
npm test                      # Run tests
```

### Backend

```bash
cd backend
npm install
npm run dev                   # Development with nodemon
npm start                     # Production
npm test                      # Run tests
```

### Environment Variables

#### Backend (.env)
```bash
# Copy the example file and edit as needed
cp backend/.env.example backend/.env
```

```env
NODE_ENV=development
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=patient_management
DB_USER=postgres
DB_PASSWORD=postgres123
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
```

## 📊 API Endpoints

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | List all patients |
| `GET` | `/api/patients/:id` | Get patient by ID |
| `POST` | `/api/patients` | Create new patient |
| `PUT` | `/api/patients/:id` | Update patient |
| `DELETE` | `/api/patients/:id` | Delete patient |
| `GET` | `/api/patients/search` | Search patients |
| `GET` | `/api/patients/stats` | Patient statistics |
| `GET` | `/api/patients/export` | Export data |

### Example Payload

```json
{
  "name": "John Doe",
  "email": "john.doe@email.com",
  "birthDate": "1985-03-15",
  "address": "123 Main Street, Downtown, New York - NY, 10001"
}
```

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test                      # Jest + React Testing Library
npm run test:coverage        # Test coverage
```

### Backend
```bash
cd backend
npm test                      # Jest + Supertest
npm run test:integration     # Integration tests
```

## 🐳 Docker

### Development
```bash
docker-compose up -d          # All services
docker-compose logs -f        # View logs in real-time
docker-compose down           # Stop all services
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Monitoring and Performance

- **Structured logging** with Winston
- **Performance metrics** in backend
- **Smart caching** with Redis
- **Query optimization** in PostgreSQL
- **Lazy loading** in frontend
- **Gzip compression** enabled

## 🔒 Security

- **Robust validation** with Joi
- **Password hashing** with bcryptjs
- **JWT** for authentication
- **Rate limiting** implemented
- **CORS** configured
- **Helmet.js** for security headers
- **SQL injection** protection

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build images
docker-compose build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Manual
1. Configure PostgreSQL and Redis
2. Set environment variables
3. Run `npm run build` in frontend
4. Run `npm start` in backend
5. Configure reverse proxy (Nginx)

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Roadmap

- [ ] Complete authentication with roles
- [ ] Real-time notifications
- [ ] Advanced dashboard
- [ ] GraphQL API
- [ ] E2E tests with Cypress
- [ ] PWA (Progressive Web App)
- [ ] Internationalization (i18n)
- [ ] Data auditing

## 🐛 Known Issues

- Browser cache may cause stale data (solution: hard refresh)
- ZIP code validation not implemented (accepts any format)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Pablo Tadini**
- Email: pablosotomaior@live.com
- GitHub: [@Pasblinn](https://github.com/Pasblinn)
- Project: [MedCloud Challenge](https://github.com/Pasblinn/MedCloud-Challenge)

Developed as a solution for the [MedCloud Development Challenge Nine](https://github.com/medcloudbr/development-challenge-nine).

---

## 🎯 Challenge Requirements ✅

This project meets all challenge requirements:

- ✅ **Complete CRUD** for patients
- ✅ **Robust data validation**
- ✅ **Responsive and modern interface**
- ✅ **PostgreSQL database persistence**
- ✅ **Documented RESTful API**
- ✅ **Docker containerization**
- ✅ **Automated testing**
- ✅ **Complete documentation**
- ✅ **Scalable architecture**
- ✅ **Development best practices**

---

**Developed with ❤️ by Pablo Tadini for the MedCloud Challenge**