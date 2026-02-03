import {User} from "../models/user.models.js";
import {Prject} from "../models/project.models.js";
import {PrjectMember} from "../models/projectmember.models.js";
import {ApiResponse} from "../utils/api-response.js";
import {ApiError} from '../utils/api-error.js';
import {asyncHandler} from "../utils/async-handler.js"

const getProjects = asyncHandler(async(req,res)=>{
    // Test
})

const getProjectByID = asyncHandler(async(req,res)=>{
    // Test
})

const createProject = asyncHandler(async(req,res)=>{
    // Test
})

const updateProject = asyncHandler(async(req,res)=>{
    // Test
})

const deleteProject = asyncHandler(async(req,res)=>{
    // Test
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