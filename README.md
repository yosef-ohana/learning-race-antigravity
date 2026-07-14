# Math Race / Innovative Learning Race

A real-time, interactive, gamified math racing game. Students answer math questions to progress on a visual race track, utilizing dynamic decision meters, branching paths (Highway / Dirt Road), and freeze/hint mechanics. Teachers create, start, and monitor races live via an SSE-powered real-time dashboard.

---

## 🛠️ Tech Stack & Requirements

### Requirements
* Git
* Java 17 or a compatible newer LTS Java version
* Node.js LTS with npm
* Internet connection on first run

Global Maven installation is NOT required.
MySQL is NOT required for the default local run.
The default local profile uses in-memory H2.

* Backend runs at: `http://localhost:8080`
* Frontend runs at: `http://localhost:3000`
* Teacher Login: `http://localhost:3000/teacher/login`

---

## 🚀 Quick Start

### Windows quick start
From repository root:
```cmd
run-windows.cmd
```

### macOS/Linux quick start
From repository root:
```bash
chmod +x run-macos-linux.sh
./run-macos-linux.sh
```

---

## 💻 Manual startup

### Backend
Windows:
```cmd
cd backend
mvnw.cmd spring-boot:run
```

macOS/Linux:
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend
In another terminal:
```bash
cd frontend
npm ci
npm run dev
```

Open the exact Vite URL: `http://localhost:3000`

---

## 🔑 Sample teacher account
* Username: `teacher`
* Password: `password123`

---

## 📚 Code Navigation Guide
For reviewers or future developers who want to understand where each part of the code lives and how to safely add features, see:
[`docs/CODE_GUIDE.md`](docs/CODE_GUIDE.md)

---

## 🔧 Compact troubleshooting

* Port 8080 is already in use.
* Port 3000 is already in use.
* Java is missing or incompatible.
* Node/npm is missing.
* Existing clone is outdated: run `git pull`.
* First run requires internet to download Maven/npm dependencies.
* Do not open port 5173; this project uses port 3000.
