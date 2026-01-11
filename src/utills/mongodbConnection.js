import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongo_url = process.env.MongoDB_URL;
// console.log(mongo_url);


export function mongo_connection(){ 
    mongoose.connect(mongo_url).then(() => {
            console.log('DB connection established');
        })
        .catch((err) => {
            console.log('DB CONNECTION FAILED');
            console.log('ERR: ', err);
        });
    }


