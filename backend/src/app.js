import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

// middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// import routes
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

// error handler middleware
app.use(errorHandler());

export { app };
