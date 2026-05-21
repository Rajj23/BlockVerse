# BlockVerse

A real-time collaborative document editor — monorepo containing the Spring Boot backend and Next.js frontend.

## Project Structure

```
blockverse/
├── backend/              # Spring Boot (Java 21) REST + WebSocket API
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/             # Next.js 16 (React 19) web app
│   ├── app/
│   ├── components/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml    # Full-stack orchestration
└── .env.example          # Environment variable reference
```

## Quick Start

### Prerequisites
- Docker & Docker Compose

### Run the full stack

```bash
cp .env.example .env
# Fill in required values in .env (JWT_SECRET, etc.)

docker compose up -d
```

| Service        | URL                        |
|----------------|----------------------------|
| Frontend       | http://localhost:3000       |
| Backend API    | http://localhost:8080       |
| Kafka UI       | http://localhost:8090       |
| Redis Commander| http://localhost:8085       |

### Development (without Docker)

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Java 21, Spring Boot 3, Spring Security |
| Database  | MySQL 8.3                               |
| Cache     | Redis 7.2                               |
| Messaging | Apache Kafka                            |
| Frontend  | Next.js 16, React 19, Tailwind CSS v4   |
| Auth      | JWT                                     |
| Storage   | AWS S3                                  |
