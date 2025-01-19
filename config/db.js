const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');


const connectDB = async () => {
    try{
        await mongoose.connect(db);
        console.log("MOngo DB connected..")
    }catch(err){
        console.log("Failed to  DB connect..",err.message);
        console.error(err.message);
        process.exit(1);
        
    }
}
module.exports = connectDB;