import express from "express"
import { mongo_connection } from "./src/utills/mongodbConnection.js";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./src/routers/authRoute.js"


dotenv.config();
const app = express();
app.use(express.json())
app.use(cors({
    origin:"*",
    credentials:true
}))

const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
    res.send({"value":"bikash"})
})
app.use("/auth", authRoutes);

app.listen(PORT,()=>{
    mongo_connection();
    console.log(`server start port ${PORT}`)
})