# SBOM Manager - Software Bill of Materials Management System

A cloud-hosted web application for generating, managing, and analyzing Software Bills of Materials (SBOMs) across multiple platforms.

## Features

- 🔐 User authentication with email verification
- 📦 SBOM generation for multiple platforms (iOS, Android, macOS, Windows, Linux)
- 🔍 Search and filter applications
- 📊 Statistics and analytics dashboard
- 🔄 Compare SBOMs side-by-side
- 📤 Export in SPDX and CycloneDX formats

## Tech Stack

### Backend
- FastAPI (Python 3.11+)
- Supabase (PostgreSQL + Auth)
- Syft for SBOM generation
- JWT authentication

### Frontend (Coming Soon)
- React 18 + TypeScript
- Tailwind CSS
- Vite

## Setup Instructions

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ (for frontend)
- Supabase account

### Backend Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd project/backend

Create virtual environment

bashpython -m venv venv
source venv/Scripts/activate  # Windows Git Bash
# OR
source venv/bin/activate       # Linux/Mac

Install dependencies

bashpip install -r requirements.txt

Configure environment variables

bashcp .env.example .env
# Edit .env with your Supabase credentials

Run the server

bashuvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Access API documentation


Swagger UI: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc

Environment Variables
See .env.example for required variables.
Critical: Never commit .env files to version control!
API Endpoints
Authentication

POST /api/v1/auth/register - Register new user
POST /api/v1/auth/login - Login
POST /api/v1/auth/refresh - Refresh token
GET /api/v1/auth/me - Get current user
POST /api/v1/auth/forgot-password - Password reset

Coming Soon

SBOM upload and generation
Search and filtering
Comparison features
Statistics dashboard

Project Structure
project/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core utilities
│   │   ├── models/       # Pydantic models
│   │   ├── services/     # Business logic
│   │   └── main.py       # FastAPI app
│   ├── venv/             # Virtual environment
│   ├── .env              # Environment variables (not in git)
│   └── requirements.txt  # Python dependencies
└── frontend/             # Coming soon
Development Status

✅ Backend setup with FastAPI
✅ Database schema (Supabase PostgreSQL)
✅ Authentication system (register, login, JWT)
✅ API documentation
🚧 File upload functionality (in progress)
🚧 SBOM generation (in progress)
🚧 Frontend (in progress)

License
MIT License
Author
Satwik Alla - UMBC SENG 701 Capstone Project
Acknowledgments

Prof. Mohammad Samarah & Prof. Melissa Sahl (Advisors)
Supabase for backend infrastructure
Anchore Syft for SBOM generation
EOF