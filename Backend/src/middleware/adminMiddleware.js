
const jwt=require('jsonwebtoken');
const User = require('../modules/user');
const redisClient=require('../config/redis')

const adminMiddleware=async (req,res,next)=>{
  try{
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const cookieToken = req.cookies?.token;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : cookieToken;
    if(!token){
      throw new Error("Invalid Token");
    }
    const payload= jwt.verify(token,process.env.JWT_SECRET)
    const {_id}=payload;
    if(!_id){
      throw new Error("Invalid token");
    }

    const result=await User.findById(_id);
    if(!result){
      return res.status(401).json({ message: "User doesn't exist" });
    }

    if(payload.role !== 'admin' || result.role !== 'admin'){
      return res.status(403).json({ message: "Admin access is required" });
    }
    //redis ke blocklist me present to nnhi hia
    const IsBlocked=await redisClient.exists(`token:${token}`)
    if(IsBlocked){
      throw new Error("Invalid token")
    }
    req.result=result;
    req.token=token;
    next()
  }
  catch(err){
    const isAuthError = err.name === 'JsonWebTokenError' ||
      err.name === 'TokenExpiredError' ||
      err.message === 'Invalid Token' ||
      err.message === 'Invalid token';
    res.status(isAuthError ? 401 : 500).json({ message: err.message || 'Authentication failed' });
  }
}

module.exports=adminMiddleware