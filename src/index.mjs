import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";

const app = express();
dotenv.config();
//mongoose.connect("mongodb://localhost:27017/ExpressJSBegin").then(() => {
mongoose.connect(process.env.DBCONNECTIONSTRING).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});
// const PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, () => {
    console.log(`Running on port http://localhost:${process.env.PORT}`)
});
