import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projectsApi } from "../api/projects";
import { getErrorMessage } from "../api/client";
import { ROLE_LABELS } from "../constants";
import Alert from "../components/Alert";
import Modal from "../components/Modal";

// getProjects returns [{ project: {...}, role }]; tolerate a flat project too
const normalize = (item) => ({ ...(item.project ?? item), role: item.role });

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await projectsApi.list();
      setProjects((data || []).map(normalize));
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Projects</h1>
          <p className="muted">All projects you're a member of</p>
        </div>
        <button className="btn primary" onClick={() => setShowCreate(true)}>
          + New project
        </button>
      </div>
      <Alert>{error}</Alert>
      {loading ? (
        <p className="muted">Loading projects…</p>
      ) : projects.length === 0 ? (
        <div className="empty card">
          <p>No projects yet.</p>
          <button className="btn primary" onClick={() => setShowCreate(true)}>
            Create your first project
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <Link to={`/projects/${p._id}`} key={p._id} className="card project-card">
              <div className="row between">
                <h3>{p.name}</h3>
                {p.role && <span className={`badge role-${p.role}`}>{ROLE_LABELS[p.role]}</span>}
              </div>
              <p className="muted clamp">{p.description || "No description"}</p>
              <div className="row between small muted">
                <span>👥 {p.members ?? "—"} members</span>
                {p.createdAt && <span>{new Date(p.createdAt).toLocaleDateString()}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
      {showCreate && (
        <ProjectFormModal
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </>
  );
}

export function ProjectFormModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({ name: project?.name || "", description: project?.description || "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = project ? await projectsApi.update(project._id, form) : await projectsApi.create(form);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={project ? "Edit project" : "New project"} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <Alert>{error}</Alert>
        <label>
          Name
          <input required autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Description
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
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
