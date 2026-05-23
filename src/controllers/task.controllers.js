import {User} from "../models/user.models.js";
import {Subtasks} from "../models/subtask.models.js";
import {Task} from "../models/task.models.js";
import { Project } from "../models/project.models.js";
import {ApiResponse} from "../utils/api-response.js";
import {ApiError} from '../utils/api-error.js';
import {asyncHandler} from "../utils/async-handler.js"
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constanse.js";
import { pipeline } from "nodemailer/lib/xoauth2/index.js";
import { response } from "express";


const getTasks = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;
    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404,"project not found")
    }

    const tasks = await Task.find({
        project: new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo","avatar username fullname")

    return res
        .status(201)
        .json(
            new ApiResponse(201,task, "task fatched successfully")
    )
}) 

const createTask = asyncHandler(async(req,res)=>{
    const {title,description,assignedTo,status} = req.body;
    const {projectId} = req.params;
    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404,"project not found")
    }

    const files = req.files || [];

    const attachments = files.map((file)=>{
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size
        }
    })

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments
    })

    return res
        .status(201)
        .json(
            new ApiResponse(201,task, "task created successfully")
        )
})

const getTaskById = asyncHandler(async(req,res)=>{
    const {taskId} = req.params;
    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup:{
                from: "users",
                localFeild: "assignedTo",
                foreignFeild: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        _id:1,
                        username:1,
                        fullname: 1,
                        avatar:1
                    }
                ] 
            }
        },
        {
            $lookup:{
                from: "users",
                localFeild: "_id",
                foreignFeild: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localFeild: "createdBy",
                            foreignFeild: "_id",
                            as: "createdBy",
                            pipeline:[
                                {
                                    $project: {
                                        _id: 1,
                                        username:1,
                                        fullname:1,
                                        avatar:1 
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFeilds: {
                            createdBy: {
                                $arrayElemAt: ["$createdBy",0]
                            }
                        }
                    }
                ]
            }    
        },
        {
            $addFeilds:{
                assignedTo:{
                    $arrayElemAt:["$assignedTo",0]
                }
            }
        }
    ]);

    if(!task || task.length  === 0){
        throw new ApiError(404,"Task not found")
    }
    return res.status(200).json(new ApiResponse(200, task[0],"task fatched successfully"))

})

const updateTask = asyncHandler(async(req,res)=>{
    
})

const deleteTask = asyncHandler(async(req,res)=>{
    
})

const createSubTask = asyncHandler(async(req,res)=>{
    
})

const updateSubTask = asyncHandler(async(req,res)=>{
    
})

const deleteSubTask = asyncHandler(async(req,res)=>{
    
})


export {
    createSubTask,createTask,deleteSubTask,deleteTask,getTaskById,getTasks,updateSubTask,updateTask
}