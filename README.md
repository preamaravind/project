# ProjectFlow – Project Management System

A modern, full-stack project management application built for teams and individuals who want a clean, fast way to organize projects and tasks.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)

---

##  Features

- **Authentication** — Register, login, logout with JWT tokens
- **Project Management** — Create, view, edit, delete projects with status tracking
- **Task Management** — Full CRUD with priority levels and status updates
- **Dashboard** — Real-time stats, charts, recent activity at a glance
- **Search & Filter** — Find projects/tasks by name, status, priority
- **Pagination** — Server-side pagination for large datasets
- **Responsive** — Works beautifully on desktop, tablet, and mobile
- **Secure** — JWT auth, bcrypt hashing, rate limiting, input validation

---

##  Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6  |
| Backend    | Node.js, Express.js, JWT, bcryptjs              |
| Database   | MySQL 8.0, Sequelize ORM                        |
| Charts     | Recharts                                        |
| Forms      | React Hook Form                                 |
| Docs       | Swagger / OpenAPI 3.0                           |
| DevOps     | Docker, Docker Compose                          |

---

## Project Structure

```
ProjectFlow/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── api/         # Axios API services
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context (Auth, Toast)
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── routes/      # Router config
│   │   └── utils/       # Constants & helpers
│   └── ...
├── server/          # Express backend
│   ├── config/      # Database config
│   ├── controllers/ # Route handlers
│   ├── middleware/   # Auth, validation, rate limiting
│   ├── models/      # Sequelize models
│   ├── routes/      # API routes
│   ├── validators/  # Input validation rules
│   ├── swagger/     # API documentation
│   └── ...
├── docker-compose.yml
└── README.md
```

---

##  Getting Started

### Prerequisites

- **Node.js** 18+
- **MySQL** 8.0+ (or use Docker)
- **npm** or **yarn**

### Option 1: Run with Docker (Easiest)

```bash
# Clone the repo
git clone <your-repo-url>
cd ProjectFlow

# Start everything
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

### Option 2: Run Locally

#### 1. Set up MySQL

Create a database called `projectflow`:

```sql
CREATE DATABASE projectflow;
```

#### 2. Set up the Backend

```bash
cd server

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env
# Edit .env with your MySQL credentials

# Start the server
npm run dev
```

The backend runs on `http://localhost:5000`.

#### 3. Set up the Frontend

```bash
cd client

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env

# Start the dev server
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

##  Environment Variables

### Backend (`server/.env`)

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=projectflow
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

| Method | Endpoint               | Description            | Auth |
|--------|------------------------|------------------------|------|
| POST   | `/api/auth/register`   | Register new user      | ❌   |
| POST   | `/api/auth/login`      | Login                  | ❌   |
| POST   | `/api/auth/logout`     | Logout                 | ✅   |
| GET    | `/api/auth/me`         | Get current user       | ✅   |
| GET    | `/api/projects`        | List projects          | ✅   |
| GET    | `/api/projects/:id`    | Get single project     | ✅   |
| POST   | `/api/projects`        | Create project         | ✅   |
| PUT    | `/api/projects/:id`    | Update project         | ✅   |
| DELETE | `/api/projects/:id`    | Delete project         | ✅   |
| GET    | `/api/tasks`           | List tasks             | ✅   |
| GET    | `/api/tasks/:id`       | Get single task        | ✅   |
| POST   | `/api/tasks`           | Create task            | ✅   |
| PUT    | `/api/tasks/:id`       | Update task            | ✅   |
| DELETE | `/api/tasks/:id`       | Delete task            | ✅   |
| GET    | `/api/dashboard/stats` | Dashboard statistics   | ✅   |

**Query Parameters** for list endpoints:
- `?page=1&limit=10` — Pagination
- `?search=keyword` — Search by name
- `?status=In Progress` — Filter by status
- `?priority=High` — Filter by priority (tasks)
- `?project_id=1` — Filter by project (tasks)

📖 **Full API docs**: Visit `http://localhost:5000/api-docs` for Swagger UI.

---

## 🗄 Database Schema

```
Users ──┐
        ├──< Projects ──┐
                         ├──< Tasks
```

- **User → many Projects** (cascade delete)
- **Project → many Tasks** (cascade delete)

---
