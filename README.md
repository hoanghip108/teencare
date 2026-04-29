# TeenUp Product Builder Test - Mini LMS

Mini web app for:

- Parent/Student management
- Class scheduling + registration
- Basic subscription tracking (used/remaining sessions)

## 1) Tech Stack

- Backend: Node.js + Express + TypeScript + PostgreSQL
- Frontend: React + TypeScript (Vite build, served by Nginx)
- DevOps: Docker + docker-compose

## 2) Run with Docker

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:8080
- Backend API: http://localhost:4000
- Swagger Docs: http://localhost:4000/api-docs
- Postgres: localhost:5432

## 3) Database Schema (main tables)

- `parents(id, name, phone, email)`
- `students(id, name, dob, gender, current_grade, parent_id)`
- `classes(id, name, subject, day_of_week, time_slot, teacher_name, max_students)`
- `subscriptions(id, student_id, package_name, start_date, end_date, total_sessions, used_sessions)`
- `class_registrations(id, class_id, student_id, subscription_id, session_datetime)`

## 4) Main REST APIs

### Parents

- `POST /api/parents`
- `GET /api/parents/:id`

### Students

- `POST /api/students`
- `GET /api/students/:id` (include parent info)

### Classes

- `POST /api/classes`
- `GET /api/classes?day=MONDAY`

### Class Registrations

- `POST /api/classes/:class_id/register`
    - Validate max students
    - Validate schedule overlap (same day + same timeslot)
    - Validate valid subscription (`end_date` not expired, `used_sessions < total_sessions`)
    - Auto increase `used_sessions` by 1 when register success
- `DELETE /api/registrations/:id`
    - Cancel >24h before class: refund 1 session
    - Cancel <24h: no refund

### Subscriptions

- `POST /api/subscriptions`
- `PATCH /api/subscriptions/:id/use`
- `GET /api/subscriptions/:id`

## 5) Seed Data

Auto seed in `backend/db/init.sql`:

- 2 parents
- 3 students
- 3 classes
- 3 subscriptions

## 6) Quick curl examples

```bash
# Create parent
curl -X POST http://localhost:4000/api/parents \
  -H "Content-Type: application/json" \
  -d '{"name":"New Parent","phone":"0909999999","email":"newparent@example.com"}'

# Create student
curl -X POST http://localhost:4000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Student X","dob":"2012-01-01","gender":"Male","current_grade":"Grade 8","parent_id":1}'

# List classes by day
curl "http://localhost:4000/api/classes?day=MONDAY"

# Register student into class
curl -X POST http://localhost:4000/api/classes/1/register \
  -H "Content-Type: application/json" \
  -d '{"student_id":1}'
```
