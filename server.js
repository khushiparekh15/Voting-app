const express = require('express')
const app = express();
const db =require('./db');
require('dotenv').config();
//const passport = require('./auth');

const bodyParser =require('body-parser');
app.use(bodyParser.json());

const PORT = process.env.PORT ||3000;



//Import the router files.......
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);
app.listen(3000,()=>{
    console.log('listening on port 3000');
})