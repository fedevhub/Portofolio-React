import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import supabase from "../assets/supabase-client";
import "../styles/Project.css";

const FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Web Development", value: "web" },
  { label: "UI/UX Design", value: "ui" },
  { label: "Mobile App", value: "mobile" },
];

const EMPTY_FORM = {
  nama: "",
  deskripsi: "",
  toolsInput: "",
  category: "web",
  file: null,
  status: false,
};

function getIsAdmin() {
  // Nanti tinggal ganti jadi user?.role === "admin".
  return true;
}

function parseTools(value) {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getProjectTools(project) {
  const rawTools = project.tools ?? project.fitur ?? [];

  if (Array.isArray(rawTools)) {
    return rawTools.filter(Boolean);
  }

  if (typeof rawTools === "string") {
    return parseTools(rawTools);
  }

  return [];
}

function normalizeProject(project) {
  return {
    ...project,
    category: project.category ?? "web",
    tools: getProjectTools(project),
  };
}

async function uploadProjectFile(file) {
  const filePath = `${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("project-files")
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("project-files").getPublicUrl(filePath);
  return data?.publicUrl ?? null;
}

async function fetchProjectsFromDb() {
  const { data, error } = await supabase.from("Project").select("*").order("id", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(normalizeProject);
}

async function fetchProjectById(projectId) {
  const { data, error } = await supabase
    .from("Project")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    throw error;
  }

  return normalizeProject(data);
}

function buildPayload(formData, existingFileUrl = null) {
  return {
    nama: formData.nama,
    deskripsi: formData.deskripsi,
    file: existingFileUrl,
    fitur: parseTools(formData.toolsInput),
    status: formData.status,
  };
}

function ProjectForm({
  formData,
  onChange,
  onSubmit,
  saving,
  submitLabel,
  submitHint,
}) {
  return (
    <form className="project-form" onSubmit={onSubmit}>
      <div className="project-form-grid">
        <label className="project-field">
          <span>Nama Project</span>
          <input
            type="text"
            value={formData.nama}
            onChange={(event) => onChange("nama", event.target.value)}
            placeholder="Contoh: Portfolio React"
            required
          />
        </label>

        <label className="project-field">
          <span>Kategori</span>
          <select
            value={formData.category}
            onChange={(event) => onChange("category", event.target.value)}
          >
            {FILTERS.filter((filter) => filter.value !== "all").map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </label>

        <label className="project-field project-field-full">
          <span>Deskripsi</span>
          <textarea
            rows="5"
            value={formData.deskripsi}
            onChange={(event) => onChange("deskripsi", event.target.value)}
            placeholder="Ceritakan singkat project ini"
            required
          />
        </label>

        <label className="project-field project-field-full">
          <span>Tools</span>
          <input
            type="text"
            value={formData.toolsInput}
            onChange={(event) => onChange("toolsInput", event.target.value)}
            placeholder="React, Bootstrap, Supabase"
          />
          <small className="project-helper">Pisahkan dengan koma kalau tools-nya lebih dari satu.</small>
        </label>

        <label className="project-field">
          <span>Thumbnail</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => onChange("file", event.target.files?.[0] ?? null)}
          />
        </label>

        <label className="project-field project-checkbox">
          <input
            type="checkbox"
            checked={formData.status}
            onChange={(event) => onChange("status", event.target.checked)}
          />
          <span>Project selesai</span>
        </label>
      </div>

      <div className="project-form-actions">
        <Link to="/#project" className="btn btn-outline-modern">
          Kembali
        </Link>
        <button type="submit" className="btn btn-primary-modern" disabled={saving}>
          {saving ? "Menyimpan..." : submitLabel}
        </button>
      </div>

      {submitHint && <p className="project-form-title">{submitHint}</p>}
    </form>
  );
}

function ProjectDetailModal({ project, isAdmin, onClose }) {
  if (!project) {
    return null;
  }

  return (
    <div className="project-modal-backdrop" onClick={onClose}>
      <div className="project-modal-card project-detail-modal" onClick={(event) => event.stopPropagation()}>
        <div className="project-modal-header">
          <div>
            <h3>{project.nama}</h3>
            <p>Detail singkat project yang dipilih.</p>
          </div>

          <button type="button" className="project-close-btn" onClick={onClose}>
            x
          </button>
        </div>

        <div className="project-modal-body">
          <div className="project-detail-gallery">
            {project.file ? (
              <img src={project.file} alt={project.nama} className="project-detail-image" />
            ) : (
              <div className="project-placeholder project-detail-placeholder">No Image</div>
            )}
          </div>

          <div className="project-detail-grid">
            <div className="project-detail-content">
              <h5>Ringkasan</h5>
              <p className="project-detail-text">{project.deskripsi}</p>

              <h5>Tools</h5>
              <div className="card-tags modal-tags">
                {getProjectTools(project).map((tool, index) => (
                  <span key={`${project.id}-detail-${tool}-${index}`} className="card-tag">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="project-detail-side">
              <h6>Info Proyek</h6>
              <ul className="project-detail-list">
                <li>
                  <strong>Kategori:</strong> {project.category ?? "web"}
                </li>
                <li>
                  <strong>Status:</strong> {project.status ? "Completed" : "On Progress"}
                </li>
                <li>
                  <strong>Jumlah Tools:</strong> {getProjectTools(project).length}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="project-modal-footer">
          <div className="project-action-group">
            {isAdmin && (
              <Link to={`/project/edit/${project.id}`} className="btn btn-outline-modern project-edit-btn">
                Edit Project
              </Link>
            )}
            <button type="button" className="btn btn-primary-modern project-detail-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectEditorPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = mode === "edit";
  const isAdmin = getIsAdmin();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    let active = true;

    async function loadProject() {
      try {
        const project = await fetchProjectById(id);

        if (!active) {
          return;
        }

        setCurrentProject(project);
        setFormData({
          nama: project.nama ?? "",
          deskripsi: project.deskripsi ?? "",
          toolsInput: getProjectTools(project).join(", "),
          category: project.category ?? "web",
          file: null,
          status: Boolean(project.status),
        });
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      active = false;
    };
  }, [id, isEditMode]);

  function updateForm(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      let fileUrl = currentProject?.file ?? null;

      if (formData.file) {
        fileUrl = await uploadProjectFile(formData.file);
      }

      const payload = buildPayload(formData, fileUrl);

      if (isEditMode && currentProject) {
        const { error } = await supabase.from("Project").update(payload).eq("id", currentProject.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("Project").insert([payload]);

        if (error) {
          throw error;
        }
      }

      navigate("/");
      setTimeout(() => {
        document.getElementById("project")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!currentProject) {
      return;
    }

    const confirmed = window.confirm("Hapus project ini?");

    if (!confirmed) {
      return;
    }

    const { error } = await supabase.from("Project").delete().eq("id", currentProject.id);

    if (error) {
      console.error("Error deleting project:", error);
      return;
    }

    navigate("/");
    setTimeout(() => {
      document.getElementById("project")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  if (!isAdmin) {
    return (
      <section className="portfolio-section">
        <div className="container">
          <div className="project-admin-panel">
            <div className="project-admin-header">
              <h3>Akses Ditolak</h3>
              <p>Halaman ini hanya untuk admin.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="portfolio-section project-page-shell">
      <div className="container">
        <div className="project-admin-panel">
          <div className="project-admin-header">
            <div>
              <p className="project-page-kicker">Admin Project</p>
              <h3>{isEditMode ? "Edit Project" : "Tambah Project"}</h3>
              <p>
                {isEditMode
                  ? "Edit project di halaman khusus biar lebih lega."
                  : "Tambah project baru lewat halaman khusus admin."}
              </p>
            </div>

            {isEditMode && currentProject && (
              <button type="button" className="btn project-danger-btn" onClick={handleDelete}>
                Hapus Project
              </button>
            )}
          </div>

          {loading ? (
            <p className="project-empty">Memuat data project...</p>
          ) : (
            <ProjectForm
              formData={formData}
              onChange={updateForm}
              onSubmit={handleSubmit}
              saving={saving}
              submitLabel={isEditMode ? "Simpan Perubahan" : "Tambah Project"}
              submitHint={isEditMode ? `Sedang mengedit: ${currentProject?.nama ?? "-"}` : "Form ini akan menambahkan project baru."}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default function Project() {
  const isAdmin = getIsAdmin();
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const data = await fetchProjectsFromDb();

        if (active) {
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") {
      return projects;
    }

    return projects.filter((project) => (project.category ?? "web") === activeFilter);
  }, [activeFilter, projects]);

  return (
    <>
      <section id="project" className="portfolio-section">
        <div className="container">
          <div className="section-title animate-fade-in-up">
            <h2 className="highlight">Project</h2>
            <p className="highlight-text mt-3">Koleksi project terbaik yang telah saya kerjakan</p>
          </div>

          {isAdmin && (
            <div className="project-top-actions">
              <Link to="/project/add" className="btn btn-primary-modern">
                Tambah Project
              </Link>
            </div>
          )}

          <div className="card-filter animate-fade-in-up">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`filter-btn ${activeFilter === filter.value ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="project-empty">Project sedang dimuat...</p>
          ) : filteredProjects.length === 0 ? (
            <p className="project-empty">Belum ada project di kategori ini.</p>
          ) : (
            <div className="card-container mt-5">
              {filteredProjects.map((project) => (
                <article key={project.id} className="card project-card">
                  <div className="img-wrapper">
                    {project.file ? (
                      <img src={project.file} alt={project.nama} className="project-image" />
                    ) : (
                      <div className="project-placeholder">No Image</div>
                    )}
                  </div>

                  <div className="card-body">
                    <h5 className="card-title">{project.nama}</h5>
                    <p className="card-text">{project.deskripsi}</p>

                    <div className="card-tags">
                      {getProjectTools(project).map((tool, index) => (
                        <span key={`${project.id}-${tool}-${index}`} className="card-tag">
                          {tool}
                        </span>
                      ))}
                    </div>

                    <div className="project-card-footer">
                      <span className={`project-status ${project.status ? "done" : "progress"}`}>
                        {project.status ? "Completed" : "On Progress"}
                      </span>

                      <div className="project-action-group">
                        <button
                          type="button"
                          className="btn btn-primary-modern project-detail-btn"
                          onClick={() => setSelectedProject(project)}
                        >
                          Detail
                        </button>

                        {isAdmin && (
                          <Link to={`/project/edit/${project.id}`} className="btn btn-outline-modern project-edit-btn">
                            Edit
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <ProjectDetailModal
        project={selectedProject}
        isAdmin={isAdmin}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}

export function AddProjectPage() {
  return <ProjectEditorPage mode="add" />;
}

export function EditProjectPage() {
  return <ProjectEditorPage mode="edit" />;
}
