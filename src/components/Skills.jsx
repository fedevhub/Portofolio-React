import { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/Skills.css";
import supabase from "../assets/supabase-client";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

const INITIAL_FORM = {
  nama: "",
  icon: "",
  color: "#ffffff",
};


const SKILL_CARD_AOS = ["fade-up"];

function sortSkillsOldestFirst(items) {
  return [...items].sort((a, b) => {
    const createdIdA = Number(a.created_id);
    const createdIdB = Number(b.created_id);

    if (!Number.isNaN(createdIdA) && !Number.isNaN(createdIdB)) {
      return createdIdA - createdIdB;
    }

    const createdAtA = Date.parse(a.created_at ?? "");
    const createdAtB = Date.parse(b.created_at ?? "");

    if (!Number.isNaN(createdAtA) && !Number.isNaN(createdAtB)) {
      return createdAtA - createdAtB;
    }

    return Number(a.id ?? 0) - Number(b.id ?? 0);
  });
}

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768
  );
  const [visibleCount, setVisibleCount] = useState(
    () => (typeof window !== "undefined" && window.innerWidth <= 768 ? 6 : 12)
  );
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { role } = useAuth();
  const location = useLocation();
  const lastBaseVisibleRef = useRef(isMobile ? 6 : 12);

  const isAdmin = role === "admin" && location.pathname.startsWith("/admin");
  const maxVisible = isMobile ? 6 : 12;
  const displayedSkills = skills.slice(0, visibleCount);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-in-out",
      once: true,
      offset: 40,
    });
  }, []);

  // responsive handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const nextBase = mobile ? 6 : 12;
      const prevBase = lastBaseVisibleRef.current;

      setIsMobile(mobile);

      setVisibleCount((current) => {
        if (current <= prevBase) return nextBase;
        return Math.max(current, nextBase);
      });

      lastBaseVisibleRef.current = nextBase;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // load data
  useEffect(() => {
    let active = true;

    async function loadSkills() {
      const { data, error } = await supabase
        .from("Skills")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && active) {
        setSkills(sortSkillsOldestFirst(data || []));
      }
    }

    loadSkills();
    return () => (active = false);
  }, []);

  // refresh AOS
  useEffect(() => {
    AOS.refreshHard();
  }, [skills, deleteTarget, editId, visibleCount]);

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditId(null);
  }

  async function handleAdd() {
    if (!form.nama || !form.icon) return;

    const { data, error } = await supabase
      .from("Skills")
      .insert([form])
      .select()
      .single();

    if (!error && data) {
      setSkills((prev) => sortSkillsOldestFirst([...prev, data]));
      setVisibleCount((c) => Math.max(c + 1, maxVisible));
      resetForm();
    }
  }

  async function handleDelete(id) {
    await supabase.from("Skills").delete().eq("id", id);
    setSkills((prev) => prev.filter((item) => item.id !== id));
    setDeleteTarget(null);
  }

  function handleEdit(skill) {
    setForm({
      nama: skill.nama,
      icon: skill.icon,
      color: skill.color,
    });
    setEditId(skill.id);
  }

  async function handleUpdate() {
    const { error } = await supabase
      .from("Skills")
      .update(form)
      .eq("id", editId);

    if (!error) {
      setSkills((prev) =>
        sortSkillsOldestFirst(
          prev.map((item) =>
            item.id === editId ? { ...item, ...form } : item
          )
        )
      );
      resetForm();
    }
  }

  return (
    <section id="tools" className="skills-section">
      <div className="container">

        {/* 🔥 HEADING (smooth hierarchy) */}
        <div
          className="section-heading"
          data-aos="fade-up"
          data-aos-duration="800"
          data-aos-easing="ease-out-cubic"
        >
          <h1
            className="skills-title"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Tools & Technologies
          </h1>

          <p
            className="section-subtitle"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            The tools and technologies I’m currently learning and using to build applications and websites.
          </p>
        </div>

        {/* 🔥 FORM ADMIN */}
        {isAdmin && (
          <div
            className="skills-form"
            data-aos="fade-up"
            data-aos-delay="150"
            data-aos-duration="700"
          >
            <input
              type="text"
              placeholder="Skill name"
              value={form.nama}
              onChange={(e) =>
                setForm((c) => ({ ...c, nama: e.target.value }))
              }
            />

            <input
              type="text"
              placeholder="Icon name"
              value={form.icon}
              onChange={(e) =>
                setForm((c) => ({ ...c, icon: e.target.value }))
              }
            />

            <div className="color-input-group">
              <input
                type="color"
                value={form.color}
                onChange={(e) =>
                  setForm((c) => ({ ...c, color: e.target.value }))
                }
              />

              <input
                type="text"
                value={form.color}
                onChange={(e) =>
                  setForm((c) => ({ ...c, color: e.target.value }))
                }
              />
            </div>

            {editId ? (
              <>
                <button className="btn btn-update" onClick={handleUpdate}>
                  Update
                </button>
                <button className="btn btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn btn-add" onClick={handleAdd}>
                <i className="bi bi-plus-lg"></i>
                Add Skills
              </button>
            )}
          </div>
        )}

        {/* 🔥 SKILL GRID */}
        <div className="skills-grid">
          <div className="skills-row">
            {displayedSkills.map((skill, index) => (
              <div
                className="skill-card"
                key={skill.id}
                data-aos="fade-up"
                data-aos-delay="0"
                data-aos-duration="700"
                data-aos-easing="ease-out-cubic"
              >
                <div
                  className="skill-icon"
                  style={{ "--icon-color": skill.color }}
                >
                  <i className={skill.icon}></i>
                </div>

                <div className="skill-name">{skill.nama}</div>

                {isAdmin && (
                  <div className="skill-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(skill)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>

                    <button
                      className="btn btn-delete"
                      onClick={() => setDeleteTarget(skill)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 SHOW MORE */}
        {visibleCount < skills.length && (
          <div
            className="show-more-wrapper"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            <button
              className="btn btn-show-more"
              onClick={() =>
                setVisibleCount((c) => c + maxVisible)
              }
            >
              Show More
              <i className="bi bi-arrow-down"></i>
            </button>
          </div>
        )}
      </div>

      <DeleteSkillModal
        skill={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget.id)}
      />
    </section>
  );
}

function DeleteSkillModal({ skill, onCancel, onConfirm }) {
  useEffect(() => {
    if (!skill) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [skill]);

  if (!skill) return null;

  return (
    <div className="skill-delete-backdrop" onClick={onCancel}>
      <div
        className="skill-delete-modal"
        onClick={(e) => e.stopPropagation()}
        data-aos="zoom-in"
        data-aos-duration="500"
        data-aos-easing="ease-out-cubic"
      >
        <button className="skill-delete-close" onClick={onCancel}>
          ×
        </button>

        <div className="skill-delete-body">
          <p>
            Hapus skill <strong>{skill.nama}</strong>?
          </p>
          <span>Data tidak bisa dikembalikan.</span>
        </div>

        <div className="skill-delete-actions">
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}