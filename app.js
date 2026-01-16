import express from "express"
import { mongo_connection } from "./src/utills/mongodbConnection.js";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./src/routers/authRoute.js"
import { errorHandler } from "./src/middleware/error.middleware.js";
import { userRouter } from "./src/routers/userRoute.js";


dotenv.config();
const app = express();
app.use(express.json())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

const PORT = process.env.PORT || 5000;

app.get("/",(req,res)=>{
    res.send({"value":"bikash"})
})
app.use("/auth", authRoutes);
app.use("/user",userRouter);

app.use(errorHandler);

app.listen(PORT,()=>{
    mongo_connection();
    console.log(`server start port ${PORT}`)
})


// Bikash@1223
// Bikash2448