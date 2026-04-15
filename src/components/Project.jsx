import { useEffect, useMemo, useState } from "react";
import AOS from "aos";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import supabase from "../assets/supabase-client";
import "../styles/Project.css";
import { useAuth } from "../context/AuthContext";
import { isKnownSectionId } from "../utils/sectionNavigation";
import {
  consumeSectionTarget,
  rememberSectionTarget,
  scrollToSectionId,
} from "../utils/sectionScroll";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Landing Page", value: "landing-page" },
  { label: "Web App", value: "web-app" },
  { label: "UI/UX Design", value: "ui-ux" },
];

const STATUS_PRIORITY = {
  completed: 1,
  "in repair": 2,
  "on progress": 3,
  "on going": 4,
};

const STATUS_META = {
  completed: { text: "Completed", class: "done" },
  "in repair": { text: "In Repair", class: "repair" },
  "on progress": { text: "On Progress", class: "progress" },
  "on going": { text: "On Going", class: "ongoing" },
};

const EMPTY_FORM = {
  nama: "",
  deskripsi: "",
  fiturInput: "",
  toolsInput: "",
  kategori: "landing-page",
  file: null,
  status: "on going",
  preview_url: "",
  github_url: "",
};


function getIsAdmin(role) {
  return role === "admin";
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
    status: normalizeStatus(project.status),
  };
}

function normalizeStatus(value) {
  if (value === true || value === "true" || value === 1) {
    return "completed";
  }

  if (typeof value === "string" && STATUS_PRIORITY[value]) {
    return value;
  }

  return "on going";
}

