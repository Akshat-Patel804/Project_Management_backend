export const ROLES = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};
export const ROLE_LABELS = { admin: "Admin", project_admin: "Project Admin", member: "Member" };

export const TASK_STATUS = { TODO: "todo", IN_PROGRESS: "in_progress", DONE: "done" };
export const STATUS_LABELS = { todo: "To do", in_progress: "In progress", done: "Done" };

// Permission matrix from PRD §4.2
export const can = (role) => ({
  manageProject: role === ROLES.ADMIN,
  manageMembers: role === ROLES.ADMIN,
  manageTasks: role === ROLES.ADMIN || role === ROLES.PROJECT_ADMIN,
  manageSubtasks: role === ROLES.ADMIN || role === ROLES.PROJECT_ADMIN,
  toggleSubtasks: Boolean(role),
  manageNotes: role === ROLES.ADMIN,
});
