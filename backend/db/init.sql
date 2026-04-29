CREATE TABLE IF NOT EXISTS parents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  current_grade VARCHAR(50) NOT NULL,
  parent_id INT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  teacher_name VARCHAR(255) NOT NULL,
  max_students INT NOT NULL CHECK (max_students > 0),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  package_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_sessions INT NOT NULL CHECK (total_sessions > 0),
  used_sessions INT NOT NULL DEFAULT 0 CHECK (used_sessions >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_registrations (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subscription_id INT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  session_datetime TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

INSERT INTO parents (name, phone, email)
VALUES
  ('Nguyen Van A', '0901111111', 'parent.a@example.com'),
  ('Tran Thi B', '0902222222', 'parent.b@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (name, dob, gender, current_grade, parent_id)
VALUES
  ('Le Minh Khoa', '2012-05-02', 'Male', 'Grade 8', 1),
  ('Pham Ngoc Anh', '2013-03-19', 'Female', 'Grade 7', 1),
  ('Do Gia Han', '2011-11-23', 'Female', 'Grade 9', 2)
ON CONFLICT DO NOTHING;

INSERT INTO classes (name, subject, day_of_week, time_slot, teacher_name, max_students)
VALUES
  ('Math Foundation', 'Math', 'MONDAY', '18:00-19:30', 'Teacher Linh', 20),
  ('English Speaking', 'English', 'WEDNESDAY', '18:00-19:30', 'Teacher Nam', 15),
  ('Science Explorer', 'Science', 'FRIDAY', '19:00-20:30', 'Teacher Hoa', 12)
ON CONFLICT DO NOTHING;

INSERT INTO subscriptions (student_id, package_name, start_date, end_date, total_sessions, used_sessions)
VALUES
  (1, 'Starter 12', CURRENT_DATE - INTERVAL '10 day', CURRENT_DATE + INTERVAL '60 day', 12, 2),
  (2, 'Starter 10', CURRENT_DATE - INTERVAL '5 day', CURRENT_DATE + INTERVAL '45 day', 10, 1),
  (3, 'Pro 20', CURRENT_DATE - INTERVAL '7 day', CURRENT_DATE + INTERVAL '90 day', 20, 3)
ON CONFLICT DO NOTHING;
