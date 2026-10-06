import api, { unwrap } from "./client";

export const notesApi = {
  list: (projectId) => api.get(`/notes/${projectId}`).then(unwrap),
  create: (projectId, payload) => api.post(`/notes/${projectId}`, payload).then(unwrap),
  get: (projectId, noteId) => api.get(`/notes/${projectId}/n/${noteId}`).then(unwrap),
  update: (projectId, noteId, payload) => api.put(`/notes/${projectId}/n/${noteId}`, payload).then(unwrap),
  remove: (projectId, noteId) => api.delete(`/notes/${projectId}/n/${noteId}`).then(unwrap),
};
