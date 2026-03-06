# 🎓 LearnFlow

**LearnFlow** is a full-stack online education platform where students can browse programs, submit applications, receive counselor reviews, make payments, and get **AI-powered program recommendations**.

![Node.js](https://img.shields.io/badge/Node.js-20-green)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7-brightgreen)
![Docker](https://img.shields.io/badge/Docker-ready-blue)

---

# 🚀 Features

| Feature | Description |
|------|-------------|
| 🔍 Program Discovery | Browse 12+ programs and filter by category, duration, or start date |
| 📝 Applications | Multi-step form with personal info, education history, and statement of purpose |
| 👨‍💼 Counselor Review | Counselors approve or deny applications with denial reasons |
| 🤖 AI Recommendations | Gemini AI suggests alternative programs when applications are denied |
| 💳 Payments | Full payment or 4-installment plan (simulated) |
| 📧 Email Notifications | Styled HTML emails triggered on major events |
| 🔐 Authentication | JWT authentication with role-based access (student / counselor) |

---

# 🧰 Tech Stack

| Layer | Technology |
|------|-----------|
| Backend | Node.js 20, Express.js |
| Database | MongoDB 7, Mongoose |
| AI Service | Python 3.11, Flask, Google Gemini |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Containerization | Docker, Docker Compose |

---

# ⚡ Quick Start

## Option A — Docker (Recommended)

Requires **Docker Desktop**

https://www.docker.com/products/docker-desktop/

```bash
# 1. Clone the repository
git clone <repo-url>

# 2. Enter the project directory
cd LearnFlow

# 3. Copy environment variables
cp .env.example .env
```

Edit `.env` and add:

- Gmail credentials
- Gemini API key

```bash
# 4. Start all services
docker compose up -d

# 5. Seed database with sample data
docker exec learnflow-backend node scripts/seed.js

# 6. Open the application
http://localhost:5000
```

---

## Option B — Local Development

### Prerequisites

- Node.js **18+**
- MongoDB running locally
- Python **3.9+** (optional, for AI service)

---

### Start Backend

```bash
cd server
npm install

cp ../.env.example ../.env
```

Edit `.env`.

```bash
# Seed database
npm run seed

# Start backend
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

### Start AI Service (Optional)

```bash
cd ai-service

pip install -r requirements.txt

python app.py
```

AI service runs at:

```
http://localhost:5001
```

---

# 🔐 Environment Variables

Copy `.env.example` to `.env`.

| Variable | Description | Example |
|------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/learnflow |
| JWT_SECRET | Secret key for JWT tokens | any-long-random-string |
| GMAIL_USER | Gmail address for sending emails | you@gmail.com |
| GMAIL_APP_PASSWORD | Gmail App Password | xxxx xxxx xxxx xxxx |
| GOOGLE_API_KEY | Gemini API key | AIza... |
| PORT | Backend server port | 5000 |
| AI_SERVICE_URL | URL of Python AI service | http://localhost:5001 |

**Note:** If Gmail or Gemini credentials are missing, the system **still works**, but email and AI features are disabled.

---

# 👤 Demo Accounts

| Role | Email | Password |
|-----|------|---------|
| Student | student@learnflow.com | student123 |
| Counselor | counselor@learnflow.com | counselor123 |

---

# 📂 Project Structure

```
LearnFlow/
│
├── server/                    # Node.js Express backend
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT + role guards
│   ├── models/                # User, Program, Application, Payment
│   ├── routes/                # auth, programs, applications, payments
│   ├── services/
│   │   └── emailService.js    # HTML email templates
│   └── scripts/
│       └── seed.js            # Database seeder
│
├── ai-service/                # Python Flask AI microservice
│   ├── app.py
│   └── recommender.py
│
├── public/                    # Static frontend
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── programs.js
│   │   ├── application.js
│   │   ├── dashboard.js
│   │   ├── counselor.js
│   │   ├── payment.js
│   │   └── recommendations.js
│   └── *.html
│
├── Dockerfile
├── Dockerfile.ai
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 🔗 API Reference

| Method | Endpoint | Auth | Description |
|------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/programs` | No | List programs |
| GET | `/api/programs/:slug` | No | Program details |
| POST | `/api/applications` | Student | Submit application |
| GET | `/api/applications/my` | Student | View my applications |
| GET | `/api/applications` | Counselor | View all applications |
| PATCH | `/api/applications/:id/approve` | Counselor | Approve application |
| PATCH | `/api/applications/:id/deny` | Counselor | Deny application + AI recommendations |
| POST | `/api/payments` | Student | Process payment |
| GET | `/api/payments/history` | Student | Payment history |
| POST | `/api/ai/recommend` | No | AI program recommendations |

---

# 🐳 Docker Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Reset containers + database
docker compose down -v

# Rebuild containers
docker compose up -d --build

# Seed database
docker exec learnflow-backend node scripts/seed.js
```

---

# 📜 License

MIT License
