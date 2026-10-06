import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { projectsApi } from "../api/projects";
import { tasksApi } from "../api/tasks";
import { notesApi } from "../api/notes";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { can, ROLE_LABELS, ROLES, STATUS_LABELS, TASK_STATUS } from "../constants";
import Alert from "../components/Alert";
import Modal from "../components/Modal";
import { ProjectFormModal } from "./Dashboard";

const memberUser = (m) => (Array.isArray(m.user) ? m.user[0] : m.user) || {};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("tasks");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      const list = (await projectsApi.members(projectId)) || [];
      setMembers(list);
      const mine = list.find((m) => memberUser(m)._id === user?._id);
      if (mine) setRole(mine.role);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [projectId, user?._id]);

  useEffect(() => {
    projectsApi
      .get(projectId)
      .then(setProject)
      .catch((err) => setError(getErrorMessage(err)));
    loadMembers();
    // Fallback: role from the project list
    projectsApi
      .list()
      .then((list) => {
        const item = (list || []).find((i) => (i.project ?? i)._id === projectId);
        if (item?.role) setRole((r) => r ?? item.role);
      })
      .catch(() => {});
  }, [projectId, loadMembers]);

  const perms = can(role);

  const removeProject = async () => {
    if (!confirm(`Delete project "${project?.name}"? This cannot be undone.`)) return;
    try {
      await projectsApi.remove(projectId);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <Link to="/" className="small muted">
        ← All projects
      </Link>
      <div className="page-head">
        <div>
          <h1>
            {project?.name || "Project"}{" "}
            {role && <span className={`badge role-${role}`}>{ROLE_LABELS[role]}</span>}
          </h1>
          <p className="muted">{project?.description}</p>
        </div>
        {perms.manageProject && (
          <div className="row">
            <button className="btn ghost" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn danger" onClick={removeProject}>
              Delete
            </button>
          </div>
        )}
      </div>
      <Alert>{error}</Alert>

      <div className="tabs">
        {["tasks", "members", "notes"].map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
            {t === "members" && ` (${members.length})`}
          </button>
        ))}
      </div>

      {tab === "tasks" && <TasksBoard projectId={projectId} perms={perms} members={members} />}
      {tab === "members" && (
        <MembersPanel projectId={projectId} perms={perms} members={members} reload={loadMembers} currentUserId={user?._id} />
      )}
      {tab === "notes" && <NotesPanel projectId={projectId} perms={perms} />}

      {editing && (
        <ProjectFormModal
          project={project}
          onClose={() => setEditing(false)}
          onSaved={(p) => {
            setEditing(false);
            if (p) setProject(p);
          }}
        />
      )}
    </>
  );
}

/* ---------------- Tasks ---------------- */

