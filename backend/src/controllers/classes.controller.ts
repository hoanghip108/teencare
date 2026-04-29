import { Request, Response } from "express";
import { pool } from "../config/db";
import { DAYS, normalizeDay } from "../utils/schedule";

export async function createClass(
    req: Request,
    res: Response,
): Promise<Response | void> {
    const {
        name,
        subject,
        day_of_week,
        time_slot,
        teacher_name,
        max_students,
    } = req.body;
    const normalizedDay = normalizeDay(day_of_week);

    if (!DAYS.includes(normalizedDay as (typeof DAYS)[number])) {
        return res.status(400).json({ message: "Invalid day_of_week" });
    }

    const result = await pool.query(
        `INSERT INTO classes (name, subject, day_of_week, time_slot, teacher_name, max_students)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, subject, normalizedDay, time_slot, teacher_name, max_students],
    );
    res.status(201).json(result.rows[0]);
}

export async function listClasses(req: Request, res: Response): Promise<void> {
    const day = req.query.day ? normalizeDay(req.query.day) : null;
    const result = day
        ? await pool.query(
              "SELECT * FROM classes WHERE day_of_week = $1 ORDER BY time_slot",
              [day],
          )
        : await pool.query(
              "SELECT * FROM classes ORDER BY day_of_week, time_slot",
          );
    res.json(result.rows);
}
