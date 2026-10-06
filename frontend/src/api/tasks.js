import api, { unwrap } from "./client";

const toFormData = (payload, files = []) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") fd.append(k, v);
  });
  files.forEach((f) => fd.append("attachments", f));
  return fd;
};

export const tasksApi = {
  list: (projectId) => api.get(`/tasks/${projectId}`).then(unwrap),
  create: (projectId, payload, files = []) =>
    files.length
      ? api.post(`/tasks/${projectId}`, toFormData(payload, files)).then(unwrap)
      : api.post(`/tasks/${projectId}`, payload).then(unwrap),
  get: (projectId, taskId) => api.get(`/tasks/${projectId}/t/${taskId}`).then(unwrap),
  update: (projectId, taskId, payload) => api.put(`/tasks/${projectId}/t/${taskId}`, payload).then(unwrap),
  remove: (projectId, taskId) => api.delete(`/tasks/${projectId}/t/${taskId}`).then(unwrap),

  createSubtask: (projectId, taskId, payload) =>
    api.post(`/tasks/${projectId}/t/${taskId}/subtasks`, payload).then(unwrap),
  updateSubtask: (projectId, subTaskId, payload) => api.put(`/tasks/${projectId}/st/${subTaskId}`, payload).then(unwrap),
  removeSubtask: (projectId, subTaskId) => api.delete(`/tasks/${projectId}/st/${subTaskId}`).then(unwrap),
};
