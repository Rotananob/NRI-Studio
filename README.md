# 🖥️ NRI Studio — Web-Based IDE

> A full-stack, VSCode-like code editor running in the browser. Responsive for Laptop, Tablet & Phone.

![NRI Studio](https://img.shields.io/badge/NRI-Studio-007acc?style=for-the-badge&logo=visualstudiocode)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square&logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-Auth-ffca28?style=flat-square&logo=firebase)

---

## ✨ Features

- 🎨 **Monaco Editor** — Same engine as Visual Studio Code
- 🔐 **Firebase Authentication** — Secure login/register with JWT
- 🗄️ **MongoDB Atlas** — Cloud storage for all user projects & files
- 📁 **File Explorer** — Create, rename, delete files & folders
- 📑 **Multi-Tab Editor** — Open multiple files with dirty state indicator
- ▶️ **Code Execution** — Run JavaScript in a sandboxed environment
- 💻 **Terminal Panel** — Integrated terminal UI (xterm.js)
- 🌗 **Dark / Light Theme** — VSCode Dark+ inspired by default
- 📱 **Fully Responsive** — Works on Laptop, Tablet & Phone

---

## 🏛️ Architecture

```
frontend/   → React + TypeScript + Vite  (Port 5173)
backend/    → Node.js + Express + TypeScript  (Port 3001)
```

**Security Layers:**
- Firebase JWT verified on every API request
- User data 100% isolated (User A cannot access User B's data)
- Rate limiting, Helmet.js, CORS, Zod input validation
- Code runs in sandboxed child process (no system access)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- MongoDB Atlas account
- Firebase project

### 1. Clone the repo
```bash
git clone https://github.com/Rotananob/NRI-Studio.git
cd NRI-Studio
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your credentials in .env
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Fill in your Firebase config in .env
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin client email |
| `ALLOWED_ORIGINS` | Frontend URL (default: http://localhost:5173) |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |

> ⚠️ **Never commit `.env` files.** See `.env.example` for templates.

---

## 📁 Project Structure

```
NRI-Studio/
├── frontend/               # React + TypeScript (Vite)
│   └── src/
│       ├── api/            # Axios API modules
│       ├── components/     # UI components
│       ├── pages/          # Route pages
│       ├── store/          # Zustand state
│       └── types/          # TypeScript types
│
└── backend/                # Node.js + Express + TypeScript
    └── src/
        ├── config/         # Firebase Admin + MongoDB
        ├── controllers/    # Route handlers
        ├── middleware/     # Auth, rate limit, error
        ├── models/         # Mongoose schemas
        ├── routes/         # API routes
        └── utils/          # Validators, sandbox
```

---

## 🛡️ Security

- 🔐 Firebase JWT verification on every protected route
- 🚫 Rate limiting: 100 req/15min (API), 10 req/15min (auth)
- 🛡️ Helmet.js security headers
- ✅ Zod input validation & sanitization
- 🏖️ Code sandbox: isolated child process, 5s timeout, no system access
- 🔒 CORS: whitelist only

---

## 📄 License

MIT © NRI Studio
