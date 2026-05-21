import { Router } from "express";
import { addMemberToProject, createProject, deleteMember, getProjects, getProjectByID, getProjectMembers, updateMemberRole, deleteProject, updateProject } from "../controllers/project.controllers.js"
import { validate } from "../middlewares/validator.middlewares.js";
import { createProjectValidator,addMembertoProjectValidator } from "../validators/index.js";
import {verifyJWT,validateProjectPermission} from "../middlewares/auth.middlewares.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constanse.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/")
    .get(getProjects)
    .post(createProjectValidator(),validate,createProject)

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole),getProjectByID)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]),createProjectValidator(),validate(),updateProject)
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        deleteProject
    )

router
    .route("/:projectId/members")
    .get(getProjectMembers)
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN]),
        addMembertoProjectValidator(),
        validate(),
        addMemberToProject
    )

    
router
    .route("/:projectId/members/:userId")
    .put(validateProjectPermission([UserRolesEnum.ADMIN ]),updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteMember)

export default router;