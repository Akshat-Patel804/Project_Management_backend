import api, { unwrap } from "./client";

export const projectsApi = {
  list: () => api.get("/projects").then(unwrap),
  create: (payload) => api.post("/projects", payload).then(unwrap),
  get: (projectId) => api.get(`/projects/${projectId}`).then(unwrap),
  update: (projectId, payload) => api.put(`/projects/${projectId}`, payload).then(unwrap),
  remove: (projectId) => api.delete(`/projects/${projectId}`).then(unwrap),

  members: (projectId) => api.get(`/projects/${projectId}/members`).then(unwrap),
  addMember: (projectId, payload) => api.post(`/projects/${projectId}/members`, payload).then(unwrap),
  updateMemberRole: (projectId, userId, newRole) =>
    api.put(`/projects/${projectId}/members/${userId}`, { newRole }).then(unwrap),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`).then(unwrap),
};
