const express=require('express');
const problemRouter=express.Router();
const adminMiddleware=require('../middleware/adminMiddleware')
const userMiddleware=require('../middleware/userMiddleware')
const {
    cacheProblemList,
    cacheProblemDetails,
    invalidateProblemCache
}=require('../middleware/cacheMiddleware')
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem}=require('../Controllers/userProblem')


problemRouter.post("/create",adminMiddleware,invalidateProblemCache(),createProblem)
problemRouter.put("/update/:id",adminMiddleware,invalidateProblemCache(true),updateProblem)
problemRouter.delete("/delete/:id",adminMiddleware,invalidateProblemCache(true),deleteProblem)

problemRouter.get("/problemById/:id",userMiddleware,cacheProblemDetails,getProblemById)
problemRouter.get("/getAllProblem",userMiddleware,cacheProblemList,getAllProblem)
problemRouter.get("/problemSolvedByUser",userMiddleware, solvedAllProblemByUser)
problemRouter.get("/submittedProblem/:id",userMiddleware,submittedProblem)

module.exports=problemRouter

//create
//fetch
//update
//delete