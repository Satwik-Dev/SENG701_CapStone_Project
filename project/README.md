# SBOM Manager

A cloud-hosted web application for generating, managing, and analyzing Software Bills of Materials (SBOMs) across multiple platforms.

## Overview

SBOM Manager is a comprehensive solution for software supply chain security and compliance. It enables organizations to automatically generate, store, and analyze Software Bills of Materials for applications across iOS, Android, macOS, Windows, and Linux platforms.

## Key Features

- **Multi-Platform Support**: Generate SBOMs for iOS, Android, macOS, Windows, and Linux applications
- **Secure Authentication**: User registration and login with email verification
- **Automated SBOM Generation**: Powered by Anchore Syft for accurate component detection
- **Component Analysis**: Detailed analysis of software components, dependencies, and licenses
- **Export Capabilities**: Support for SPDX and CycloneDX industry-standard formats
- **Search & Filter**: Advanced filtering and search capabilities for applications and components
- **Cloud Storage**: Secure file storage and management
- **RESTful API**: Complete API access for integration with existing workflows

## Technology Stack

**Backend**
- FastAPI (Python 3.11+)
- Supabase (PostgreSQL + Authentication)
- Anchore Syft for SBOM generation
- JWT-based authentication
- Cloud storage integration

**Frontend** *(Coming Soon)*
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for build tooling

## Quick Start

### Prerequisites

- Python 3.11 or higher
- Supabase account
- Anchore Syft installed ([Installation Guide](https://github.com/anchore/syft#installation))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sbom-manager/backend
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start the server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access the API**
   - API Documentation: http://localhost:8000/docs
   - Alternative Docs: http://localhost:8000/redoc

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user account |
| POST | `/api/v1/auth/login` | User authentication |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user profile |
| POST | `/api/v1/auth/forgot-password` | Request password reset |

### Application Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/upload/` | Upload application for SBOM analysis |
| GET | `/api/v1/applications/` | List user applications with pagination |
| GET | `/api/v1/applications/{id}` | Get application details and components |
| GET | `/api/v1/applications/{id}/components` | Get application components |
| GET | `/api/v1/applications/{id}/export` | Export SBOM in SPDX/CycloneDX format |
| DELETE | `/api/v1/applications/{id}` | Delete application and associated data |

### Upload & Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/upload/status/{id}` | Check SBOM generation status |

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://postgres:password@host:port/database

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Storage
STORAGE_BUCKET=uploads
MAX_FILE_SIZE=52428800  # 50MB
```

### Supported File Types

The application currently supports analysis of:
- Mobile applications (APK, IPA)
- Desktop applications (EXE, APP, Linux binaries)
- Container images
- Source code archives

## Usage Examples

### Upload an Application

```bash
curl -X POST "http://localhost:8000/api/v1/upload/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/your/application.apk"
```

### Get SBOM Data

```bash
curl -X GET "http://localhost:8000/api/v1/applications/{app_id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Export SBOM

```bash
curl -X GET "http://localhost:8000/api/v1/applications/{app_id}/export?format=cyclonedx" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Security & Compliance

- **Authentication**: Secure JWT-based authentication with refresh tokens
- **Authorization**: User-based access control for all resources
- **Data Protection**: Encrypted storage and secure file handling
- **Standards Compliance**: Support for SPDX and CycloneDX SBOM formats
- **Audit Trail**: Complete logging of all SBOM generation activities

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [API documentation](http://localhost:8000/docs) for detailed endpoint information
- Review the [troubleshooting guide](docs/troubleshooting.md)

## Acknowledgments

- [Anchore Syft](https://github.com/anchore/syft) for SBOM generation capabilities
- [Supabase](https://supabase.com) for backend infrastructure and authentication
- [FastAPI](https://fastapi.tiangolo.com) for the robust API framework