import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import supabase from "../assets/supabase-client";
import "../styles/Project.css";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Landing Page", value: "landing-page" },
  { label: "Web App", value: "web-app" },
  { label: "UI/UX Design", value: "ui-ux" },
];

const EMPTY_FORM = {
  nama: "",
  deskripsi: "",
  fiturInput: "",
  toolsInput: "",
  kategori: "landing-page",
  file: null,
  status: false,
  preview_url: "",
  github_url: "",
};

function getIsAdmin() {
  return true;
}

function hasLink(url) {
  if (!url) return false;
  return url.trim() !== "";
}

function parseTools(value) {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getProjectTools(project) {
  let rawTools = project.tools ?? [];

  if (typeof rawTools === "string") {
    try {
      const parsed = JSON.parse(rawTools);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return parseTools(rawTools);
    }
  }

  if (Array.isArray(rawTools)) {
    return rawTools.filter(Boolean);
  }

  return [];
}

function getFiturList(project) {
  let rawFitur = project.fitur ?? [];

  if (typeof rawFitur === "string") {
    try {
      const parsed = JSON.parse(rawFitur);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return parseTools(rawFitur);
    }
  }

  if (Array.isArray(rawFitur)) {
    return rawFitur.filter(Boolean);
  }

  return [];
}

function normalizeProject(project) {
  return {
    ...project,
    kategori: project.kategori ?? "landing-page",
    tools: getProjectTools(project),
    fitur: getFiturList(project),
    preview_url: project.preview_url ?? "",
    github_url: project.github_url ?? "",
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
    kategori: formData.kategori,
    fitur: parseTools(formData.fiturInput),
    tools: parseTools(formData.toolsInput),
    status: formData.status,
    preview_url: formData.preview_url,
    github_url: formData.github_url,
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
            value={formData.kategori}
            onChange={(event) => onChange("kategori", event.target.value)}
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
          <span>Fitur</span>
          <textarea
            rows="3"
            value={formData.fiturInput}
            onChange={(e) => onChange("fiturInput", e.target.value)}
            placeholder="Login, Dashboard, CRUD Data (pisahkan dengan koma atau enter)"
          />
        </label>

        <label className="project-field project-field-full">
          <span>Tools</span>
          <textarea
            rows="3"
            value={formData.toolsInput}
            onChange={(e) => onChange("toolsInput", e.target.value)}
            placeholder="React, Supabase, Bootstrap (pisahkan dengan koma atau enter)"
          />
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

        <label className="project-field project-field-full">
          <span>Link Preview</span>
          <input
            type="text"
            value={formData.preview_url}
            onChange={(e) => onChange("preview_url", e.target.value)}
          />
        </label>

        <label className="project-field project-field-full">
          <span>Link GitHub</span>
          <input
            type="text"
            value={formData.github_url}
            onChange={(e) => onChange("github_url", e.target.value)}
          />
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

              <h5>Fitur</h5>
              <ul className="project-feature-list">
                {getFiturList(project).map((fitur, index) => (
                  <li key={index}>{fitur}</li>
                ))}
              </ul>


              <h5>Tools</h5>
              <div className="card-tags">
                {getProjectTools(project).map((tool, index) => (
                  <span key={index} className="card-tag">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="project-detail-side">
              <h6>Info Proyek</h6>
              <ul className="project-detail-list">
                <li>
                  <strong>Kategori:</strong> {project.kategori ?? "landing-page"}
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

            <span className={`project-status ${project.status ? "done" : "progress"}`}>
              {project.status ? "Completed" : "On Progress"}
            </span>

            {hasLink(project.preview_url) && (
              <a
                href={project.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-preview"
              >
                Preview
              </a>
            )}

            {hasLink(project.github_url) && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-github"
              >
                GitHub
              </a>
            )}

            {isAdmin && (
              <Link
                to={`/project/edit/${project.id}`}
                className="btn btn-edit"
              >
                Edit
              </Link>
            )}

            <button
              type="button"
              className="btn btn-close"
              onClick={onClose}
            >
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
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
          fiturInput: getFiturList(project).join(", "),
          toolsInput: getProjectTools(project).join(", "),
          kategori: project.kategori ?? "landing-page",
          file: null,
          status: Boolean(project.status),
          preview_url: project.preview_url ?? "",
          github_url: project.github_url ?? "",
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
    const fiturList = parseTools(formData.fiturInput);

    if (fiturList.length < 3) {
      alert("Minimal fitur harus 3!");
      setSaving(false);
      return;
    }

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
              <button
                type="button"
                className="btn project-danger-btn"
                onClick={() => setDeleteTarget(currentProject)}
              >
                Delete
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") {
      return projects;
    }

    return projects.filter((project) => (project.kategori ?? "landing-page") === activeFilter);
  }, [activeFilter, projects]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / itemsPerPage)
  );

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProjects.slice(start, end);
  }, [filteredProjects, currentPage]);
  
  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  async function handleDelete(project) {
    const { error } = await supabase
      .from("Project")
      .delete()
      .eq("id", project.id);

    if (error) {
      console.error("Error deleting:", error);
      return;
    }

    navigate("/");
  }

  return (
    <>
      <DeleteConfirmModal
        project={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <section id="project" className="portfolio-section">
        <div className="container">
          <div className="section-title animate-fade-in-up">
            <h2 className="highlight">Project</h2>
            <p className="highlight-text mt-3">Koleksi project terbaik yang telah saya kerjakan</p>
          </div>

          {isAdmin && (
            <div className="project-top-actions">
              <Link to="/project/add" className="btn btn-add">
                <span className="icon-plus">
                  <i className="bi bi-plus-lg"></i>
                </span>
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
              {paginatedProjects.map((project) => (
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

                    {/* <div className="card-tags">
                      {getProjectTools(project).map((tool, index) => (
                        <span key={`${project.id}-${tool}-${index}`} className="card-tag">
                          {tool}
                        </span>
                      ))}
                    </div> */}

                    {/* ================= PROJECT CARD ================= */}
                    <div className="project-card-footer">
                      <div className={`project-action-group ${isAdmin ? "admin" : "user"}`}>

                        {/* DETAIL (SELALU ADA) */}
                        <button
                          type="button"
                          className="btn btn-detail"
                          onClick={() => setSelectedProject(project)}
                        >
                          Detail
                        </button>

                        {/* PREVIEW */}
                        {hasLink(project.preview_url) && (
                          <a
                            href={project.preview_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-preview"
                          >
                            Preview
                          </a>
                        )}

                        {/* ADMIN ONLY */}
                        {isAdmin && (
                          <>
                            <Link
                              to={`/project/edit/${project.id}`}
                              className="btn btn-edit"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              className="btn btn-delete"
                              onClick={() => setDeleteTarget(project)}
                            >
                              Delete
                            </button>
                          </>
                        )}

                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="portfolio-pagination animate-fade-in-up text-center">
          <ul className="pagination-custom">

            <li
              className={`page-item-custom ${currentPage === 1 ? "disabled" : ""}`}
              onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </li>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;

              return (
                <li
                  key={page}
                  className={`page-item-custom ${currentPage === page ? "active" : ""}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </li>
              );
            })}

            <li
              className={`page-item-custom ${currentPage === totalPages ? "disabled" : ""}`}
              onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </li>

          </ul>
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

export function DeleteProjectPage() {
  return <ProjectEditorPage mode="delete" />;
}

function DeleteConfirmModal({ project, onCancel, onConfirm }) {
  if (!project) return null;

  return (
    <div className="project-modal-backdrop" onClick={onCancel}>
      <div className="project-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal-header">
          <button
            type="button"
            className="project-close-btn btn-exit"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <div className="project-modal-body">
          <p>
            Yakin mau hapus project <strong>{project.nama}</strong>?
          </p>
        </div>

        <div className="project-modal-footer">
          <button className="btn btn-outline-modern" onClick={onCancel}>
            Batal
          </button>

          <button
            className="btn btn-delete"
            onClick={() => onConfirm(project)}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
