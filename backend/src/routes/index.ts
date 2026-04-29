import { Router } from "express";
import { pool } from "../config/db";
import { createClass, listClasses } from "../controllers/classes.controller";
import { createParent, getParentById } from "../controllers/parents.controller";
import { cancelRegistration, registerStudentToClass } from "../controllers/registrations.controller";
import { createStudent, getStudentById } from "../controllers/students.controller";
import { createSubscription, getSubscriptionById, useSubscriptionSession } from "../controllers/subscriptions.controller";

const router = Router();

router.get("/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true });
});

router.post("/parents", createParent);
router.get("/parents/:id", getParentById);

router.post("/students", createStudent);
router.get("/students/:id", getStudentById);

router.post("/classes", createClass);
router.get("/classes", listClasses);

router.post("/classes/:class_id/register", registerStudentToClass);
router.delete("/registrations/:id", cancelRegistration);

router.post("/subscriptions", createSubscription);
router.patch("/subscriptions/:id/use", useSubscriptionSession);
router.get("/subscriptions/:id", getSubscriptionById);

export default router;
