import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';

dotenv.config({
    path: "./.env",
});


const port = process.env.PORt || 3000;

connectDB()
  .then(()=>{
    app.listen(port, () => {
    console.log(`project management app backend listening on port ${port}`);
    })
  })
  .catch((err)=>{
    console.log("mongo db connection error",err);
    process.exit(1);
  })

