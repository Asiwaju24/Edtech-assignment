# EdTech Platform 🎓

A full-stack EdTech platform built with **React** (frontend) and **Django** (backend).

## Features
- 👨‍🏫 **Tutors**: Create courses, upload resources (PDF/video/docs), create assignments, grade submissions, give feedback
- 🎒 **Students**: Enroll in courses, view resources, submit assignments, receive grades & feedback
- 🔔 **Real-time notifications** via WebSocket
- 🔐 **JWT authentication**

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Django 4.2, Django REST Framework, SimpleJWT |
| Real-time | Django Channels (WebSocket) |
| Database | SQLite |
| File storage | Django media files |

## Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm start
```

The React app proxies API requests to `http://localhost:8000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | Login (get JWT) |
| GET/POST | `/api/courses/` | List/create courses |
| GET | `/api/courses/all/` | All courses (student discovery) |
| POST | `/api/courses/:id/enroll/` | Enroll in course |
| GET/POST | `/api/courses/:id/resources/` | Course resources |
| GET/POST | `/api/courses/:id/assignments/` | Course assignments |
| POST | `/api/assignments/:id/submit/` | Submit assignment |
| PATCH | `/api/submissions/:id/grade/` | Grade submission |
| GET | `/api/notifications/` | User notifications |
| WS | `ws://localhost:8000/ws/notifications/` | Real-time notifications |

## Project Structure
```
edtech/
├── backend/
│   ├── edtech/          # Django project settings
│   ├── api/             # Main app (models, views, serializers)
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── api/         # Axios client
    │   ├── components/  # Layout, shared components
    │   ├── context/     # Auth context
    │   └── pages/       # Route pages
    └── public/
```
