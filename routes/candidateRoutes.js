const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const { jwtAuthmiddleware, generateToken } = require('./../jwt');
const User = require('../models/user');
const { route } = require('./userRoutes');
const { countBy } = require('lodash');

const checkAdminRole = async (userID)=>{
    try{
        const user = await User.findById(userID);
       if(user.role === 'admin'){
            return true;
       }
    }catch(err){
        return false;
    }
}

//Post route to add a candidate..
router.post('/',jwtAuthmiddleware, async (req,res)=>{
    try{
        if(! await checkAdminRole(req.user.id))
            return res.status(403).json({message:'user does not Have admin role'});
        
       const data=req.body   //Assuming the request body contains the candidate data

       //Create a new Person document using the Mongoose model
       const newCandidate = new Candidate(data);

       //Save the new person to the database
       const response = await newCandidate.save();
       console.log('data saved');

       res.status(200).json({response: response});
       }
       catch(err){
               console.log(err);
               res.status(500).json({error:'Internal Server Error'});
       }
})


//Update Operation........
router.put('/:candidateID',jwtAuthmiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message:'user does not Have admin role'});
        }
        const candidateID = req.params.candidateID;  //Extract the id from thhe URL parameter
        const updateCandidateData = req.body;   //Updates data for the person
        
        const response = await Candidate.findByIdAndUpdate(candidateID,updateCandidateData,{
            new: true,  //Return the updated document
            runValidators: true,  //Run Mongoose validation
        })

        if(!response){
            return res.status(404).json({error: 'Candidate not found'});
        }
        console.log('candidate data updated');
             res.status(200).json(response);
    }catch{
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})


//Delete Operation.....
router.delete('/:id',jwtAuthmiddleware,async (req,res)=>{
    try {
        if(!checkAdminRole(req.user.id)){
            return res.status(403).jsonn({message:'usee does not Have admin role'});
        }
        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);

        if(!response){
            return res.status(404).json({error: 'Candidate not found'});
        }
            console.log('Candidate deleted');
             res.status(500).json({message: 'Candidate Deleted Successfully'});
    } catch (err) {
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

//let's start Voting....
router.post('/vote/:candidateID',jwtAuthmiddleware,async (req,res)=>{
    //No Admin can Vote...
    //User can only Vote once

    candidateID = req.params.candidateID;
    userId = req.user.id;

    try{

        //Find the Candidate Document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message: 'Candidate Not Found..'});
        }
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'User Not Found..'});
        }
        if(user.isVoted){
            return res.status(400).json({message: 'You Have Already Voted..'});
        }
        if(user.role =='admin'){
            return res.status(403).json({message: 'Admin is not allowed..'});
        }

        //Update The Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.votecount++;
        await candidate.save();

        //Update the user document...
        user.isVoted = true
        await user.save();

        res.status(200).json({message:'Vote Recorded SuccessFully......'})
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
});

//Vote Count
router.get('/vote/count',async(req,res)=>{
    try {
        //Find All candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({votecount: 'desc'});

        //Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.votecount
            }
        });
        
        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
});
// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;