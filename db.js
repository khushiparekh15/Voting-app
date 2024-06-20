const mongooes = require('mongoose');
require('dotenv').config();

//Define the mongoDB connection URL
const mongoURL = process.env.MONGODB_URL_LOCAL;

//const mongoURL = 'mongodb+srv://khushi:kkhhdd@1507@cluster0.w1ey1tv.mongodb.net/?retryWrites=true&w=na'
//Set up MongoDB connection.......
mongooes.connect(mongoURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
const db = mongooes.connection;

db.on('connected',()=>{
    console.log('connected to mongoDB server');
});

db.on('error',(err)=>{
    console.log('mongoDB connection error:'+err);
});

db.on('disconnected',()=>{
    console.log('mongoDB disconnected');
});

//Export the database connection
module.exports=db;