function TasksBoard({ projectId, perms, members }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTasks((await tasksApi.list(projectId)) || []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo(
    () => Object.values(TASK_STATUS).map((s) => ({ status: s, tasks: tasks.filter((t) => (t.status || "todo") === s) })),
    [tasks],
  );

  const moveTask = async (task, status) => {
    const prev = tasks;
    setTasks(tasks.map((t) => (t._id === task._id ? { ...t, status } : t)));
    try {
      await tasksApi.update(projectId, task._id, { status });
    } catch (err) {
      setTasks(prev);
      setError(getErrorMessage(err));
    }
  };

  return (
    <section>
      <div className="row between section-head">
        <h2>Tasks</h2>
        {perms.manageTasks && (
          <button className="btn primary" onClick={() => setShowCreate(true)}>
            + New task
          </button>
        )}
      </div>
      <Alert>{error}</Alert>
      {loading ? (
        <p className="muted">Loading tasks…</p>
      ) : (
        <div className="board">
          {columns.map((col) => (
            <div
              key={col.status}
              className="column"
              onDragOver={(e) => perms.manageTasks && e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/plain");
                const task = tasks.find((t) => t._id === id);
                if (task && task.status !== col.status) moveTask(task, col.status);
              }}
            >
              <div className="column-head">
                <span className={`dot ${col.status}`} /> {STATUS_LABELS[col.status]}
                <span className="muted"> {col.tasks.length}</span>
              </div>
              {col.tasks.map((t) => (
                <Link
                  key={t._id}
                  to={`/projects/${projectId}/tasks/${t._id}`}
                  className="task-card"
                  draggable={perms.manageTasks}
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", t._id)}
                >
                  <div className="strong">{t.title}</div>
                  {t.description && <div className="muted small clamp">{t.description}</div>}
                  <div className="row between small muted">
                    <span>{t.assignedTo ? `👤 ${t.assignedTo.username || "assigned"}` : "Unassigned"}</span>
                    {t.attachments?.length > 0 && <span>📎 {t.attachments.length}</span>}
                  </div>
                </Link>
              ))}
              {col.tasks.length === 0 && <div className="muted small empty-col">No tasks</div>}
            </div>
          ))}
        </div>
      )}
      {showCreate && (
        <TaskFormModal
          projectId={projectId}
          members={members}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </section>
  );
}

export function TaskFormModal({ projectId, task, members, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || TASK_STATUS.TODO,
    assignedTo: task?.assignedTo?._id || task?.assignedTo || "",
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, assignedTo: form.assignedTo || undefined };
      const saved = task
        ? await tasksApi.update(projectId, task._id, payload)
        : await tasksApi.create(projectId, payload, files);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={task ? "Edit task" : "New task"} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <Alert>{error}</Alert>
        <label>
          Title
          <input required autoFocus value={form.title} onChange={set("title")} />
        </label>
        <label>
          Description
          <textarea rows={4} value={form.description} onChange={set("description")} />
        </label>
        <div className="grid-2">
          <label>
            Status
            <select value={form.status} onChange={set("status")}>
              {Object.values(TASK_STATUS).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Assignee
            <select value={form.assignedTo} onChange={set("assignedTo")}>
              <option value="">Unassigned</option>
              {members.map((m) => {
                const u = memberUser(m);
                return (
                  <option key={u._id} value={u._id}>
                    {u.fullname || u.username}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
        {!task && (
          <label>
            Attachments <span className="muted">(max 1 MB each)</span>
            <input type="file" multiple onChange={(e) => setFiles([...e.target.files])} />
          </label>
        )}
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Members ---------------- */

function MembersPanel({ projectId, perms, members, reload, currentUserId }) {
  const [form, setForm] = useState({ email: "", role: ROLES.MEMBER });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const run = async (fn, okMsg) => {
    setError("");
    setInfo("");
    try {
      await fn();
      if (okMsg) setInfo(okMsg);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const add = (e) => {
    e.preventDefault();
    run(async () => {
      await projectsApi.addMember(projectId, form);
      setForm({ email: "", role: ROLES.MEMBER });
    }, "Member added");
  };

  return (
    <section className="card">
      <h2>Team members</h2>
      <Alert>{error}</Alert>
      <Alert type="success">{info}</Alert>
      {perms.manageMembers && (
        <form className="row wrap add-member" onSubmit={add}>
          <input
            type="email"
            required
            placeholder="teammate@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {Object.values(ROLES).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <button className="btn primary">Add member</button>
        </form>
      )}
      <ul className="list">
        {members.map((m) => {
          const u = memberUser(m);
          const isMe = u._id === currentUserId;
          return (
            <li key={u._id} className="row between">
              <div className="row">
                <img className="avatar" src={u.avatar?.url || "https://placehold.co/200x200"} alt="" />
                <div>
                  <div className="strong">
                    {u.fullname || u.username} {isMe && <span className="muted">(you)</span>}
                  </div>
                  <div className="muted small">@{u.username}</div>
                </div>
              </div>
              {perms.manageMembers && !isMe ? (
                <div className="row">
                  <select
                    value={m.role}
                    onChange={(e) => run(() => projectsApi.updateMemberRole(projectId, u._id, e.target.value), "Role updated")}
                  >
                    {Object.values(ROLES).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn danger ghost"
                    onClick={() =>
                      confirm(`Remove ${u.username} from this project?`) &&
                      run(() => projectsApi.removeMember(projectId, u._id), "Member removed")
                    }
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className={`badge role-${m.role}`}>{ROLE_LABELS[m.role]}</span>
              )}
            </li>
          );
        })}
        {members.length === 0 && <li className="muted">No members found.</li>}
      </ul>
    </section>
  );
}

/* ---------------- Notes ---------------- */

function NotesPanel({ projectId, perms }) {
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setNotes((await notesApi.list(projectId)) || []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn) => {
    setError("");
    try {
      await fn();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section>
      <h2 className="section-head">Notes</h2>
      <Alert>{error}</Alert>
      {perms.manageNotes && (
        <form
          className="card form"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await notesApi.create(projectId, { content: draft });
              setDraft("");
            });
          }}
        >
          <textarea rows={3} required placeholder="Write a note…" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="row end">
            <button className="btn primary">Add note</button>
          </div>
        </form>
      )}
      {loading ? (
        <p className="muted">Loading notes…</p>
      ) : (
        <div className="notes">
          {notes.map((n) => (
            <article key={n._id} className="card note">
              {editing?._id === n._id ? (
                <form
                  className="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(async () => {
                      await notesApi.update(projectId, n._id, { content: editing.content });
                      setEditing(null);
                    });
                  }}
                >
                  <textarea rows={4} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
                  <div className="row end">
                    <button type="button" className="btn ghost" onClick={() => setEditing(null)}>
                      Cancel
                    </button>
                    <button className="btn primary">Save</button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="pre">{n.content}</p>
                  <div className="row between small muted">
                    <span>
                      {n.createdBy?.username && `@${n.createdBy.username} · `}
                      {n.createdAt && new Date(n.createdAt).toLocaleString()}
                    </span>
                    {perms.manageNotes && (
                      <span className="row">
                        <button className="link" onClick={() => setEditing({ _id: n._id, content: n.content })}>
                          Edit
                        </button>
                        <button
                          className="link danger"
                          onClick={() => confirm("Delete this note?") && run(() => notesApi.remove(projectId, n._id))}
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </div>
                </>
              )}
            </article>
          ))}
          {notes.length === 0 && <p className="muted">No notes yet.</p>}
        </div>
      )}
    </section>
  );
}
