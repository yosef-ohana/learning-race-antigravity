#!/usr/bin/env bash
set -e

# 1. Use paths relative to the script location.
cd "$(dirname "$0")"

# 3. Check requirements
if ! command -v java >/dev/null 2>&1; then
    echo "ERROR: java is missing. Please install Java 17 or compatible."
    exit 1
fi

if ! command -v node >/dev/null 2>&1; then
    echo "ERROR: node is missing. Please install Node.js."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "ERROR: npm is missing. Please install npm."
    exit 1
fi

echo "Starting Backend..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..

echo "Starting Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Frontend dependencies..."
    npm ci
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================================="
echo "Backend:       http://localhost:8080"
echo "Frontend:      http://localhost:3000"
echo "Teacher Login: http://localhost:3000/teacher/login"
echo "======================================================="
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM EXIT

wait
