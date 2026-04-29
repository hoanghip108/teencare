import { Request, Response } from "express";
import { pool } from "../config/db";

export async function createSubscription(
    req: Request,
    res: Response,
): Promise<void> {
    const {
        student_id,
        package_name,
        start_date,
        end_date,
        total_sessions,
        used_sessions = 0,
    } = req.body;
    const result = await pool.query(
        `INSERT INTO subscriptions (student_id, package_name, start_date, end_date, total_sessions, used_sessions)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
            student_id,
            package_name,
            start_date,
            end_date,
            total_sessions,
            used_sessions,
        ],
    );
    res.status(201).json(result.rows[0]);
}

export async function useSubscriptionSession(
    req: Request,
    res: Response,
): Promise<Response | void> {
    const result = await pool.query(
        `UPDATE subscriptions
     SET used_sessions = used_sessions + 1, updated_at = NOW()
     WHERE id = $1 AND used_sessions < total_sessions
     RETURNING *`,
        [req.params.id],
    );
    if (!result.rows.length)
        return res
            .status(400)
            .json({ message: "Subscription has no remaining sessions" });
    res.json(result.rows[0]);
}

export async function getSubscriptionById(
    req: Request,
    res: Response,
): Promise<Response | void> {
    const result = await pool.query(
        "SELECT * FROM subscriptions WHERE id = $1",
        [req.params.id],
    );
    if (!result.rows.length)
        return res.status(404).json({ message: "Subscription not found" });
    res.json(result.rows[0]);
}