function getProjectStatusMeta(status) {
  return STATUS_META[normalizeStatus(status)] ?? STATUS_META["on going"];
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
  const { data, error } = await supabase
    .from("Project")
    .select("*");

  if (error) {
    throw error;
  }

  const normalized = (data ?? []).map(normalizeProject);

  return normalized.sort((a, b) => {
    const statusA = STATUS_PRIORITY[a.status] ?? 99;
    const statusB = STATUS_PRIORITY[b.status] ?? 99;

    if (statusA !== statusB) {
      return statusA - statusB;
    }

    const createdAtA = Date.parse(a.created_at ?? "");
    const createdAtB = Date.parse(b.created_at ?? "");
    const hasCreatedAtA = !Number.isNaN(createdAtA);
    const hasCreatedAtB = !Number.isNaN(createdAtB);

    if (hasCreatedAtA && hasCreatedAtB && createdAtA !== createdAtB) {
      return createdAtB - createdAtA;
    }

    return Number(b.id ?? 0) - Number(a.id ?? 0);
  });
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

function navigateToProjectSection(navigate) {
  rememberSectionTarget("project");
  navigate("/admin/dashboard#project");
}

function navigateToProjectSectionPublic(navigate) {
  rememberSectionTarget("project");
  navigate("/#project");
}

function ProjectForm({ formData, onChange, onSubmit, saving, submitLabel, submitHint, existingImageUrl, onBack }) {
  const [imagePreview, setImagePreview] = useState(existingImageUrl || null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    onChange("file", file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(existingImageUrl || null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <form className="project-form" onSubmit={onSubmit}>
      <div className="project-form-grid">
        {/* Nama Project & Kategori */}
        <label className="project-field">
          <span>Nama Project</span>
          <input
            type="text"
            value={formData.nama}
            onChange={(e) => onChange("nama", e.target.value)}
            placeholder="Contoh: Portfolio React"
            required
          />
        </label>

        <label className="project-field">
          <span>Kategori</span>
          <select
            value={formData.kategori}
            onChange={(e) => onChange("kategori", e.target.value)}
          >
            {FILTERS.filter((f) => f.value !== "all").map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </label>

        <label className="project-field">
          <span>Link Preview (demo)</span>
          <input
            type="url"
            value={formData.preview_url}
            onChange={(e) => onChange("preview_url", e.target.value)}
            placeholder="https://..."
          />
        </label>

        <label className="project-field">
          <span>Link GitHub</span>
          <input
            type="url"
            value={formData.github_url}
            onChange={(e) => onChange("github_url", e.target.value)}
            placeholder="https://github.com/..."
          />
        </label>

        <label className="project-field project-field-full">
          <span>Deskripsi</span>
          <textarea
            rows="4"
            value={formData.deskripsi}
            onChange={(e) => onChange("deskripsi", e.target.value)}
            placeholder="Ceritakan singkat project ini"
            required
          />
        </label>

        <label className="project-field">
          <span>Fitur</span>
          <textarea
            rows="3"
            value={formData.fiturInput}
            onChange={(e) => onChange("fiturInput", e.target.value)}
            placeholder="Login, Dashboard, CRUD (pisahkan koma/enter)"
          />
        </label>

        <label className="project-field">
          <span>Tools</span>
          <textarea
            rows="3"
            value={formData.toolsInput}
            onChange={(e) => onChange("toolsInput", e.target.value)}
            placeholder="React, Supabase, Bootstrap"
          />
        </label>

        <div className="project-field">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        <label className="project-field custom-checkbox-wrapper">
          <select
            value={formData.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            <option value="completed">Completed</option>
            <option value="in repair">In Repair</option>
            <option value="on progress">On Progress</option>
            <option value="on going">On Going</option>
          </select>
        </label>

        {imagePreview && (
          <div className="project-field project-field-full thumbnail-preview-container">
            <span>Preview Thumbnail</span>
            <div className="thumbnail-preview">
              <img src={imagePreview} alt="Thumbnail preview" />
            </div>
          </div>
        )}
      </div>

      <div className="project-form-actions">
        <button
          type="button"
          className="btn btn-outline-modern"
          onClick={onBack}
        >
          Back
        </button>
        <button type="submit" className="btn btn-add" disabled={saving}>
          {saving ? "Menyimpan..." : submitLabel}
        </button>
      </div>

      {submitHint && <p className="project-form-title">{submitHint}</p>}
    </form>
  ); 
}

function ProjectDetailModal({ project, isAdmin, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const tools = project ? getProjectTools(project) : [];
  const features = project ? getFiturList(project) : [];
  const hasPreviewLink = hasLink(project?.preview_url);
  const hasGithubLink = hasLink(project?.github_url);

  useEffect(() => {
    if (!project) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.classList.add("modal-open");
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.paddingRight = "";
    };
  }, [project]);

  if (!project) {
    return null;
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

    setDeleteTarget(null);
    navigateToProjectSection(navigate);
  }

  const currentStatus = getProjectStatusMeta(project.status);

  return (
    <div className="project-modal-backdrop" onClick={onClose}>
      <div className="project-detail-modal" onClick={(event) => event.stopPropagation()}>

        <button type="button" className="project-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="project-modal-content">
          <div className="project-info-section" data-aos="fade-up"
            data-aos-duration="400">
            <button
              type="button"
              className="project-modal-close project-editor-back-btn"
              onClick={onClose}
            >
              <i className="bi bi-arrow-left"></i>
              Close
            </button>

            <div className="project-title-area">
              <h2>{project.nama}</h2>
              <span className="project-subtitle">
                {project.kategori === "landing-page" && "Landing Page Project"}
                {project.kategori === "web-app" && "Web Application"}
                {project.kategori === "ui-ux" && "UI/UX Design"}
              </span>
            </div>

            <div className="project-accent-line"></div>

            {tools.length > 0 && (
              <div className="project-tools-section">
                <p className="tools-label">Technologies Used</p>
                <div className="project-tools-tags">
                  {tools.map((tool, index) => (
                    <span key={index} className="tool-tag">
                      <i className="bi bi-gear-fill"></i>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="project-stats-grid">
              <div className="project-stat-card">
                <div className="project-stat-icon">
                  <i className="bi bi-code-slash"></i>
                </div>
                <div className="project-stat-info">
                  <span className="project-stat-value">{tools.length}</span>
                  <span className="project-stat-label">Total Teknologi</span>
                </div>
              </div>

              <div className="project-stat-card">
                <div className="project-stat-icon">
                  <i className="bi bi-layers"></i>
                </div>
                <div className="project-stat-info">
                  <span className="project-stat-value">{features.length}</span>
                  <span className="project-stat-label">Fitur Utama</span>
                </div>
              </div>
            </div>

            {features.length > 0 && (
              <div className="project-features-section">
                <div className="features-header">
                  <i className="bi bi-star"></i>
                  <h4>Key Features</h4>
                </div>
                <div className="features-list">
                  {features.slice(0, 10).map((feature, index) => (
                    <div key={index} className="feature-item">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          

          <div className="project-preview-section" data-aos="fade-up" data-aos-duration="700" data-aos-delay="100">
            <div className="project-preview-container">
              {project.file ? (
                <img src={project.file} alt={project.nama} />
              ) : (
                <div className="project-preview-placeholder">
                  No Preview Available
                </div>
              )}
            </div>

            <div className="project-description-wrapper">
              <p className="project-description">
                {project.deskripsi}
              </p>
            </div>

            <p className={`project-status-text ${currentStatus.class}`}>
              {currentStatus.text}
            </p>

            {(hasPreviewLink || hasGithubLink) && (
              <div className="project-action-grid">
                {hasPreviewLink && (
                  <a
                    href={project.preview_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-live-demo project-modal-link-btn"
                  >
                    <i className="bi bi-eye"></i>
                    Live Demo
                  </a>
                )}

                {hasGithubLink && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-learn-more project-modal-link-btn"
                  >
                    <i className="bi bi-github"></i>
                    Github
                  </a>
                )}
              </div>
            )}

            {isAdmin && (
              <div className="project-action-inline">
                <>
                  <Link
                    to={`/project/edit/${project.id}`}
                    className="btn btn-edit"
                    onClick={() => rememberSectionTarget("project")}
                  >
                    <i className="bi bi-pencil-square"></i>
                    Edit
                  </Link>

                  <button
                    type="button"
                    className="btn btn-delete"
                    onClick={() => setDeleteTarget(project)}
                    aria-label={`Delete ${project.nama}`}
                    title="Delete project"
                  >
                    <i className="bi bi-trash"></i>
                    Delete
                  </button>
                </>
              </div>
            )}
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        project={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}


function ProjectEditorPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = mode === "edit";
  const { role } = useAuth();
  const isAdmin = getIsAdmin(role);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function handleDelete(project) {
    const { error } = await supabase
      .from("Project")
      .delete()
      .eq("id", project.id);

    if (error) {
      console.error("Error deleting:", error);
      return;
    }

    setDeleteTarget(null);
    navigateToProjectSection(navigate);
  }


  useEffect(() => {
    if (!isEditMode || !id) {
      return;
    }

    let active = true;

    async function loadProject() {
      try {
        const project = await fetchProjectById(id);

        if (!active) return;

        setCurrentProject(project);
        setFormData({
          nama: project.nama ?? "",
          deskripsi: project.deskripsi ?? "",
          fiturInput: getFiturList(project).join(", "),
          toolsInput: getProjectTools(project).join(", "),
          kategori: project.kategori ?? "landing-page",
          file: null,
          status: normalizeStatus(project.status),
          preview_url: project.preview_url ?? "",
          github_url: project.github_url ?? "",
        });
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProject();

    return () => {
      active = false;
    };
  }, [id, isEditMode]);

  useEffect(() => {
    function handleScroll(e) {
      const modal = document.querySelector(".project-detail-modal");

      if (modal && !modal.contains(e.target)) {
        e.preventDefault();
      }
    }

    document.addEventListener("wheel", handleScroll, { passive: false });
    document.addEventListener("touchmove", handleScroll, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleScroll);
      document.removeEventListener("touchmove", handleScroll);
    };
  }, []);

  function updateForm(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const fiturList = parseTools(formData.fiturInput);

    if (fiturList.length < 3) {
      alert("Minimal fitur harus 3!");
      return;
    }

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

      navigateToProjectSection(navigate);
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
        <div className={`project-admin-panel project-editor-panel ${isEditMode ? "edit-mode" : "add-mode"}`}>
          <div className="project-admin-header project-editor-header">
            <div>
              <h3>{isEditMode ? "Edit Project" : "Add Project"}</h3>
            </div>

            <div className="project-editor-actions">
              <button
                type="button"
                className="btn btn-outline-modern project-editor-back-btn"
                onClick={() => navigateToProjectSection(navigate)}
              >
                <i className="bi bi-arrow-left"></i>
                Back
              </button>
              {isEditMode && currentProject && (
                <button
                  type="button"
                  className="btn project-editor-delete-btn"
                  onClick={() => setDeleteTarget(currentProject)}
                >
                  <i className="bi bi-trash"></i>
                  Delete
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="project-editor-stage is-loading">
              <div className="project-editor-loading">
              <div className="project-editor-loader"></div>
              <p>Memuat data project...</p>
              </div>
            </div>
          ) : (
              <div className="project-editor-stage is-ready">
                <ProjectForm
                formData={formData}
                onChange={updateForm}
                onSubmit={handleSubmit}
                saving={saving}
                submitLabel={isEditMode ? "Save Change" : "Add Project"}
                submitHint={isEditMode ? `Sedang mengedit: ${currentProject?.nama ?? "-"}` : "Form ini akan menambahkan project baru."}
                existingImageUrl={currentProject?.file || null}
                onBack={() => navigateToProjectSection(navigate)}
              />
              </div>
          )}
        </div>
      </div>
      <DeleteConfirmModal
        project={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { role } = useAuth();

  const location = useLocation();

  useEffect(() => {
    const hashTarget = location.hash.replace("#", "");

    // 🔥 kalau ada hash → JANGAN SENTUH sessionStorage
    if (isKnownSectionId(hashTarget)) {
      const timer = setTimeout(() => {
        scrollToSectionId(hashTarget, { behavior: "smooth" });
      }, 120);

      return () => clearTimeout(timer);
    }

    // baru fallback ke memory
    const rememberedTarget = consumeSectionTarget();

    if (rememberedTarget) {
      const timer = setTimeout(() => {
        scrollToSectionId(rememberedTarget, { behavior: "smooth" });
      }, 120);

      return () => clearTimeout(timer);
    }

    if (!targetId) return;

    const timer = setTimeout(() => {
      scrollToSectionId(targetId, { behavior: "smooth" });
    }, 120);

    return () => clearTimeout(timer);
  }, [location.hash, location.pathname]);
  
  const isAdmin =
    role === "admin" && location.pathname.startsWith("/admin");

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

  useEffect(() => {
    if (loading) {
      return;
    }

    const refreshAos = window.requestAnimationFrame(() => {
      AOS.refreshHard();
    });

    return () => window.cancelAnimationFrame(refreshAos);
  }, [loading, activeFilter, currentPage, selectedProject]);

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

    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    setDeleteTarget(null);
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
          <div className="section-title animate-fade-in-up" data-aos="fade-up"
            data-aos-duration="700"
            data-aos-easing="ease-out">
            <h2 className="highlight">My Projects</h2>
            <p className="highlight-text mt-3">A collection of projects resulting from my learning and exploration in the world of web development.</p>
          </div>

          {isAdmin && (
            <div className="project-top-actions" data-aos="fade-up" data-aos-delay="100">
              <Link
                to="/project/add"
                className="btn btn-add"
                onClick={() => rememberSectionTarget("project")}
              >
                <span className="icon-plus">
                  <i className="bi bi-plus-lg"></i>
                </span>
                Add Project
              </Link>
            </div>
          )}

          <div className="card-filter animate-fade-in-up" data-aos="fade-up"
            data-aos-delay="100"
            data-aos-duration="500">
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
            <div className="project-loading-panel" data-aos="zoom-in-up">
              <div className="project-loading-spinner"></div>
              <p className="project-empty">Project is loading...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <p className="project-empty">There are no projects in this category yet.</p>
          ) : (
            <div className="card-container mt-5">
              {paginatedProjects.map((project, index) => {
                const showPreview = hasLink(project.preview_url);
                const showGithub = hasLink(project.github_url);
                const linkCount = Number(showPreview) + Number(showGithub);
                const hasFooterActions = true;
                const statusMeta = getProjectStatusMeta(project.status);

                return (
                <article
                  key={project.id}
                  className="card project-card"
                    data-aos="fade-up"
                    data-aos-delay={index * 60}
                    data-aos-duration="600"
                    data-aos-easing="ease-out"
                >
                  <div className="project-visual-trigger" aria-hidden="true">
                    <div className="img-wrapper">
                      <span className={`project-status-badge ${statusMeta.class}`}>
                        {statusMeta.text}
                      </span>

                      {project.file ? (
                        <img src={project.file} alt={project.nama} className="project-image" />
                      ) : (
                        <div className="project-placeholder">No Image</div>
                      )}
                    </div>
                  </div>

                  <div className="card-body">
                    <h5 className="card-title">
                      <button
                        type="button"
                        className="project-title-trigger"
                        onClick={() => setSelectedProject(project)}
                      >
                        {project.nama}
                      </button>
                    </h5>
                    <p className="card-text">{project.deskripsi}</p>

                    {hasFooterActions && (
                      <div className="project-card-footer">
                        <div className="project-card-actions-stack">
                            {linkCount > 0 && (
                              <div className={`project-link-actions ${linkCount === 1 ? "single-link" : "dual-link"}`}>
                                {showPreview && (
                                  <a href={project.preview_url} target="_blank" rel="noreferrer" className="btn btn-preview">
                                    <i className="bi bi-eye"></i> Preview
                                  </a>
                                )}
                                <button type="button" className="btn btn-detail" onClick={() => setSelectedProject(project)}>
                                  <i className="bi bi-info-circle"></i> Detail
                                </button>
                              </div>
                            )}

                            {linkCount === 0 && (
                              <div className="project-link-actions single-link">
                                <button type="button" className="btn btn-detail" onClick={() => setSelectedProject(project)}>
                                  <i className="bi bi-info-circle"></i> Detail
                                </button>
                              </div>
                            )}

                          {isAdmin && (
                            <div className="project-admin-actions">
                              <Link
                                to={`/project/edit/${project.id}`}
                                className="btn btn-edit"
                                onClick={() => rememberSectionTarget("project")}
                                aria-label={`Edit ${project.nama}`}
                                title="Edit project"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </Link>

                              <button
                                type="button"
                                className="btn btn-delete"
                                onClick={() => setDeleteTarget(project)}
                                aria-label={`Delete ${project.nama}`}
                                title="Delete project"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )})}
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
        onClose={() => {
          setSelectedProject(null);

          if (isAdmin) {
            scrollToSectionId("project", { behavior: "smooth" });
          } else {
            scrollToSectionId("project", { behavior: "smooth" });
          }
        }}
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
  useEffect(() => {
    if (!project) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [project]);

  if (!project) return null;

  return (
    <div className="delete-modal-backdrop" onClick={onCancel}>
      <div className="delete-modal-card" onClick={(e) => e.stopPropagation()} data-aos="zoom-in-up">
        <div className="delete-modal-header">
          <button
            type="button"
            className="delete-close-btn"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <div className="delete-modal-body">
          <p>
            Yakin mau hapus project <strong>{project.nama}</strong>?
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
            Data yang dihapus tidak dapat dikembalikan.
          </p>
        </div>

        <div className="delete-modal-footer">
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
