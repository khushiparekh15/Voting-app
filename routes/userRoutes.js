const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthmiddleware, generateToken } = require('./../jwt');

router.post('/signup', async (req,res)=>{
    try{
       const data=req.body   //Assuming the request body contains the person data

       //Create a new user document using the Mongoose model
       const newUser = new User(data);

       //Save the new user to the database
       const response = await newUser.save();
       console.log('data saved');

       const payload = {
        id: response.id,
       }
       console.log(JSON.stringify(payload));
       const token = generateToken(payload);
       console.log("Token is:", token);

       res.status(200).json({response: response , token: token});
       }
       catch(err){
               console.log(err);
               res.status(500).json({error:'Internal Server Error'});
       }
})

//Lgin Route
router.post('/login',async(req,res)=>{
    try {
        //Extract username and password from request body
        const {aadharCardNumber,password} =req.body;

        //Find the user by username...
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        //If User does exist or password does not match, return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:'Invalid UserName or Password'});
        }

        //Generate Token....
        const payload = {
            id : user.id,
        }
        const token = generateToken(payload);

        //Return Token as response
        res.json({token})
    } catch (err) {
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
});

//Profile route...
router.get('/profile',jwtAuthmiddleware,async(req,res)=>{
    try{
        const userData = req.user;

        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

//Update Operation........
router.put('/profile/password',jwtAuthmiddleware,async(req,res)=>{
    try{
        const userId = req.user;  //Extract the id from the token
        const{currentPassword,newPassword} = req.body //Extract current and new Passwords from request body

        //Find the user by User ID
        const user = await User.findById(userId);

        //If  password does not match, return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:'Invalid UserName or Password'});
        }

        //Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('Password updated');
             res.status(200).json({message: "Password Updated"});
    }catch{
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})
 
module.exports = router;