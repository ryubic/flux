import dotenv from "dotenv"
dotenv.config()
import connectDB from "./backend/db/index.js"

connectDB()