import { NextFunction, Request, Response } from "express";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  res.status(500).json({ message: "Unexpected error", error: errorMessage });
}
