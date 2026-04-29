import { Request, Response } from "express";
import { pool } from "../config/db";
import { getNextSessionDate } from "../utils/schedule";

export async function registerStudentToClass(
    req: Request,
    res: Response,
): Promise<Response | void> {
    const { student_id } = req.body;
    const classId = req.params.class_id;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const classRes = await client.query(
            "SELECT * FROM classes WHERE id = $1",
            [classId],
        );
        if (!classRes.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Class not found" });
        }
        const classObj = classRes.rows[0];

        const seatRes = await client.query(
            "SELECT COUNT(*)::int AS total FROM class_registrations WHERE class_id = $1",
            [classId],
        );
        if (seatRes.rows[0].total >= classObj.max_students) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Class is full" });
        }

        const overlapRes = await client.query(
            `SELECT cr.id
       FROM class_registrations cr
       JOIN classes c ON c.id = cr.class_id
       WHERE cr.student_id = $1 AND c.day_of_week = $2 AND c.time_slot = $3`,
            [student_id, classObj.day_of_week, classObj.time_slot],
        );
        if (overlapRes.rows.length) {
            await client.query("ROLLBACK");
            return res
                .status(400)
                .json({
                    message: "Student has another class at this time slot",
                });
        }

        const subRes = await client.query(
            `SELECT * FROM subscriptions
       WHERE student_id = $1
         AND start_date <= CURRENT_DATE
         AND end_date >= CURRENT_DATE
         AND used_sessions < total_sessions
       ORDER BY end_date ASC
       LIMIT 1`,
            [student_id],
        );
        if (!subRes.rows.length) {
            await client.query("ROLLBACK");
            return res
                .status(400)
                .json({ message: "No valid subscription found" });
        }
        const subscription = subRes.rows[0];

        const sessionDatetime = getNextSessionDate(
            classObj.day_of_week,
            classObj.time_slot,
        );
        if (!sessionDatetime) {
            await client.query("ROLLBACK");
            return res
                .status(400)
                .json({
                    message: "Invalid class time slot format. Use HH:mm-HH:mm",
                });
        }

        const regRes = await client.query(
            `INSERT INTO class_registrations (class_id, student_id, subscription_id, session_datetime)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [
                classId,
                student_id,
                subscription.id,
                sessionDatetime.toISOString(),
            ],
        );

        await client.query(
            "UPDATE subscriptions SET used_sessions = used_sessions + 1, updated_at = NOW() WHERE id = $1",
            [subscription.id],
        );

        await client.query("COMMIT");
        res.status(201).json(regRes.rows[0]);
    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({
            message: "Register failed",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    } finally {
        client.release();
    }
}

export async function cancelRegistration(
    req: Request,
    res: Response,
): Promise<Response | void> {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const regRes = await client.query(
            "SELECT * FROM class_registrations WHERE id = $1",
            [req.params.id],
        );
        if (!regRes.rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Registration not found" });
        }

        const reg = regRes.rows[0];
        const now = new Date();
        const sessionTime = new Date(reg.session_datetime);
        const diffHours =
            (sessionTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        const refundable = diffHours > 24;

        await client.query("DELETE FROM class_registrations WHERE id = $1", [
            req.params.id,
        ]);

        if (refundable) {
            await client.query(
                `UPDATE subscriptions
         SET used_sessions = GREATEST(used_sessions - 1, 0), updated_at = NOW()
         WHERE id = $1`,
                [reg.subscription_id],
            );
        }

        await client.query("COMMIT");
        res.json({ deleted: true, refundable });
    } catch (error) {
        await client.query("ROLLBACK");
        res.status(500).json({
            message: "Cancel failed",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    } finally {
        client.release();
    }
}
