const express=require('express');
const aiRouter=express.Router();
const userMiddleware=require('../middleware/userMiddleware');
const {aiRequestRateLimit}=require('../middleware/rateLimitMiddleware');
const solveDoubt=require('../Controllers/solveDoubt')

aiRouter.post('/chat',userMiddleware,aiRequestRateLimit,solveDoubt);

module.exports=aiRouter;