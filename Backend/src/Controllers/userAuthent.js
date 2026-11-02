const redisClient = require('../config/redis');
const User=require('../modules/user')
const validate=require('../utils/validator')
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')
const Submission=require("../modules/submission")

const register=async (req,res)=>{
  try{
    //validator
    validate(req.body)

    const {firstName,emailID, password}=req.body;
    req.body.password= await bcrypt.hash(password,10);
    req.body.role='user'

    const user =await User.create(req.body)

    const reply={
      firstName:user.firstName,
      emailID:user.emailID,
      _id:user._id,
      role:user.role
    }

    const token=jwt.sign({_id:user._id,emailID:emailID,role:user.role},process.env.JWT_SECRET,{expiresIn:3600})
    res.cookie('token',token,{maxAge:60*60*1000});

    res.status(201).json({
      user:reply,
      message:"user register successfully"
    })

  }
  catch(err){
    console.log(err);
    res.status(400).send("Error "+err.message);
  }
}


const login=async (req,res)=>{
  try{
    const {emailID,password}=req.body;
    if(!emailID){
      throw new Error("Invalid Crenditial")
    }
    if(!password){
      throw new Error("Invalid Crenditial")
    }
    const user=await User.findOne({emailID})
    if (!user) {
      throw new Error("Invalid Credential");
    }
    const match= await bcrypt.compare(password,user.password);

    if(!match){
      throw new Error("Invalid Crenditial")
    }

    const reply={
      firstName:user.firstName,
      emailID:user.emailID,
      _id:user._id,
      role:user.role
    }

    const token=jwt.sign({_id:user._id,emailID:emailID,role:user.role},process.env.JWT_SECRET,{expiresIn:3600})
    res.cookie('token',token,{maxAge:60*60*1000});
    res.status(200).json({
      user:reply,
      message:"login successfully"
    })
  }
  catch(err){
    res.status(401).send("Error: "+err)
  }
}


const logout=async (req,res)=>{
  try{
    // validate the token
    //token add kar dunga radis ke blocklist
    //cookies ko add kar dena

    const token=req.token || req.cookies?.token;
    const payload=jwt.decode(token);
    if (!token || !payload?.exp) {
      return res.status(400).json({ message: "Invalid token" });
    }
    await redisClient.set(`token:${token}`,'Blocked');
    await redisClient.expireAt(`token:${token}`,payload.exp)
    res.clearCookie("token");
    res.send("Logged Out successfully");

  }
  catch(err){
    res.status(401).send("Error: "+err);
  }
}

const adminRegister=async (req,res)=>{
  try{
    //validator
    validate(req.body)

    const {firstName,emailID, password}=req.body;
    req.body.password= await bcrypt.hash(password,10);
    req.body.role='admin'

    const user =await User.create(req.body)

    const token=jwt.sign({_id:user._id,emailID:emailID,role:user.role},process.env.JWT_SECRET,{expiresIn:3600})
    res.cookie('token',token,{maxAge:60*60*1000});

    res.status(201).send("user register successfully")

  }
  catch(err){
    res.status(400).send("Error "+err);
  }
}

const deleteProfile=async (req,res)=>{
  try{
    const userId=req.result._id
    await User.findByIdAndDelete(userId)
    await Submission.deleteMany({userId})
    //submission wale se bhi delete krna padega

    res.status(200).send("Deleted successfully")

  }
  catch(err){
    res.status(500).send("Internal Server Error")
  }
}

module.exports={register,login,logout,adminRegister,deleteProfile};