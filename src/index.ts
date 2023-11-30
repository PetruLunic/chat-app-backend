import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";
import app from "./app";

const PORT = process.env.PORT || 5000;

(async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL || "");
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        })
    }catch(e){
        console.log(e);
    }
})()