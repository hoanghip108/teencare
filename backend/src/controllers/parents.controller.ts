import { Request, Response } from "express";
import { pool } from "../config/db";

export async function createParent(
    req: Request,
    res: Response,
): Promise<Response | void> {
    const { name, phone, email } = req.body;
    const result = await pool.query(
        "INSERT INTO parents (name, phone, email) VALUES ($1, $2, $3) RETURNING *",
        [name, phone, email],
    );
    res.status(201).json(result.rows[0]);
}

export async function getParentById(
    req: Request,
    res: Response,
): Promise<Response | void> {
    const result = await pool.query("SELECT * FROM parents WHERE id = $1", [
        req.params.id,
    ]);
    if (!result.rows.length)
        return res.status(404).json({ message: "Parent not found" });
    res.json(result.rows[0]);
}
