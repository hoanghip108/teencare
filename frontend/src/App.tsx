import { FormEvent, useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

type Parent = {
  id: number;
  name: string;
  phone: string;
  email: string;
};

type Student = {
  id: number;
  name: string;
  dob: string;
  gender: string;
  current_grade: string;
  parent_id: number;
};

type ClassItem = {
  id: number;
  name: string;
  subject: string;
  day_of_week: string;
  time_slot: string;
  teacher_name: string;
  max_students: number;
};

type ParentForm = { name: string; phone: string; email: string };
type StudentForm = { name: string; dob: string; gender: string; current_grade: string; parent_id: string };
type RegisterForm = { student_id: string; class_id: string };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data as T;
}

export default function App() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [message, setMessage] = useState("");

  const [parentForm, setParentForm] = useState<ParentForm>({ name: "", phone: "", email: "" });
  const [studentForm, setStudentForm] = useState<StudentForm>({
    name: "",
    dob: "",
    gender: "Male",
    current_grade: "",
    parent_id: ""
  });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({ student_id: "", class_id: "" });

  const classByDay = useMemo(() => {
    return DAYS.reduce<Record<string, ClassItem[]>>((acc, day) => {
      acc[day] = classes.filter((c) => c.day_of_week === day);
      return acc;
    }, {});
  }, [classes]);

  async function loadInitialData() {
    try {
      const allClasses = await request<ClassItem[]>("/api/classes");
      setClasses(allClasses);

      const fetchedStudents = await Promise.all([1, 2, 3].map((id) => request<Student>(`/api/students/${id}`).catch(() => null)));
      setStudents(fetchedStudents.filter((item): item is Student => item !== null));

      const fetchedParents = await Promise.all([1, 2].map((id) => request<Parent>(`/api/parents/${id}`).catch(() => null)));
      setParents(fetchedParents.filter((item): item is Parent => item !== null));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Load failed");
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function createParent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const data = await request<Parent>("/api/parents", { method: "POST", body: JSON.stringify(parentForm) });
      setParents((prev) => [...prev, data]);
      setParentForm({ name: "", phone: "", email: "" });
      setMessage("Created parent successfully");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Create parent failed");
    }
  }

  async function createStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const payload = { ...studentForm, parent_id: Number(studentForm.parent_id) };
      const data = await request<Student>("/api/students", { method: "POST", body: JSON.stringify(payload) });
      setStudents((prev) => [...prev, data]);
      setStudentForm({ name: "", dob: "", gender: "Male", current_grade: "", parent_id: "" });
      setMessage("Created student successfully");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Create student failed");
    }
  }

  async function registerStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await request(`/api/classes/${registerForm.class_id}/register`, {
        method: "POST",
        body: JSON.stringify({ student_id: Number(registerForm.student_id) })
      });
      setMessage("Register success");
      setRegisterForm({ student_id: "", class_id: "" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Register failed");
    }
  }

  return (
    <div className="container">
      <h1>TeenUp Mini LMS</h1>
      {message && <p className="message">{message}</p>}

      <section className="card">
        <h2>Create Parent</h2>
        <form onSubmit={createParent} className="form">
          <input placeholder="Name" value={parentForm.name} onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })} required />
          <input placeholder="Phone" value={parentForm.phone} onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })} required />
          <input placeholder="Email" type="email" value={parentForm.email} onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })} required />
          <button type="submit">Create Parent</button>
        </form>
      </section>

      <section className="card">
        <h2>Create Student</h2>
        <form onSubmit={createStudent} className="form">
          <input placeholder="Name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} required />
          <input type="date" value={studentForm.dob} onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })} required />
          <select value={studentForm.gender} onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}>
            <option>Male</option>
            <option>Female</option>
          </select>
          <input placeholder="Current Grade" value={studentForm.current_grade} onChange={(e) => setStudentForm({ ...studentForm, current_grade: e.target.value })} required />
          <select value={studentForm.parent_id} onChange={(e) => setStudentForm({ ...studentForm, parent_id: e.target.value })} required>
            <option value="">Select Parent</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (#{p.id})
              </option>
            ))}
          </select>
          <button type="submit">Create Student</button>
        </form>
      </section>

      <section className="card">
        <h2>Weekly Classes</h2>
        <div className="week-grid">
          {DAYS.map((day) => (
            <div key={day} className="day-col">
              <h3>{day}</h3>
              {classByDay[day]?.length ? (
                classByDay[day].map((c) => (
                  <div key={c.id} className="class-item">
                    <b>{c.name}</b>
                    <div>{c.time_slot}</div>
                    <div>{c.teacher_name}</div>
                  </div>
                ))
              ) : (
                <p className="muted">No class</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Register Student To Class</h2>
        <form onSubmit={registerStudent} className="form">
          <select value={registerForm.student_id} onChange={(e) => setRegisterForm({ ...registerForm, student_id: e.target.value })} required>
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (#{s.id})
              </option>
            ))}
          </select>
          <select value={registerForm.class_id} onChange={(e) => setRegisterForm({ ...registerForm, class_id: e.target.value })} required>
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.day_of_week} {c.time_slot}
              </option>
            ))}
          </select>
          <button type="submit">Register</button>
        </form>
      </section>
    </div>
  );
}
