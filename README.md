# 🏢 E-HRMS — Enterprise Human Resource Management System

A full-stack, modern HR Management System built with **Angular 21** (frontend) and **NestJS** (backend), powered by **PostgreSQL** as the database.

---

## 📁 Project Structure

```
e-hrms/
├── src/                    # Angular frontend source
│   ├── app/
│   │   ├── modules/        # Feature modules (auth, employees, payroll, etc.)
│   │   ├── shared/         # Shared components, services, guards
│   │   └── core/           # Core services & interceptors
│   ├── assets/             # Images and static assets
│   └── styles.css          # Global styles
├── backend/                # NestJS backend source
│   ├── src/
│   │   ├── auth/           # Authentication (JWT)
│   │   ├── employees/      # Employee management
│   │   ├── attendance/     # Attendance tracking
│   │   ├── payroll/        # Payroll processing
│   │   ├── leave/          # Leave management
│   │   ├── performance/    # Performance appraisals
│   │   ├── training/       # Training management
│   │   └── users/          # User management
│   └── .env                # Backend environment variables
├── angular.json            # Angular CLI config
├── package.json            # Frontend dependencies
└── proxy.conf.json         # Angular dev proxy to backend
```

---
## 📸 Project Screenshots
### Login page 
<img width="900"  alt="Screenshot 2026-03-12 213515" src="https://github.com/user-attachments/assets/e8bbd77f-b264-4345-bd86-96bc360db980" />

### Admin Login Dashboard
<img width="900"  alt="Screenshot 2026-03-12 213536" src="https://github.com/user-attachments/assets/3f4fc208-fcf4-41b5-b25b-981596ab537a" />

### Employee Login Dashboard
<img width="900"  alt="Screenshot (151)" src="https://github.com/user-attachments/assets/4a35ada7-70b7-4113-9d78-e710c769d1c3" />

### All Others
<img width="900"  alt="Screenshot (142)" src="https://github.com/user-attachments/assets/0778203a-163d-4ca8-a44b-5b1c58e37e9b" />
<img width="900"  alt="Screenshot (143)" src="https://github.com/user-attachments/assets/f825a46a-dcf3-443f-af30-fd11fb4214c6" />
<img width="900"  alt="Screenshot (144)" src="https://github.com/user-attachments/assets/15d82903-126d-473a-8e8d-4ac410691f87" />
<img width="900"  alt="Screenshot (145)" src="https://github.com/user-attachments/assets/036ba84e-b41f-43be-897c-90215f4b3ab0" />
<img width="900"  alt="Screenshot (146)" src="https://github.com/user-attachments/assets/9b86e9f7-5011-45cf-9d24-fa0b089559cd" />
<img width="900"  alt="Screenshot (147)" src="https://github.com/user-attachments/assets/dbfcf45a-7924-49dd-a449-8772c09500ef" />
<img width="900"  alt="Screenshot (148)" src="https://github.com/user-attachments/assets/c8ad81b3-6f8d-4b6e-81f2-08a22a2cbd09" />
<img width="900"  alt="Screenshot (149)" src="https://github.com/user-attachments/assets/11774055-705a-4234-b322-8efaa024dd5f" />
<img width="900"  alt="Screenshot (150)" src="https://github.com/user-attachments/assets/067d3f4e-e004-4262-b0fc-4181e405d924" />

**This is the basics screenshots of project**

## 🚀 Features

| Module | Description |
|---|---|
| **Auth** | JWT-based login & registration |
| **Employee Management** | Employee profiles, departments, roles |
| **Attendance Tracking** | Daily attendance records & analytics |
| **Payroll Management** | Salary structures, payslips, advances |
| **Leave Management** | Leave requests, approvals, balance |
| **Performance** | Appraisals and goal tracking |
| **Training** | Training programs and assignments |
| **Dashboard** | KPIs, insights, and real-time reports |

---

## 🛠️ Tech Stack

### Frontend
- **Angular 21** — Standalone components, signals-based reactivity
- **Angular Material** — UI component library
- **TailwindCSS** — Utility-first styling
- **TypeScript** — Type-safe development
- **RxJS** — Reactive programming

### Backend
- **NestJS 11** — Modular Node.js framework
- **TypeORM** — ORM for PostgreSQL
- **PostgreSQL** — Relational database
- **Passport + JWT** — Authentication & authorization
- **bcrypt** — Password hashing
- **class-validator** — Request validation

---

## ⚙️ Prerequisites

