import { useEffect, useState } from "react";
import "../styles/Skills.css";
import supabase from "../assets/supabase-client";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";


export default function Skills() {
    const [skills, setSkills] = useState([]);
    const [form, setForm] = useState({
        nama: "",
        icon: "",
        color: "#ffffff",
    });

    const { role } = useAuth();

    const location = useLocation();

    const isAdmin =
        role === "admin" && location.pathname.startsWith("/admin");

    const [editId, setEditId] = useState(null);

    // FETCH FROM DB
    useEffect(() => {
        fetchSkillsFromDb();
    }, []);

    async function fetchSkillsFromDb() {
        const { data, error } = await supabase
            .from("Skills")
            .select("*")
            .order("id", { ascending: false });

        if (!error) setSkills(data || []);
    }

    // ADD
    const handleAdd = async () => {
        if (!form.nama || !form.icon) return;

        const { data, error } = await supabase
            .from("Skills")
            .insert([form])
            .select();

        if (!error) {
            setSkills([data[0], ...skills]);
            setForm({ nama: "", icon: "", color: "#ffffff" });
        }
    };

    // DELETE
    const handleDelete = async (id) => {
        await supabase.from("Skills").delete().eq("id", id);
        setSkills(skills.filter((item) => item.id !== id));
    };

    // EDIT
    const handleEdit = (skill) => {
        setForm({
            nama: skill.nama,
            icon: skill.icon,
            color: skill.color,
        });
        setEditId(skill.id);
    };

    // UPDATE
    const handleUpdate = async () => {
        const { error } = await supabase
            .from("Skills")
            .update(form)
            .eq("id", editId);

        if (!error) {
            setSkills(
                skills.map((item) =>
                    item.id === editId ? { ...item, ...form } : item
                )
            );

            setEditId(null);
            setForm({ nama: "", icon: "", color: "#ffffff" });
        }
    };

    return (
        <section id="skills" className="skills-section">
            <div className="container">

                {/* HEADER */}
                <div className="section-heading">
                    <h1 className="skills-title">My Skills</h1>
                    <p className="section-subtitle">
                        The tools and technologies I use to build applications and websites.
                    </p>
                </div>

                {isAdmin && (
                    <div className="skills-form">

                        <input
                            type="text"
                            placeholder="Skill name"
                            value={form.nama}
                            onChange={(e) =>
                                setForm({ ...form, nama: e.target.value })
                            }
                        />

                        <input
                            type="text"
                            placeholder="Icon name"
                            value={form.icon}
                            onChange={(e) =>
                                setForm({ ...form, icon: e.target.value })
                            }
                        />

                        <div className="color-input-group">

                            <input
                                type="color"
                                value={form.color}
                                onChange={(e) =>
                                    setForm({ ...form, color: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                placeholder="#ffffff"
                                value={form.color}
                                onChange={(e) =>
                                    setForm({ ...form, color: e.target.value })
                                }
                            />

                        </div>

                        {editId ? (
                            <button className="btn btn-update" onClick={handleUpdate}>
                                Update
                            </button>
                        ) : (
                            <button className="btn btn-add" onClick={handleAdd}>
                                <i className="bi bi-plus-lg"></i>Add Skills
                            </button>
                        )}

                        {editId && (
                            <button
                                className="btn btn-cancel"
                                onClick={() => {
                                    setEditId(null);
                                    setForm({ nama: "", icon: "", color: "#ffffff" });
                                }}
                            >
                                Cancel
                            </button>
                        )}

                    </div>
                )}

                <div className="skills-grid">

                    <div className="skills-row">
                        {skills.map((skill) => (
                            <div className="skill-card" key={skill.id}>

                                {/* ICON */}
                                <div
                                    className="skill-icon"
                                    style={{ "--icon-color": skill.color }}
                                >
                                    <i className={skill.icon}></i>
                                </div>

                                {/* NAME */}
                                <div className="skill-name">
                                    {skill.nama}
                                </div>

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
                                            onClick={() => handleDelete(skill.id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
}