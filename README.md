# <div align="center">TrackIt</div>
<div align="center">

### Finance + Productivity Platform

A full-stack MERN platform that brings **salary planning, expense tracking, smart budgeting, goals, todos, alerts, and analytics** into one modern workspace.

[![Live Demo](https://img.shields.io/badge/Live-Demo-7C3AED?style=for-the-badge&logo=vercel&logoColor=white)](https://trackit2-nine.vercel.app/)
[![Repository](https://img.shields.io/badge/GitHub-Repository-111827?style=for-the-badge&logo=github)](https://github.com/GoundPrincek/Track_It)
[![Status](https://img.shields.io/badge/Status-In_Development-8B5CF6?style=for-the-badge)]()
[![Backend](https://img.shields.io/badge/Backend-85--90%25-10B981?style=for-the-badge)]()
[![Frontend](https://img.shields.io/badge/Frontend-60--70%25-3B82F6?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-ISC-F59E0B?style=for-the-badge)]()

</div>

---

## Overview

**TrackIt** is a unified **finance + productivity** platform built to simplify how users manage both **money** and **daily execution** from one place.

Instead of switching between separate apps for salary planning, expense tracking, goals, reminders, and analytics, TrackIt offers a **centralized smart workspace** with a clean responsive interface and a modular backend foundation.

The platform is designed with a strong focus on:

- performance
- security
- scalability
- accessibility
- modern user experience

---

## Live Links

- **Live Demo:** [trackit2-nine.vercel.app](https://trackit2-nine.vercel.app/)
- **GitHub Repository:** [GoundPrincek/Track_It](https://github.com/GoundPrincek/Track_It)

---

## Core Modules

### Finance Management
- Monthly salary planner
- 50/30/20 budgeting rule
- Expense tracking and category analysis
- Average expense and spending overview
- Balance monitoring
- CSV and PDF statement import

### Productivity Management
- Goal creation and progress tracking
- Todo management
- Daily timeline planning
- Completion and in-progress status monitoring
- Productivity summary cards

### Smart Alerts
- Overspending alerts
- Todo reminders
- Goal progress reminders
- Live notification feed
- Priority-based warnings and updates

### Analytics
- Expense category distribution
- Goal status chart
- Savings and expense summaries
- Combined finance + productivity overview
- Dashboard insight blocks

---

## Premium Feature Highlights

<table>
  <tr>
    <td><b>Unified Workspace</b></td>
    <td>Finance and productivity inside one connected system instead of multiple separate apps.</td>
  </tr>
  <tr>
    <td><b>Smart Budgeting</b></td>
    <td>Automatic income allocation using the 50-30-20 budgeting rule.</td>
  </tr>
  <tr>
    <td><b>Expense Import</b></td>
    <td>Upload CSV or PDF bank statements and manage imported transactions with editable categorization.</td>
  </tr>
  <tr>
    <td><b>Goal Tracking</b></td>
    <td>Create, update, monitor, and organize personal goals with structured task planning.</td>
  </tr>
  <tr>
    <td><b>Responsive UI</b></td>
    <td>Modern dark/light interface with mobile-friendly layout and smoother navigation.</td>
  </tr>
  <tr>
    <td><b>Secure Backend</b></td>
    <td>JWT authentication, route protection, rate limiting, Helmet, and environment-based configuration.</td>
  </tr>
</table>

---

## Tech Stack

### Frontend
- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Helmet
- express-rate-limit
- CORS
- Multer
- csv-parser
- pdf-parse
- Nodemailer

---

## System Architecture

TrackIt follows a modular **MERN architecture**.

### Backend Design
- `app.js` handles middleware, routes, and app configuration
- `server.js` handles database connection and server startup
- modular route organization for easier scaling
- middleware-based authentication and protection
- environment-based deployment configuration

### API Modules
- `/api/auth`
- `/api/salary`
- `/api/expenses`
- `/api/todos`
- `/api/upload`
- `/api/notifications`
- `/api/goals`

---

## Implemented Features

- User authentication system
- Login and registration
- Salary planner
- Budget planning with 50/30/20 rule
- Expense tracking
- CSV import support
- PDF import support
- Goal management system
- Todo management
- Notification system
- Analytics page
- Dashboard overview
- Theme toggle
- Responsive navigation
- Protected routes
- Secure backend middleware

---

## Goal Management System

The newly integrated goals module is fully implemented and includes:

- `GET /api/goals` — fetch all user goals
- `POST /api/goals` — create new goals
- `PUT /api/goals/:id` — update goals
- `DELETE /api/goals/:id` — delete goals

### Goal module capabilities
- user-specific secure access
- validation and normalization
- latest-first sorted retrieval
- robust endpoint error handling

**Status:** ✅ Fully integrated

---

## Screenshots

> Place all screenshot files inside `docs/screenshots/` in your repository.

### Dashboard
<p align="center">
  <img src="docs/screenshots/dashboard-dark.png" alt="Dashboard Dark" width="48%" />
  <img src="docs/screenshots/dashboard-light.png" alt="Dashboard Light" width="48%" />
</p>

### Todo / Goal Tracker
<p align="center">
  <img src="docs/screenshots/todo-dark.png" alt="Todo Dark" width="48%" />
  <img src="docs/screenshots/todo-light.png" alt="Todo Light" width="48%" />
</p>

### Expenses
<p align="center">
  <img src="docs/screenshots/expenses-dark.png" alt="Expenses Dark" width="48%" />
  <img src="docs/screenshots/expenses-light.png" alt="Expenses Light" width="48%" />
</p>

### Salary Planner
<p align="center">
  <img src="docs/screenshots/salary-dark.png" alt="Salary Dark" width="48%" />
  <img src="docs/screenshots/salary-light.png" alt="Salary Light" width="48%" />
</p>

### Notifications
<p align="center">
  <img src="docs/screenshots/notifications-dark.png" alt="Notifications Dark" width="48%" />
  <img src="docs/screenshots/notifications-light.png" alt="Notifications Light" width="48%" />
</p>

### Analytics
<p align="center">
  <img src="docs/screenshots/analytics-dark.png" alt="Analytics Dark" width="80%" />
</p>

### Workflow Diagram
<p align="center">
  <img src="docs/screenshots/trackit-workflow.png" alt="TrackIt Workflow Diagram" width="90%" />
</p>

---

## Project Progress

### Backend
**85–90% complete**
- Core APIs: ✅ Completed
- Middleware & security: ✅ Completed
- Database integration: ✅ Completed
- Modular structure: ✅ Completed

### Frontend
**60–70% complete**
- Navigation & layout: ✅ Completed
- Main UI modules: 🔄 In progress
- Accessibility enhancements: 🔄 Planned
- API integration polish: 🔄 Ongoing

### Overall Progress
**~75% complete**

---

## Project Structure

```bash
Track_It/
│
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── controller/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── package.json
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
│
├── docs/
│   └── screenshots/
│
├── package.json
├── vercel.json
└── README.md
