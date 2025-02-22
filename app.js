
const express = require("express");
const dotenv = require("dotenv");
const mongoose=require("mongoose");
// const Contact=require("./models/contact");
const router=require("./routes/identifyRoute")
dotenv.config();
const PORT = process.env.PORT || 3000;


const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(router)
// connect the database
const connect= async ()=>{
try {
    await mongoose.connect(process.env.MONGO_URI, {
      
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }}
  connect();

//sample get method
  app.get('/',(req,res)=>{
    console.log('hello world')
    res.send("hello world");
  })


app.listen(PORT,() => console.log(`Server running on port ${PORT}`));


