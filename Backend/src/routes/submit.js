const express=require('express');
const submitRouter=express.Router();
const userMiddleware=require("../middleware/userMiddleware")
const {submitCode,runCode}=require("../Controllers/userSubmission")
const {codeSubmissionRateLimit}=require("../middleware/rateLimitMiddleware")

submitRouter.post('/submit/:id',userMiddleware,codeSubmissionRateLimit,submitCode)
submitRouter.post('/run/:id',userMiddleware,codeSubmissionRateLimit,runCode)

module.exports=submitRouter;