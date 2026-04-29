import cors from "cors";
import express from "express";
import apiRouter from "./routes";
import { swaggerUiHandlers } from "./docs/swagger";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api-docs", ...swaggerUiHandlers);
app.use("/api", apiRouter);
app.use(errorHandler);

export default app;
