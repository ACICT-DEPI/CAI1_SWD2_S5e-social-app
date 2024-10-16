const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

async function connectDB () {
    try{

    
const db=await mongoose.connect(process.env.DB_URL);

console.log(`Connected to MongoDB: ${db.connection.host}`);

}catch(e){
    
    console.error(`Error connecting to MongoDB: ${e.message}`);

}

}
module.exports = connectDB;