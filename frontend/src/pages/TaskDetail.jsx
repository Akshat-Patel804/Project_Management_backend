import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { tasksApi } from "../api/tasks";
import { projectsApi } from "../api/projects";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { can, STATUS_LABELS, TASK_STATUS } from "../constants";
import Alert from "../components/Alert";
import { TaskFormModal } from "./ProjectDetail";

const formatSize = (bytes = 0) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`);

export default function TaskDetail() {
  const { projectId, taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");

  const load = useCallback(async () => {
    try {
      setTask(await tasksApi.get(projectId, taskId));
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [projectId, taskId]);

  useEffect(() => {
    load();
    projectsApi
      .members(projectId)
      .then((list) => {
        setMembers(list || []);
        const mine = (list || []).find((m) => (Array.isArray(m.user) ? m.user[0] : m.user)?._id === user?._id);
        if (mine) setRole(mine.role);
      })
      .catch(() => {});
  }, [load, projectId, user?._id]);

  const perms = can(role);

  const run = async (fn) => {
    setError("");
    try {
      await fn();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const deleteTask = async () => {
    if (!confirm("Delete this task?")) return;
    try {
      await tasksApi.remove(projectId, taskId);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const subtasks = task?.subtasks || [];
  const doneCount = subtasks.filter((s) => s.isCompleted).length;

  return (
    <>
      <Link to={`/projects/${projectId}`} className="small muted">
        ← Back to project
      </Link>
      <Alert>{error}</Alert>
      {!task ? (
        !error && <p className="muted">Loading task…</p>
      ) : (
        <div className="grid-main">
          <section className="card">
            <div className="row between">
              <h1>{task.title}</h1>
              {perms.manageTasks && (
                <div className="row">
                  <button className="btn ghost" onClick={() => setEditing(true)}>
                    Edit
                  </button>
                  <button className="btn danger" onClick={deleteTask}>
                    Delete
                  </button>
                </div>
              )}
            </div>
            <p className="pre">{task.description || <span className="muted">No description</span>}</p>

            <h3>
              Subtasks <span className="muted small">{subtasks.length ? `${doneCount}/${subtasks.length} done` : ""}</span>
            </h3>
            {subtasks.length > 0 && (
              <div className="progress">
                <div style={{ width: `${(doneCount / subtasks.length) * 100}%` }} />
              </div>
            )}
            <ul className="list">
              {subtasks.map((s) => (
                <li key={s._id} className="row between">
                  <label className="row check">
                    <input
                      type="checkbox"
                      checked={!!s.isCompleted}
                      disabled={!perms.toggleSubtasks}
                      onChange={(e) => run(() => tasksApi.updateSubtask(projectId, s._id, { isCompleted: e.target.checked }))}
                    />
                    <span className={s.isCompleted ? "strike" : ""}>{s.title}</span>
                  </label>
                  {perms.manageSubtasks && (
                    <button
                      className="link danger"
                      onClick={() => confirm("Delete subtask?") && run(() => tasksApi.removeSubtask(projectId, s._id))}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
              {subtasks.length === 0 && <li className="muted">No subtasks.</li>}
            </ul>
            {perms.manageSubtasks && (
              <form
                className="row"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(async () => {
                    await tasksApi.createSubtask(projectId, taskId, { title: newSubtask });
                    setNewSubtask("");
                  });
                }}
              >
                <input required placeholder="Add a subtask…" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} />
                <button className="btn primary">Add</button>
              </form>
            )}
          </section>

          <aside className="card side">
            <div>
              <div className="label">Status</div>
              {perms.manageTasks ? (
                <select value={task.status} onChange={(e) => run(() => tasksApi.update(projectId, taskId, { status: e.target.value }))}>
                  {Object.values(TASK_STATUS).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`badge ${task.status}`}>{STATUS_LABELS[task.status]}</span>
              )}
            </div>
            <div>
              <div className="label">Assignee</div>
              {task.assignedTo ? (
                <div className="row">
                  <img className="avatar" src={task.assignedTo.avatar?.url || "https://placehold.co/200x200"} alt="" />
                  <span>{task.assignedTo.fullname || task.assignedTo.username}</span>
                </div>
              ) : (
                <span className="muted">Unassigned</span>
              )}
            </div>
            {task.createdAt && (
              <div>
                <div className="label">Created</div>
                {new Date(task.createdAt).toLocaleString()}
              </div>
            )}
            <div>
              <div className="label">Attachments</div>
              {task.attachments?.length ? (
                <ul className="list compact">
                  {task.attachments.map((a, i) => (
                    <li key={a._id || i}>
                      <a href={a.url} target="_blank" rel="noreferrer">
                        📎 {decodeURIComponent(a.url.split("/").pop())}
                      </a>{" "}
                      <span className="muted small">{formatSize(a.size)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="muted">None</span>
              )}
            </div>
          </aside>
        </div>
      )}
      {editing && (
        <TaskFormModal
          projectId={projectId}
          task={task}
          members={members}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            load();
          }}
        />
      )}
    </>
  );
}
