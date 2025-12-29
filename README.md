# SBOM Manager - Software Supply Chain Security Platform

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![React](https://img.shields.io/badge/React-19.1+-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

A cloud-hosted full-stack web application for generating, managing, and analyzing Software Bills of Materials (SBOMs) across multiple platforms with enterprise-grade security and compliance features.

🔗 **Live Demo:** [https://sbommanager.vercel.app](https://sbommanager.vercel.app/)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Functionality
- 🔍 **Multi-Platform SBOM Generation** - Support for iOS, Android, macOS, Windows, and Linux applications
- 🤖 **Automated Analysis** - Powered by Anchore Syft for accurate component detection
- 📊 **Vulnerability Scanning** - Real-time security analysis and dependency tracking
- 📤 **Industry Standards** - Export to SPDX and CycloneDX formats
- 🔐 **Secure Authentication** - JWT-based auth with email verification via Supabase

### Advanced Features
- 📈 **Interactive Dashboards** - Data visualization with Recharts
- 🔄 **Version Comparison** - Compare SBOMs across application versions
- 🔎 **Advanced Search & Filtering** - Powerful query capabilities with pagination
- ☁️ **Cloud Storage** - Secure file management with 50MB upload limit
- 📧 **Email Notifications** - Automated alerts via Resend integration

---

## 🛠 Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL via Supabase
- **Authentication:** JWT with Supabase Auth
- **SBOM Engine:** Anchore Syft
- **Storage:** Supabase Storage
- **Email:** Resend API

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation

### DevOps & Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database:** Supabase (PostgreSQL)
- **Version Control:** Git/GitHub
- **CI/CD:** GitHub Actions (optional)

---

## 🏗 Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│        React + TypeScript + TailwindCSS (Vercel)            │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS/REST API
┌───────────────────────▼─────────────────────────────────────┐
│                     API Gateway Layer                       │
│                FastAPI + JWT Auth (Render)                  │
└─────┬──────────────────────┬────────────────────────────────┘
      │                      │
      ▼                      ▼
┌─────────────┐    ┌──────────────────┐
│  Supabase   │    │  Anchore Syft    │
│ PostgreSQL  │    │  SBOM Generator  │
│   Storage   │    │                  │
│    Auth     │    │                  │
└─────────────┘    └──────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ and npm
- Supabase account ([Sign up](https://supabase.com))
- Anchore Syft ([Installation guide](https://github.com/anchore/syft#installation))

### Backend Setup

1. **Clone the repository**
```bash
   git clone https://github.com/Satwik-Dev/SBOM_manager_final.git
   cd sbom-manager/backend
```

2. **Create virtual environment**
```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
   pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
   cp .env.example .env
   # Edit .env with your credentials
```

   Required environment variables:
```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   DATABASE_URL=postgresql://...
   SECRET_KEY=your_secret_key
```

5. **Run the development server**
```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

   API will be available at: `http://localhost:8000`
   
   Swagger docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
   cd ../frontend
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure environment**
```bash
   cp .env.example .env
   # Edit .env with your backend URL
```

   Required environment variables:
```env
   VITE_API_URL=http://localhost:8000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. **Run development server**
```bash
   npm run dev
```

   Frontend will be available at: `http://localhost:5173`

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/forgot-password` | Request password reset |

### Application Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/upload/` | Upload application file |
| GET | `/api/v1/applications/` | List applications (paginated) |
| GET | `/api/v1/applications/{id}` | Get application details |
| GET | `/api/v1/applications/{id}/components` | Get SBOM components |
| GET | `/api/v1/applications/{id}/export` | Export SBOM (SPDX/CycloneDX) |
| DELETE | `/api/v1/applications/{id}` | Delete application |

### Vulnerability & Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vulnerabilities/{app_id}` | Get vulnerability scan results |
| GET | `/api/v1/stats` | Get platform statistics |
| POST | `/api/v1/comparison/` | Compare SBOMs |

**Full API documentation available at:** `/docs` (Swagger UI) or `/redoc` (ReDoc)

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Configure environment variables
4. Deploy automatically on push to main

### Backend (Render)

1. Create new Web Service in Render
2. Connect GitHub repository
3. Configure build command: `pip install -r requirements.txt`
4. Configure start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

### Database (Supabase)

- Already hosted and managed by Supabase
- Configure connection string in environment variables
- Run migrations if needed

## 🧪 Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Satwik Alla**
- LinkedIn: [linkedin.com/in/satwik-alla](https://linkedin.com/in/satwik-alla)
- Email: allasatwik93@gmail.com

---

## 🙏 Acknowledgments

- [Anchore Syft](https://github.com/anchore/syft) - SBOM generation engine
- [Supabase](https://supabase.com) - Backend infrastructure
- [FastAPI](https://fastapi.tiangolo.com) - API framework
- [React](https://react.dev) - Frontend framework

---

## 📊 Project Stats

- **Lines of Code:** ~15,000+
- **API Endpoints:** 20+
- **Supported Platforms:** 5 (iOS, Android, macOS, Windows, Linux)
- **Export Formats:** 2 (SPDX, CycloneDX)
- **Development Time:** 4 months (Sep 2024 - Dec 2024)

---

**⭐ If you found this project useful, please consider giving it a star!**
