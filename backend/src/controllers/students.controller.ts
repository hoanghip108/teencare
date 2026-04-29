import { Request, Response } from "express";
import { pool } from "../config/db";

export async function createStudent(
    req: Request,
    res: Response,
): Promise<Response | void> {
    const { name, dob, gender, current_grade, parent_id } = req.body;
    const parent = await pool.query("SELECT id FROM parents WHERE id = $1", [
        parent_id,
    ]);
    if (!parent.rows.length)
        return res.status(400).json({ message: "Invalid parent_id" });

    const result = await pool.query(
        "INSERT INTO students (name, dob, gender, current_grade, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [name, dob, gender, current_grade, parent_id],
    );
    res.status(201).json(result.rows[0]);
}

export async function getStudentById(
    req: Request,
    res: Response,
): Promise<Response | void> {
    const result = await pool.query(
        `SELECT s.*, row_to_json(p.*) AS parent
     FROM students s
     JOIN parents p ON s.parent_id = p.id
     WHERE s.id = $1`,
        [req.params.id],
    );
    if (!result.rows.length)
        return res.status(404).json({ message: "Student not found" });
    res.json(result.rows[0]);
}
