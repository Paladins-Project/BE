import mongoose from "mongoose";
import express from "express";

const app = express();

//mongoose.connect("mongodb://localhost:27017/ExpressJSBegin").then(() => {
mongoose.connect("mongodb+srv://nguyenngochoa12112003:9a352960@cluster0.m7yk3bi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/EXE2").then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Running on port http://localhost:${PORT}`)
});
