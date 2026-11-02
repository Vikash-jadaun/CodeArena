const mongoose=require('mongoose');
const {Schema}=mongoose



const userSchema=new Schema({
  firstName:{
    type:String,
    minLength:3,
    maxLength:20
  },
  lastName:{
    type:String,
    minLength:3,
    maxLength:20
  },
  emailID:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true,
    immutable:true
  },
  type:{
    type:Number,
    minLength:6,
    maxLength:20
  },
  role:{
    type:String,
    enum:['user','admin'],
    default:'user'
  },
  problemSolved:{
    type:[{
      type:Schema.Types.ObjectId,
      ref:'problem'
    }],
    unique:true,
    required:true
  },
  password: {
    type: String,
    required: true
  }

},{timeStamp:true})

const User=mongoose.model("user",userSchema)
module.exports=User;