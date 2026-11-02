const express=require('express');
const authRouter=express.Router();
const {register,login,logout,adminRegister,deleteProfile}=require('../Controllers/userAuthent')
const userMiddleware=require("../middleware/userMiddleware")
const adminMiddleware=require("../middleware/adminMiddleware")


//Register
authRouter.post('/register', register)

//login
authRouter.post('/login',login)
//logout
authRouter.post('/logout',userMiddleware,logout)
//GetProfile
// authRouter.get('getProfile',getProfile)
authRouter.post('/admin/register',adminMiddleware,adminRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile)
authRouter.get('/check',userMiddleware,(req,res)=>{
  const reply={
    firstName:req.result.firstName,
    emailID:req.result.emailID,
    _id:req.result._id,
    role:req.result.role
  }

  res.status(200).json({
    user:reply,
    message:"Valid user"
  })
});

module.exports=authRouter