# ArcLight-SOS – Rapid Crisis Response System

ArcLight-SOS is a full-stack MERN application designed to help hotel management rapidly respond to emergencies. It features a modern, clean, dark-themed UI (React/Tailwind) and real-time backend updates via Socket.io.

## Project Structure
- `server/` - Node.js + Express + MongoDB backend
- `client/` - React (Vite) + Tailwind CSS frontend

---

## Prerequisites (Very Important)
Ensure you have **Node.js** and **npm** installed on your system.
Ensure you have a local instance of **MongoDB** running on the default port, or change the `MONGO_URI` in `server/.env`.

---

## 1. Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server (starts on `http://localhost:5000`):
   ```bash
   npm start
   ```
   *You should see "MongoDB connected" and server running messages.*

---

## 2. Frontend Setup

1. Open a NEW terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser (usually `http://localhost:5173`).

---

## Features
- **SOS Terminal (`/`)**: Large pulse-animated SOS button, custom inputs for location and crisis type.
- **Admin Dashboard (`/admin`)**: Real-time updates with synthesized sound alerts. Card-based status management (Active -> Pending Review -> Resolved).
