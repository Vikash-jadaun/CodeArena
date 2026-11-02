
const validator=require('validator')

const validate=(data)=>{
  const mandatoryField=['firstName','emailID','password']
  const IsAllowed=mandatoryField.every((k)=> Object.keys(data).includes(k))
  if(!IsAllowed){
    throw new Error("Some Field Misssing")
  }
  if(!validator.isEmail(data.emailID)){
    throw new Error("EmailID Invalid")
  }
  if(!validator.isStrongPassword(data.password)){
    throw new Error("Weak Password")
  }
}

module.exports=validate;