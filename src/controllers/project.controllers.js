import {User} from "../models/user.models.js";
import {Project} from "../models/project.models.js";
import {PrjectMember} from "../models/projectmember.models.js";
import {ApiResponse} from "../utils/api-response.js";
import {ApiError} from '../utils/api-error.js';
import {asyncHandler} from "../utils/async-handler.js"
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constanse.js";

const getProjects = asyncHandler(async(req,res)=>{
    // Test
})

const getProjectByID = asyncHandler(async(req,res)=>{
    // Test
})

const createProject = asyncHandler(async(req,res)=>{
    const {name, description} = req.body

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    });

    await PrjectMember.create(
        {
            user: new mongoose.Types.ObjectId(req.user._id),
            project: new mongoose.Types.ObjectId(project._id),
            role: UserRolesEnum.ADMIN
        }
    )

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                project,
                "Project created Successfully"
            )
        )

});

const updateProject = asyncHandler(async(req,res)=>{
    const {name, description} = req.body
    const {projectId} = req.params

        const project = await Project.findByIdAndUpdate(
            projectId,
            {
                name,
                description
            },
            {new:true}
        )

        if(!projectId){
            throw new ApiError(404,"project not found");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    project,
                    "project updated successfully"
                )
            )
})

const deleteProject = asyncHandler(async(req,res)=>{
    const {projectId} = req.params

    const project = await Project.findByIdAndDelete(projectId)

    if(!project){
            throw new ApiError(404,"project not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, project,"project deletec successfully"))

})

const addMemberToProject = asyncHandler(async(req,res)=>{
    // Test
})

const getProjectMembers = asyncHandler(async(req,res)=>{
    // Test
})

const updateMemberRole = asyncHandler(async(req,res)=>{
    // Test
})

const deleteMember = asyncHandler(async(req,res)=>{
    // Test
})

export {
    addMemberToProject,
    createProject,
    deleteMember,
    getProjects,
    getProjectByID,
    getProjectMembers,
    updateMemberRole,
    deleteProject,
    updateProject
}