Make sure the following are installed on your system:

| Tool | Version |
|---|---|
| Node.js | 18.0.0 or higher |
| npm | 9.0.0 or higher |
| Angular CLI | 21.x (`npm install -g @angular/cli`) |
| NestJS CLI | 11.x (`npm install -g @nestjs/cli`) |
| PostgreSQL | 14.0 or higher |

---

## 🐘 PostgreSQL Setup

### 1. Install PostgreSQL

Download and install PostgreSQL from: https://www.postgresql.org/download/

During installation:
- Set a password for the `postgres` user (remember this, you'll need it)
- Default port: `5432`

### 2. Create the Database

Open **pgAdmin** or the **psql** command-line tool and run:

```sql
-- Connect as postgres superuser
CREATE DATABASE e_hrms;

-- (Optional) Create a dedicated user
CREATE USER hrms_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE e_hrms TO hrms_user;
```

### 3. Configure Backend Environment

Go to the `backend/` folder and open (or create) the `.env` file:

```env
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password_here
DB_DATABASE=e_hrms
DB_SYNCHRONIZE=true

# JWT Configuration
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRATION=1d
```

> **Note:** `DB_SYNCHRONIZE=true` will automatically create/update database tables based on your entity definitions. Set it to `false` in production and use migrations instead.

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/e-hrms.git
cd e-hrms
```

### 2. Install Frontend Dependencies

```bash
# In the root project folder
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## ▶️ Running the Application

### Start the Backend (NestJS)

Open a terminal, navigate to the `backend/` folder:

```bash
cd backend

# Development mode (with hot reload)
npm run start:dev

# OR production mode
npm run start:prod
```

The backend will be available at: **http://localhost:3000**

You can verify it's running by visiting: **http://localhost:3000/api** (API base URL)

---

### Start the Frontend (Angular)

Open a **new terminal** in the root project folder:

```bash
# In the root e-hrms/ folder
npm start
# or
ng serve
```

The frontend will be available at: **http://localhost:4200**

> The Angular dev server is configured with a proxy (`proxy.conf.json`) to forward `/api` requests to the backend at `http://localhost:3000`. Both servers must be running simultaneously.

---

### Run Both Together (Recommended)

You can run both frontend and backend at the same time using `concurrently`:

```bash
# From the root folder
npx concurrently "npm start" "cd backend && npm run start:dev"
```

---

## 🔑 Default Login Credentials

Once the backend is running and the database is set up, register a new user via the Register page, or use seeded credentials if available.

---

## 🏗️ Building for Production

### Build Backend

```bash
cd backend
npm run build
# Output will be in backend/dist/
npm run start:prod
```

### Build Frontend

```bash
# In root folder
ng build
# Build artifacts will be in dist/e-hrms/
```

---

## 🧪 Running Tests

### Frontend Tests

```bash
# In root folder
ng test
```

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# Test coverage
npm run test:cov

# End-to-end tests
npm run test:e2e
```

---

## 📡 API Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| GET | `/employees` | Get all employees |
| POST | `/employees` | Create employee |
| GET | `/employees/:id` | Get employee by ID |
| PUT | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Delete employee |
| GET | `/attendance` | Get attendance records |
| POST | `/attendance` | Create attendance record |
| GET | `/payroll` | Get payroll records |
| POST | `/payroll` | Create payroll record |
| GET | `/leave` | Get leave requests |
| POST | `/leave` | Create leave request |
| GET | `/performance` | Get performance records |
| POST | `/performance` | Create performance record |
| GET | `/training` | Get training records |
| POST | `/training` | Create training record |

> All protected routes require a `Bearer <token>` header obtained from the login endpoint.

---

## 🔍 Troubleshooting

### Backend won't start
- Ensure PostgreSQL is running and the `.env` credentials are correct
- Check if port `3000` is already in use: `netstat -ano | findstr :3000`

### Frontend can't connect to backend
- Ensure the backend is running on port `3000`
- Check `proxy.conf.json` in the root folder for the proxy configuration

### Database connection error
- Verify PostgreSQL service is running (search "Services" in Windows and find PostgreSQL)
- Double-check `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DATABASE` in `backend/.env`

### Tables not created automatically
- Ensure `DB_SYNCHRONIZE=true` in `.env` (for development only)

---

## 📄 License

This project is **UNLICENSED** and intended for internal/private use.

---

> **E-HRMS** — Built with ❤️ using Angular 21 + NestJS + PostgreSQL
